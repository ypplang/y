#ifndef Y_EVAL_H
#define Y_EVAL_H

#include "ast.h"

typedef enum {
    VAL_NUMBER,
    VAL_STRING,
    VAL_POINTER,
    VAL_NULL
} ValueType;

typedef struct {
    ValueType type;
    union {
        double number;
        char* string;
        void* ptr;
    } as;
} Value;

typedef struct Symbol {
    char* name;
    Value value;
    char* alias_target;
    struct Symbol* next;
} Symbol;

typedef struct Environment {
    Symbol* head;
    struct Environment* parent;
} Environment;

Environment* env_create(Environment* parent);
void env_free(Environment* env);

void env_set_var(Environment* env, const char* name, Value val);
void env_set_alias(Environment* env, const char* alias_name, const char* target_name);
bool env_get_var(Environment* env, const char* name, Value* out_val);

Value eval_node(ASTNode* node, Environment* env);

#endif