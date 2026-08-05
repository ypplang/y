#include "parser.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static char* duplicate_string(const char* start, size_t length) {
    char* str = (char*)malloc(length + 1);
    memcpy(str, start, length);
    str[length] = '\0';
    return str;
}

static void advance_parser(Parser* parser) {
    parser->previous = parser->current;
    parser->current = lexer_next_token(parser->lexer);
}

static bool check(Parser* parser, TokenType type) {
    return parser->current.type == type;
}

static bool match(Parser* parser, TokenType type) {
    if (!check(parser, type)) return false;
    advance_parser(parser);
    return true;
}

static void consume(Parser* parser, TokenType type, const char* message) {
    if (parser->current.type == type) {
        advance_parser(parser);
        return;
    }
    printf("Parser Error [line %size_t]: %s\n", parser->current.line, message);
    parser->had_error = true;
}

static ASTNode* create_node(ASTNodeType type) {
    ASTNode* node = (ASTNode*)calloc(1, sizeof(ASTNode));
    node->type = type;
    return node;
}

static ASTNode* parse_expression(Parser* parser);
static ASTNode* parse_statement(Parser* parser);

static ASTNode* parse_primary(Parser* parser) {
    if (match(parser, TOKEN_NUMBER)) {
        ASTNode* node = create_node(AST_NUMBER);
        char* num_str = duplicate_string(parser->previous.start, parser->previous.length);
        node->data.number_val = atof(num_str);
        free(num_str);
        return node;
    }

    if (match(parser, TOKEN_STRING)) {
        ASTNode* node = create_node(AST_STRING);
        node->data.string_val = duplicate_string(parser->previous.start, parser->previous.length);
        return node;
    }

    if (match(parser, TOKEN_IDENTIFIER)) {
        char* name = duplicate_string(parser->previous.start, parser->previous.length);

        if (match(parser, TOKEN_OPEN_PAREN)) {
            ASTNode* node = create_node(AST_CALL);
            node->data.call.callee = name;
            node->data.call.args = NULL;
            node->data.call.arg_count = 0;

            if (!check(parser, TOKEN_CLOSE_PAREN)) {
                do {
                    node->data.call.arg_count++;
                    node->data.call.args = (ASTNode**)realloc(
                        node->data.call.args, sizeof(ASTNode*) * node->data.call.arg_count
                    );
                    node->data.call.args[node->data.call.arg_count - 1] = parse_expression(parser);
                } while (match(parser, TOKEN_COMMA));
            }

            consume(parser, TOKEN_CLOSE_PAREN, "Expected ')' after function arguments.");
            return node;
        }

        ASTNode* node = create_node(AST_IDENTIFIER);
        node->data.identifier_name = name;
        return node;
    }

    if (match(parser, TOKEN_ALLOC)) {
        consume(parser, TOKEN_OPEN_PAREN, "Expected '(' after alloc.");
        ASTNode* node = create_node(AST_ALLOC);
        node->data.alloc_expr.size_expr = parse_expression(parser);
        consume(parser, TOKEN_CLOSE_PAREN, "Expected ')' after alloc size expression.");
        return node;
    }

    if (match(parser, TOKEN_SIZEOF)) {
        consume(parser, TOKEN_OPEN_PAREN, "Expected '(' after sizeof.");
        consume(parser, TOKEN_IDENTIFIER, "Expected type identifier inside sizeof.");
        ASTNode* node = create_node(AST_SIZEOF);
        node->data.sizeof_expr.target_type = duplicate_string(parser->previous.start, parser->previous.length);
        consume(parser, TOKEN_CLOSE_PAREN, "Expected ')' after sizeof target.");
        return node;
    }

    if (match(parser, TOKEN_CAST)) {
        consume(parser, TOKEN_OPEN_PAREN, "Expected '(' after cast.");
        consume(parser, TOKEN_IDENTIFIER, "Expected target type identifier for cast.");
        char* target_type = duplicate_string(parser->previous.start, parser->previous.length);
        consume(parser, TOKEN_COMMA, "Expected ',' after cast type.");

        ASTNode* node = create_node(AST_CAST);
        node->data.cast_expr.target_type = target_type;
        node->data.cast_expr.expr = parse_expression(parser);

        consume(parser, TOKEN_CLOSE_PAREN, "Expected ')' after cast expression.");
        return node;
    }

    if (match(parser, TOKEN_OPEN_PAREN)) {
        ASTNode* expr = parse_expression(parser);
        consume(parser, TOKEN_CLOSE_PAREN, "Expected ')' after expression.");
        return expr;
    }

    parser->had_error = true;
    return NULL;
}

static ASTNode* parse_binary(Parser* parser) {
    ASTNode* left = parse_primary(parser);

    while (match(parser, TOKEN_PLUS) || match(parser, TOKEN_MINUS) ||
           match(parser, TOKEN_STAR) || match(parser, TOKEN_SLASH) ||
           match(parser, TOKEN_EQUAL_EQUAL) || match(parser, TOKEN_NOT_EQUAL)) {
        char* op = duplicate_string(parser->previous.start, parser->previous.length);
        ASTNode* right = parse_primary(parser);

        ASTNode* binary_node = create_node(AST_BINARY);
        binary_node->data.binary.op = op;
        binary_node->data.binary.left = left;
        binary_node->data.binary.right = right;
        left = binary_node;
    }

    return left;
}

static ASTNode* parse_expression(Parser* parser) {
    return parse_binary(parser);
}

static ASTNode* parse_statement(Parser* parser) {
    if (match(parser, TOKEN_VAR)) {
        consume(parser, TOKEN_IDENTIFIER, "Expected variable name after 'var'.");
        char* name = duplicate_string(parser->previous.start, parser->previous.length);

        ASTNode* init = NULL;
        if (match(parser, TOKEN_ASSIGN)) {
            init = parse_expression(parser);
        }

        ASTNode* node = create_node(AST_VAR_DECL);
        node->data.var_decl.name = name;
        node->data.var_decl.initializer = init;
        return node;
    }

    if (match(parser, TOKEN_ALIAS)) {
        consume(parser, TOKEN_IDENTIFIER, "Expected alias name after 'alias'.");
        char* alias_name = duplicate_string(parser->previous.start, parser->previous.length);

        consume(parser, TOKEN_ASSIGN, "Expected '=' in alias declaration.");

        consume(parser, TOKEN_IDENTIFIER, "Expected target identifier after '='.");
        char* target_name = duplicate_string(parser->previous.start, parser->previous.length);

        ASTNode* node = create_node(AST_ALIAS_DECL);
        node->data.alias_decl.alias_name = alias_name;
        node->data.alias_decl.target_name = target_name;
        return node;
    }

    if (match(parser, TOKEN_FREE)) {
        consume(parser, TOKEN_OPEN_PAREN, "Expected '(' after free.");
        ASTNode* target = parse_expression(parser);
        consume(parser, TOKEN_CLOSE_PAREN, "Expected ')' after free pointer expression.");

        ASTNode* node = create_node(AST_FREE);
        node->data.free_stmt.target_ptr = target;
        return node;
    }

    if (match(parser, TOKEN_IF)) {
        consume(parser, TOKEN_OPEN_PAREN, "Expected '(' after 'if'.");
        ASTNode* cond = parse_expression(parser);
        consume(parser, TOKEN_CLOSE_PAREN, "Expected ')' after if condition.");

        ASTNode* then_br = parse_statement(parser);
        ASTNode* else_br = NULL;

        if (match(parser, TOKEN_ELSE)) {
            else_br = parse_statement(parser);
        }

        ASTNode* node = create_node(AST_IF);
        node->data.if_stmt.condition = cond;
        node->data.if_stmt.then_branch = then_br;
        node->data.if_stmt.else_branch = else_br;
        return node;
    }

    if (match(parser, TOKEN_RETURN)) {
        ASTNode* val = NULL;
        if (!check(parser, TOKEN_CLOSE_BRACE) && !check(parser, TOKEN_EOF)) {
            val = parse_expression(parser);
        }
        ASTNode* node = create_node(AST_RETURN);
        node->data.return_stmt.value = val;
        return node;
    }

    if (match(parser, TOKEN_OPEN_BRACE)) {
        ASTNode* block = create_node(AST_BLOCK);
        block->data.block.statements = NULL;
        block->data.block.stmt_count = 0;

        while (!check(parser, TOKEN_CLOSE_BRACE) && !check(parser, TOKEN_EOF)) {
            block->data.block.stmt_count++;
            block->data.block.statements = (ASTNode**)realloc(
                block->data.block.statements, sizeof(ASTNode*) * block->data.block.stmt_count
            );
            block->data.block.statements[block->data.block.stmt_count - 1] = parse_statement(parser);
        }

        consume(parser, TOKEN_CLOSE_BRACE, "Expected '}' at block end.");
        return block;
    }

    return parse_expression(parser);
}

void parser_init(Parser* parser, Lexer* lexer) {
    parser->lexer = lexer;
    parser->had_error = false;
    advance_parser(parser);
}

ASTNode* parse_program(Parser* parser) {
    ASTNode* program = create_node(AST_PROGRAM);
    program->data.program.statements = NULL;
    program->data.program.stmt_count = 0;

    while (!check(parser, TOKEN_EOF)) {
        program->data.program.stmt_count++;
        program->data.program.statements = (ASTNode**)realloc(
            program->data.program.statements, sizeof(ASTNode*) * program->data.program.stmt_count
        );
        program->data.program.statements[program->data.program.stmt_count - 1] = parse_statement(parser);
    }

    return program;
}

void free_ast(ASTNode* node) {
    if (!node) return;
    free(node);
}