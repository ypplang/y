const std = @import("std");

extern fn skip_whitespace_asm(ptr: [*]const u8, len: usize, offset: usize) usize;

pub const TokenType = enum {
    KeywordVar,
    KeywordFunc,
    KeywordStruct,
    KeywordReturn,

    TypeInt32,
    TypeUint32,
    TypePtr,

    AtReg,
    AtAlign,
    AtAbi,
    AtOffset,

    Identifier,
    NumberLiteral,
    StringLiteral,
    Equal,
    OpenParen,
    CloseParen,
    OpenBrace,
    CloseBrace,
    Semicolon,
    Eof,
};

pub const Token = struct {
    type: TokenType,
    lexeme: []const u8,
    line: usize,
    column: usize,
};

pub const Lexer = struct {
    source: []const u8,
    cursor: usize = 0,
    line: usize = 1,
    column: usize = 1,

    pub fn init(source: []const u8) Lexer {
        return Lexer{ .source = source };
    }

    pub fn nextToken(self: *Lexer) Token {
        self.cursor = skip_whitespace_asm(self.source.ptr, self.source.len, self.cursor);

        if (self.cursor >= self.source.len) {
            return Token{ .type = .Eof, .lexeme = "", .line = self.line, .column = self.column };
        }

        const start = self.cursor;
        const ch = self.source[self.cursor];

        if (ch == '@') {
            self.cursor += 1;
            while (self.cursor < self.source.len and std.ascii.isAlphanumeric(self.source[self.cursor])) {
                self.cursor += 1;
            }
            const attr = self.source[start..self.cursor];
            
            if (std.mem.eql(u8, attr, "@reg")) return Token{ .type = .AtReg, .lexeme = attr, .line = self.line, .column = start };
            if (std.mem.eql(u8, attr, "@align")) return Token{ .type = .AtAlign, .lexeme = attr, .line = self.line, .column = start };
            if (std.mem.eql(u8, attr, "@abi")) return Token{ .type = .AtAbi, .lexeme = attr, .line = self.line, .column = start };
            if (std.mem.eql(u8, attr, "@offset")) return Token{ .type = .AtOffset, .lexeme = attr, .line = self.line, .column = start };
        }

        if (std.ascii.isAlphabetic(ch) or ch == '_') {
            while (self.cursor < self.source.len and (std.ascii.isAlphanumeric(self.source[self.cursor]) or self.source[self.cursor] == '_')) {
                self.cursor += 1;
            }
            const word = self.source[start..self.cursor];

            if (std.mem.eql(u8, word, "var")) return Token{ .type = .KeywordVar, .lexeme = word, .line = self.line, .column = start };
            if (std.mem.eql(u8, word, "func")) return Token{ .type = .KeywordFunc, .lexeme = word, .line = self.line, .column = start };
            if (std.mem.eql(u8, word, "struct")) return Token{ .type = .KeywordStruct, .lexeme = word, .line = self.line, .column = start };
            if (std.mem.eql(u8, word, "int32")) return Token{ .type = .TypeInt32, .lexeme = word, .line = self.line, .column = start };
            if (std.mem.eql(u8, word, "uint32")) return Token{ .type = .TypeUint32, .lexeme = word, .line = self.line, .column = start };

            return Token{ .type = .Identifier, .lexeme = word, .line = self.line, .column = start };
        }

        self.cursor += 1;
        return Token{ .type = .Eof, .lexeme = "", .line = self.line, .column = start };
    }
};