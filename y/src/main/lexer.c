#include "lexer.h"
#include <ctype.h>
#include <string.h>

void lexer_init(Lexer* lexer, const char* source) {
    lexer->source = source;
    lexer->cursor = 0;
    lexer->line = 1;
    lexer->column = 1;
}

static char peek(Lexer* lexer) {
    return lexer->source[lexer->cursor];
}

static char advance(Lexer* lexer) {
    char ch = lexer->source[lexer->cursor++];
    if (ch == '\n') {
        lexer->line++;
        lexer->column = 1;
    } else {
        lexer->column++;
    }
    return ch;
}

static Token make_token(Lexer* lexer, TokenType type, const char* start, size_t len, size_t col) {
    Token token;
    token.type = type;
    token.start = start;
    token.length = len;
    token.line = lexer->line;
    token.column = col;
    return token;
}

static TokenType check_keyword(const char* start, size_t len) {
    struct { const char* kw; size_t kw_len; TokenType type; } keywords[] = {
        {"var", 3, TOKEN_VAR},
        {"alias", 5, TOKEN_ALIAS},
        {"func", 4, TOKEN_FUNC},
        {"if", 2, TOKEN_IF},
        {"else", 4, TOKEN_ELSE},
        {"return", 6, TOKEN_RETURN},
        {"ptr", 3, TOKEN_PTR},
        {"alloc", 5, TOKEN_ALLOC},
        {"free", 4, TOKEN_FREE},
        {"sizeof", 6, TOKEN_SIZEOF},
        {"cast", 4, TOKEN_CAST},
        {"struct", 6, TOKEN_STRUCT},
        {"inline", 6, TOKEN_INLINE}
    };

    size_t kw_count = sizeof(keywords) / sizeof(keywords[0]);
    for (size_t i = 0; i < kw_count; i++) {
        if (keywords[i].kw_len == len && strncmp(start, keywords[i].kw, len) == 0) {
            return keywords[i].type;
        }
    }
    return TOKEN_IDENTIFIER;
}

Token lexer_next_token(Lexer* lexer) {
    while (peek(lexer) != '\0') {
        char ch = peek(lexer);

        if (isspace(ch)) {
            advance(lexer);
            continue;
        }

        size_t start_col = lexer->column;
        const char* start_ptr = &lexer->source[lexer->cursor];

        if (isalpha(ch) || ch == '_') {
            size_t len = 0;
            while (isalnum(peek(lexer)) || peek(lexer) == '_') {
                advance(lexer);
                len++;
            }
            TokenType type = check_keyword(start_ptr, len);
            return make_token(lexer, type, start_ptr, len, start_col);
        }

        if (isdigit(ch)) {
            size_t len = 0;
            while (isdigit(peek(lexer)) || peek(lexer) == '.') {
                advance(lexer);
                len++;
            }
            return make_token(lexer, TOKEN_NUMBER, start_ptr, len, start_col);
        }

        if (ch == '=') {
            advance(lexer);
            if (peek(lexer) == '=') {
                advance(lexer);
                return make_token(lexer, TOKEN_EQUAL_EQUAL, start_ptr, 2, start_col);
            }
            return make_token(lexer, TOKEN_ASSIGN, start_ptr, 1, start_col);
        }

        if (ch == '!') {
            advance(lexer);
            if (peek(lexer) == '=') {
                advance(lexer);
                return make_token(lexer, TOKEN_NOT_EQUAL, start_ptr, 2, start_col);
            }
            return make_token(lexer, TOKEN_UNKNOWN, start_ptr, 1, start_col);
        }

        switch (ch) {
            case '+': advance(lexer); return make_token(lexer, TOKEN_PLUS, start_ptr, 1, start_col);
            case '-': advance(lexer); return make_token(lexer, TOKEN_MINUS, start_ptr, 1, start_col);
            case '*': advance(lexer); return make_token(lexer, TOKEN_STAR, start_ptr, 1, start_col);
            case '/': advance(lexer); return make_token(lexer, TOKEN_SLASH, start_ptr, 1, start_col);
            case '(': advance(lexer); return make_token(lexer, TOKEN_OPEN_PAREN, start_ptr, 1, start_col);
            case ')': advance(lexer); return make_token(lexer, TOKEN_CLOSE_PAREN, start_ptr, 1, start_col);
            case '{': advance(lexer); return make_token(lexer, TOKEN_OPEN_BRACE, start_ptr, 1, start_col);
            case '}': advance(lexer); return make_token(lexer, TOKEN_CLOSE_BRACE, start_ptr, 1, start_col);
            case ',': advance(lexer); return make_token(lexer, TOKEN_COMMA, start_ptr, 1, start_col);
            case ';': advance(lexer); return make_token(lexer, TOKEN_SEMICOLON, start_ptr, 1, start_col);
            default:
                advance(lexer);
                return make_token(lexer, TOKEN_UNKNOWN, start_ptr, 1, start_col);
        }
    }

    return make_token(lexer, TOKEN_EOF, &lexer->source[lexer->cursor], 0, lexer->column);
}