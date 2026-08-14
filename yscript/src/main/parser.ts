import { Lexer, Token, TokenType } from './lexer';
import {
    ASTNode, ProgramNode, VarDeclNode, FunctionDeclNode, CallExprNode,
    LiteralNode, IdentifierNode, BinaryExprNode, TypeAnnotation, ImportNode,
    IfNode, WhileNode, ReturnNode, ParameterNode
} from './ast';

export class Parser {
    private tokens: Token[];
    private pos = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): ProgramNode {
        const body: ASTNode[] = [];
        while (!this.isAtEnd()) {
            body.push(this.parseStatement());
        }
        return { type: 'Program', body };
    }

    private parseStatement(): ASTNode {
        const tok = this.peek();

        if (tok.type === TokenType.Keyword) {
            if (tok.value === 'import') return this.parseImport();
            if (tok.value === 'function') return this.parseFunctionDecl();
            if (tok.value === 'if') return this.parseIf();
            if (tok.value === 'while') return this.parseWhile();
            if (tok.value === 'return') return this.parseReturn();
            if (['Integer', 'Float', 'Char', 'String', 'Boolean'].includes(tok.value)) {
                return this.parseVarDecl();
            }
        }

        return this.parseExprStatement();
    }

    private parseImport(): ImportNode {
        this.consume();
        const moduleTok = this.consume();
        this.expect(';');
        return { type: 'Import', moduleName: moduleTok.value };
    }

    private parseVarDecl(): VarDeclNode {
        const typeTok = this.consume();
        const nameTok = this.consume();
        this.expect('=');
        const expr = this.parseExpression();
        this.expect(';');

        return {
            type: 'VarDecl',
            varType: typeTok.value as TypeAnnotation,
            name: nameTok.value,
            value: expr
        };
    }

    private parseFunctionDecl(): FunctionDeclNode {
        this.consume();
        const nameTok = this.consume();
        this.expect('(');
        
        const params: ParameterNode[] = [];
        if (this.peek().value !== ')') {
            do {
                const paramType = this.consume().value as TypeAnnotation;
                const paramName = this.consume().value;
                params.push({ name: paramName, paramType });
                if (this.peek().value === ',') this.consume();
            } while (this.peek().value !== ')' && !this.isAtEnd());
        }
        
        this.expect(')');
        this.expect('{');

        const body: ASTNode[] = [];
        while (this.peek().value !== '}' && !this.isAtEnd()) {
            body.push(this.parseStatement());
        }
        this.expect('}');

        return {
            type: 'FunctionDecl',
            name: nameTok.value,
            params,
            returnType: 'Void',
            body
        };
    }

    private parseIf(): IfNode {
        this.consume();
        this.expect('(');
        const condition = this.parseExpression();
        this.expect(')');
        this.expect('{');

        const thenBranch: ASTNode[] = [];
        while (this.peek().value !== '}' && !this.isAtEnd()) {
            thenBranch.push(this.parseStatement());
        }
        this.expect('}');

        let elseBranch: ASTNode[] | null = null;
        if (this.peek().value === 'else') {
            this.consume();
            this.expect('{');
            elseBranch = [];
            while (this.peek().value !== '}' && !this.isAtEnd()) {
                elseBranch.push(this.parseStatement());
            }
            this.expect('}');
        }

        return { type: 'If', condition, thenBranch, elseBranch };
    }

    private parseWhile(): WhileNode {
        this.consume();
        this.expect('(');
        const condition = this.parseExpression();
        this.expect(')');
        this.expect('{');

        const body: ASTNode[] = [];
        while (this.peek().value !== '}' && !this.isAtEnd()) {
            body.push(this.parseStatement());
        }
        this.expect('}');

        return { type: 'While', condition, body };
    }

    private parseReturn(): ReturnNode {
        this.consume();
        let value: ASTNode | null = null;
        if (this.peek().value !== ';') {
            value = this.parseExpression();
        }
        this.expect(';');
        return { type: 'Return', value };
    }

    private parseExprStatement(): ASTNode {
        const expr = this.parseExpression();
        if (this.peek().value === ';') this.consume();
        return expr;
    }

    private parseExpression(): ASTNode {
        let left = this.parsePrimary();

        while (this.peek().type === TokenType.Operator) {
            const op = this.consume().value;
            const right = this.parsePrimary();
            left = { type: 'BinaryExpr', operator: op, left, right } as BinaryExprNode;
        }

        return left;
    }

    private parsePrimary(): ASTNode {
        const tok = this.consume();

        if (tok.type === TokenType.Number) {
            const isFloat = tok.value.includes('.');
            return {
                type: 'Literal',
                valueType: isFloat ? 'Float' : 'Integer',
                value: isFloat ? parseFloat(tok.value) : parseInt(tok.value, 10)
            } as LiteralNode;
        }

        if (tok.type === TokenType.String) {
            return { type: 'Literal', valueType: 'String', value: tok.value } as LiteralNode;
        }

        if (tok.value === 'true' || tok.value === 'false') {
            return { type: 'Literal', valueType: 'Boolean', value: tok.value === 'true' } as LiteralNode;
        }

        if (tok.type === TokenType.Identifier) {
            if (this.peek().value === '.') {
                this.consume();
                const member = this.consume();
                this.expect('(');
                const args: ASTNode[] = [];
                if (this.peek().value !== ')') {
                    do {
                        args.push(this.parseExpression());
                        if (this.peek().value === ',') this.consume();
                    } while (this.peek().value !== ')' && !this.isAtEnd());
                }
                this.expect(')');
                return { type: 'CallExpr', callee: `${tok.value}.${member.value}`, arguments: args } as CallExprNode;
            }

            if (this.peek().value === '(') {
                this.consume();
                const args: ASTNode[] = [];
                if (this.peek().value !== ')') {
                    do {
                        args.push(this.parseExpression());
                        if (this.peek().value === ',') this.consume();
                    } while (this.peek().value !== ')' && !this.isAtEnd());
                }
                this.expect(')');
                return { type: 'CallExpr', callee: tok.value, arguments: args } as CallExprNode;
            }

            return { type: 'Identifier', name: tok.value } as IdentifierNode;
        }

        throw new Error(`Unexpected token: ${tok.value}`);
    }

    private peek(): Token { return this.tokens[this.pos]; }
    private consume(): Token { return this.tokens[this.pos++]; }
    private isAtEnd(): boolean { return this.peek().type === TokenType.EOF; }
    private expect(val: string) {
        const tok = this.consume();
        if (tok.value !== val) throw new Error(`Expected '${val}', got '${tok.value}'`);
    }
}