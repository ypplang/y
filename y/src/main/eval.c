#include "eval.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

Environment* env_create(Environment* parent) {
    Environment* env = (Environment*)malloc(sizeof(Environment));
    env->head = NULL;
    env->parent = parent;
    return env;
}

void env_free(Environment* env) {
    Symbol* current = env->head;
    while (current) {
        Symbol* next = current->next;
        free(current->name);
        if (current->value.type == VAL_STRING) {
            free(current->value.as.string);
        }
        if (current->alias_target) {
            free(current->alias_target);
        }
        free(current);
        current = next;
    }
    free(env);
}

static Symbol* find_symbol(Environment* env, const char* name) {
    for (Environment* e = env; e != NULL; e = e->parent) {
        for (Symbol* s = e->head; s != NULL; s = s->next) {
            if (strcmp(s->name, name) == 0) {
                return s;
            }
        }
    }
    return NULL;
}

void env_set_var(Environment* env, const char* name, Value val) {
    Symbol* existing = find_symbol(env, name);
    if (existing) {
        if (existing->value.type == VAL_STRING) free(existing->value.as.string);
        existing->value = val;
        return;
    }

    Symbol* sym = (Symbol*)malloc(sizeof(Symbol));
    sym->name = strdup(name);
    sym->value = val;
    sym->alias_target = NULL;
    sym->next = env->head;
    env->head = sym;
}

void env_set_alias(Environment* env, const char* alias_name, const char* target_name) {
    Symbol* sym = (Symbol*)malloc(sizeof(Symbol));
    sym->name = strdup(alias_name);
    sym->value.type = VAL_NULL;
    sym->alias_target = strdup(target_name);
    sym->next = env->head;
    env->head = sym;
}

bool env_get_var(Environment* env, const char* name, Value* out_val) {
    Symbol* sym = find_symbol(env, name);
    if (!sym) return false;

    if (sym->alias_target) {
        return env_get_var(env, sym->alias_target, out_val);
    }

    *out_val = sym->value;
    return true;
}

Value eval_node(ASTNode* node, Environment* env) {
    Value result = { VAL_NULL, { .number = 0 } };
    if (!node) return result;

    switch (node->type) {
        case AST_NUMBER:
            result.type = VAL_NUMBER;
            result.as.number = node->data.number_val;
            break;

        case AST_STRING:
            result.type = VAL_STRING;
            result.as.string = strdup(node->data.string_val);
            break;

        case AST_IDENTIFIER: {
            if (!env_get_var(env, node->data.identifier_name, &result)) {
                printf("Runtime Error: Undefined identifier '%s'\n", node->data.identifier_name);
            }
            break;
        }

        case AST_VAR_DECL: {
            Value init_val = { VAL_NULL, { .number = 0 } };
            if (node->data.var_decl.initializer) {
                init_val = eval_node(node->data.var_decl.initializer, env);
            }
            env_set_var(env, node->data.var_decl.name, init_val);
            break;
        }

        case AST_ALIAS_DECL: {
            env_set_alias(env, node->data.alias_decl.alias_name, node->data.alias_decl.target_name);
            break;
        }

        case AST_BINARY: {
            Value left = eval_node(node->data.binary.left, env);
            Value right = eval_node(node->data.binary.right, env);

            if (left.type == VAL_NUMBER && right.type == VAL_NUMBER) {
                result.type = VAL_NUMBER;
                if (strcmp(node->data.binary.op, "+") == 0) result.as.number = left.as.number + right.as.number;
                else if (strcmp(node->data.binary.op, "-") == 0) result.as.number = left.as.number - right.as.number;
                else if (strcmp(node->data.binary.op, "*") == 0) result.as.number = left.as.number * right.as.number;
                else if (strcmp(node->data.binary.op, "/") == 0) result.as.number = left.as.number / right.as.number;
                else if (strcmp(node->data.binary.op, "==") == 0) result.as.number = (left.as.number == right.as.number);
                else if (strcmp(node->data.binary.op, "!=") == 0) result.as.number = (left.as.number != right.as.number);
            }
            break;
        }

        case AST_ALLOC: {
            Value size_val = eval_node(node->data.alloc_expr.size_expr, env);
            if (size_val.type == VAL_NUMBER) {
                result.type = VAL_POINTER;
                result.as.ptr = malloc((size_t)size_val.as.number);
            }
            break;
        }

        case AST_FREE: {
            Value ptr_val = eval_node(node->data.free_stmt.target_ptr, env);
            if (ptr_val.type == VAL_POINTER && ptr_val.as.ptr) {
                free(ptr_val.as.ptr);
            }
            break;
        }

        case AST_IF: {
            Value cond = eval_node(node->data.if_stmt.condition, env);
            bool is_true = (cond.type == VAL_NUMBER && cond.as.number != 0);

            if (is_true && node->data.if_stmt.then_branch) {
                result = eval_node(node->data.if_stmt.then_branch, env);
            } else if (!is_true && node->data.if_stmt.else_branch) {
                result = eval_node(node->data.if_stmt.else_branch, env);
            }
            break;
        }

        case AST_BLOCK: {
            Environment* block_env = env_create(env);
            for (size_t i = 0; i < node->data.block.stmt_count; i++) {
                result = eval_node(node->data.block.statements[i], block_env);
            }
            env_free(block_env);
            break;
        }

        case AST_PROGRAM: {
            for (size_t i = 0; i < node->data.program.stmt_count; i++) {
                result = eval_node(node->data.program.statements[i], env);
            }
            break;
        }

        default:
            break;
    }

    return result;
}