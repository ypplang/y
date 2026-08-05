#include "ast.h"
#include <stdlib.h>

ASTNode* ast_create_node(ASTNodeType type) {
    ASTNode* node = (ASTNode*)calloc(1, sizeof(ASTNode));
    if (node) {
        node->type = type;
    }
    return node;
}

void ast_free_node(ASTNode* node) {
    if (!node) return;

    switch (node->type) {
        case AST_STRING:
            free(node->data.string_val);
            break;

        case AST_IDENTIFIER:
            free(node->data.identifier_name);
            break;

        case AST_BINARY:
            free(node->data.binary.op);
            ast_free_node(node->data.binary.left);
            ast_free_node(node->data.binary.right);
            break;

        case AST_VAR_DECL:
            free(node->data.var_decl.name);
            ast_free_node(node->data.var_decl.initializer);
            break;

        case AST_ALIAS_DECL:
            free(node->data.alias_decl.alias_name);
            free(node->data.alias_decl.target_name);
            break;

        case AST_ASSIGNMENT:
            free(node->data.assignment.name);
            ast_free_node(node->data.assignment.value);
            break;

        case AST_CALL:
            free(node->data.call.callee);
            for (size_t i = 0; i < node->data.call.arg_count; i++) {
                ast_free_node(node->data.call.args[i]);
            }
            free(node->data.call.args);
            break;

        case AST_IF:
            ast_free_node(node->data.if_stmt.condition);
            ast_free_node(node->data.if_stmt.then_branch);
            ast_free_node(node->data.if_stmt.else_branch);
            break;

        case AST_RETURN:
            ast_free_node(node->data.return_stmt.value);
            break;

        case AST_BLOCK:
            for (size_t i = 0; i < node->data.block.stmt_count; i++) {
                ast_free_node(node->data.block.statements[i]);
            }
            free(node->data.block.statements);
            break;

        case AST_FUNC_DECL:
            free(node->data.func_decl.name);
            for (size_t i = 0; i < node->data.func_decl.param_count; i++) {
                free(node->data.func_decl.params[i]);
            }
            free(node->data.func_decl.params);
            ast_free_node(node->data.func_decl.body);
            break;

        case AST_ALLOC:
            ast_free_node(node->data.alloc_expr.size_expr);
            break;

        case AST_FREE:
            ast_free_node(node->data.free_stmt.target_ptr);
            break;

        case AST_CAST:
            free(node->data.cast_expr.target_type);
            ast_free_node(node->data.cast_expr.expr);
            break;

        case AST_SIZEOF:
            free(node->data.sizeof_expr.target_type);
            break;

        case AST_PROGRAM:
            for (size_t i = 0; i < node->data.program.stmt_count; i++) {
                ast_free_node(node->data.program.statements[i]);
            }
            free(node->data.program.statements);
            break;

        case AST_NUMBER:
        default:
            break;
    }

    free(node);
}