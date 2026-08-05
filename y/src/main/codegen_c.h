#ifndef Y_CODEGEN_C_H
#define Y_CODEGEN_C_H

#include "ast.h"
#include <stdio.h>

typedef struct {
    FILE* output;
    int indent_level;
} CodeGenerator;

void codegen_init(CodeGenerator* gen, FILE* output);
void codegen_generate(CodeGenerator* gen, ASTNode* program);

#endif