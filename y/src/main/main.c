#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "lexer.h"
#include "parser.h"
#include "eval.h"
#include "codegen_c.h"

static char* read_file(const char* path) {
    FILE* file = fopen(path, "rb");
    if (!file) {
        fprintf(stderr, "Error: Could not open file '%s'\n", path);
        return NULL;
    }

    fseek(file, 0L, SEEK_END);
    size_t fileSize = ftell(file);
    rewind(file);

    char* buffer = (char*)malloc(fileSize + 1);
    if (!buffer) {
        fprintf(stderr, "Error: Not enough memory to read '%s'\n", path);
        fclose(file);
        return NULL;
    }

    size_t bytesRead = fread(buffer, sizeof(char), fileSize, file);
    buffer[bytesRead] = '\0';

    fclose(file);
    return buffer;
}

static void print_usage(const char* exec_name) {
    printf("Usage:\n");
    printf("  %s <file.y>             Run Y script directly via interpreter.\n", exec_name);
    printf("  %s -c <file.y> [out.c]  Transpile Y script to C code.\n", exec_name);
}

int main(int argc, char** argv) {
    if (argc < 2) {
        print_usage(argv[0]);
        return 1;
    }

    bool emit_c = false;
    const char* source_path = NULL;
    const char* output_c_path = NULL;

    if (strcmp(argv[1], "-c") == 0 || strcmp(argv[1], "--emit-c") == 0) {
        emit_c = true;
        if (argc < 3) {
            fprintf(stderr, "Error: Expected source file after '%s'\n", argv[1]);
            return 1;
        }
        source_path = argv[2];
        if (argc >= 4) {
            output_c_path = argv[3];
        }
    } else {
        source_path = argv[1];
    }

    char* source = read_file(source_path);
    if (!source) {
        return 1;
    }

    Lexer lexer;
    lexer_init(&lexer, source);

    Parser parser;
    parser_init(&parser, &lexer);

    ASTNode* program = parse_program(&parser);

    if (parser.had_error) {
        fprintf(stderr, "Compilation failed due to parsing errors.\n");
        ast_free_node(program);
        free(source);
        return 1;
    }

    if (emit_c) {
        FILE* out_file = stdout;
        if (output_c_path) {
            out_file = fopen(output_c_path, "w");
            if (!out_file) {
                fprintf(stderr, "Error: Could not open output file '%s'\n", output_c_path);
                ast_free_node(program);
                free(source);
                return 1;
            }
        }

        CodeGenerator gen;
        codegen_init(&gen, out_file);
        codegen_generate(&gen, program);

        if (output_c_path) {
            fclose(out_file);
            printf("Successfully transpiled '%s' -> '%s'\n", source_path, output_c_path);
        }
    } else {
        Environment* global_env = env_create(NULL);
        eval_node(program, global_env);
        env_free(global_env);
    }

    ast_free_node(program);
    free(source);
    return 0;
}