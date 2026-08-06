const std = @import("std");
const lexer_mod = @import("lexer.zig");
const Token = lexer_mod.Token;
const TokenType = lexer_mod.TokenType;
const Lexer = lexer_mod.Lexer;

pub const DataType = enum {
    Int32,
    Uint32,
    Ptr,
    Void,
    Custom,
};

pub const ASTNodeType = enum {
    VarDecl,
    FuncDecl,
    StructDecl,
    Block,
    ReturnStmt,
    Number,
    Identifier,
    Program,
};

pub const VarDecl = struct {
    name: []const u8,
    data_type: DataType,
    reg_binding: ?[]const u8 = null,
    initializer: ?*ASTNode = null,
};

pub const StructField = struct {
    name: []const u8,
    data_type: DataType,
    offset: ?usize = null,
};

pub const StructDecl = struct {
    name: []const u8,
    alignment: ?usize = null,
    fields: std.ArrayList(StructField),
};

pub const FuncDecl = struct {
    name: []const u8,
    abi: ?[]const u8 = null,
    return_type: DataType,
    body: ?*ASTNode = null,
};

pub const ReturnStmt = struct {
    value: ?*ASTNode = null,
};

pub const Block = struct {
    statements: std.ArrayList(*ASTNode),
};

pub const Program = struct {
    statements: std.ArrayList(*ASTNode),
};

pub const ASTNodeData = union(ASTNodeType) {
    VarDecl: VarDecl,
    FuncDecl: FuncDecl,
    StructDecl: StructDecl,
    Block: Block,
    ReturnStmt: ReturnStmt,
    Number: f64,
    Identifier: []const u8,
    Program: Program,
};

pub const ASTNode = struct {
    data: ASTNodeData,
};

pub const Parser = struct {
    lexer: *Lexer,
    current_token: Token,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, lexer: *Lexer) Parser {
        var p = Parser{
            .lexer = lexer,
            .current_token = undefined,
            .allocator = allocator,
        };
        p.advance();
        return p;
    }

    fn advance(self: *Parser) void {
        self.current_token = self.lexer.nextToken();
    }

    fn createNode(self: *Parser, data: ASTNodeData) !*ASTNode {
        const node = try self.allocator.create(ASTNode);
        node.* = ASTNode{ .data = data };
        return node;
    }

    pub fn parseProgram(self: *Parser) !*ASTNode {
        var statements = std.ArrayList(*ASTNode).init(self.allocator);

        while (self.current_token.type != .Eof) {
            const stmt = try self.parseStatement();
            if (stmt) |s| {
                try statements.append(s);
            }
        }

        return self.createNode(ASTNodeData{
            .Program = Program{ .statements = statements },
        });
    }

    fn parseStatement(self: *Parser) !?*ASTNode {
        if (self.current_token.type == .KeywordVar) {
            return try self.parseVarDecl();
        }

        if (self.current_token.type == .KeywordFunc) {
            return try self.parseFuncDecl();
        }

        if (self.current_token.type == .KeywordStruct) {
            return try self.parseStructDecl();
        }

        self.advance();
        return null;
    }

    fn parseVarDecl(self: *Parser) !*ASTNode {
        self.advance();

        var reg_binding: ?[]const u8 = null;

        if (self.current_token.type == .AtReg) {
            self.advance();
            if (self.current_token.type == .OpenParen) self.advance();
            reg_binding = self.current_token.lexeme;
            self.advance();
            if (self.current_token.type == .CloseParen) self.advance();
        }

        const var_name = self.current_token.lexeme;
        self.advance();

        return try self.createNode(ASTNodeData{
            .VarDecl = VarDecl{
                .name = var_name,
                .data_type = .Int32,
                .reg_binding = reg_binding,
            },
        });
    }

    fn parseFuncDecl(self: *Parser) !*ASTNode {
        self.advance();

        const func_name = self.current_token.lexeme;
        self.advance();

        var abi: ?[]const u8 = null;

        if (self.current_token.type == .AtAbi) {
            self.advance();
            if (self.current_token.type == .OpenParen) self.advance();
            abi = self.current_token.lexeme;
            self.advance();
            if (self.current_token.type == .CloseParen) self.advance();
        }

        return try self.createNode(ASTNodeData{
            .FuncDecl = FuncDecl{
                .name = func_name,
                .abi = abi,
                .return_type = .Void,
            },
        });
    }

    fn parseStructDecl(self: *Parser) !*ASTNode {
        self.advance();

        const struct_name = self.current_token.lexeme;
        self.advance();

        var alignment: ?usize = null;

        if (self.current_token.type == .AtAlign) {
            self.advance();
            if (self.current_token.type == .OpenParen) self.advance();
            alignment = try std.fmt.parseInt(usize, self.current_token.lexeme, 10);
            self.advance();
            if (self.current_token.type == .CloseParen) self.advance();
        }

        const fields = std.ArrayList(StructField).init(self.allocator);

        return try self.createNode(ASTNodeData{
            .StructDecl = StructDecl{
                .name = struct_name,
                .alignment = alignment,
                .fields = fields,
            },
        });
    }
};