#ifndef Y_AST_H
#define Y_AST_H

#include <stdbool.h>
#include <stddef.h>

typedef enum {
    AST_NUMBER,
    AST_STRING,
    AST_IDENTIFIER,
    AST_BINARY,
    AST_VAR_DECL,
    AST_ALIAS_DECL,
    AST_ASSIGNMENT,
    AST_CALL,
    AST_IF,
    AST_RETURN,
    AST_BLOCK,
    AST_FUNC_DECL,
    AST_ALLOC,
    AST_FREE,
    AST_CAST,
    AST_SIZEOF,
    AST_PROGRAM
} ASTNodeType;

typedef struct ASTNode ASTNode;

struct ASTNode {
    ASTNodeType type;
    union {
        double number_val;
        char* string_val;
        char* identifier_name;

        struct {
            char* op;
            ASTNode* left;
            ASTNode* right;
        } binary;

        struct {
            char* name;
            ASTNode* initializer;
        } var_decl;

        struct {
            char* alias_name;
            char* target_name;
        } alias_decl;

        struct {
            char* name;
            ASTNode* value;
        } assignment;

        struct {
            char* callee;
            ASTNode** args;
            size_t arg_count;
        } call;

        struct {
            ASTNode* condition;
            ASTNode* then_branch;
            ASTNode* else_branch;
        } if_stmt;

        struct {
            ASTNode* value;
        } return_stmt;

        struct {
            ASTNode** statements;
            size_t stmt_count;
        } block;

        struct {
            char* name;
            char** params;
            size_t param_count;
            ASTNode* body;
            bool is_inline;
        } func_decl;

        struct {
            ASTNode* size_expr;
        } alloc_expr;

        struct {
            ASTNode* target_ptr;
        } free_stmt;

        struct {
            char* target_type;
            ASTNode* expr;
        } cast_expr;

        struct {
            char* target_type;
        } sizeof_expr;

        struct {
            ASTNode** statements;
            size_t stmt_count;
        } program;
    } data;
};

ASTNode* ast_create_node(ASTNodeType type);
void ast_free_node(ASTNode* node);

#endif