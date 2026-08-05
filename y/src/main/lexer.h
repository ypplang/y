#ifndef Y_LEXER_H
#define Y_LEXER_H

#include <stddef.h>

typedef enum {
    TOKEN_VAR,
    TOKEN_ALIAS,
    TOKEN_FUNC,
    TOKEN_IF,
    TOKEN_ELSE,
    TOKEN_RETURN,
    TOKEN_PTR,
    TOKEN_ALLOC,
    TOKEN_FREE,
    TOKEN_SIZEOF,
    TOKEN_CAST,
    TOKEN_STRUCT,
    TOKEN_INLINE,

    TOKEN_IDENTIFIER,
    TOKEN_NUMBER,
    TOKEN_STRING,

    TOKEN_INTERPOLATION_START,
    TOKEN_INTERPOLATION_END,

    TOKEN_ASSIGN,
    TOKEN_PLUS,
    TOKEN_MINUS,
    TOKEN_STAR,
    TOKEN_SLASH,
    TOKEN_EQUAL_EQUAL,
    TOKEN_NOT_EQUAL,
    TOKEN_OPEN_PAREN,
    TOKEN_CLOSE_PAREN,
    TOKEN_OPEN_BRACE,
    TOKEN_CLOSE_BRACE,
    TOKEN_COMMA,
    TOKEN_SEMICOLON,

    TOKEN_EOF,
    TOKEN_UNKNOWN
} TokenType;

typedef struct {
    TokenType type;
    const char* start;
    size_t length;
    size_t line;
    size_t column;
} Token;

typedef struct {
    const char* source;
    size_t cursor;
    size_t line;
    size_t column;
} Lexer;

void lexer_init(Lexer* lexer, const char* source);
Token lexer_next_token(Lexer* lexer);

#endif