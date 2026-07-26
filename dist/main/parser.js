"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
function isIdentifierToken(token, value) {
    return token.type === 'identifier' && (value === undefined || token.value === value);
}
class Parser {
    lexer;
    currentToken;
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.nextToken();
    }
    parse() {
        return this.parseProgram();
    }
    parseExpression() {
        return this.parseComparison();
    }
    consume(type, value) {
        const token = this.currentToken;
        if (token.type !== type || (value !== undefined && token.value !== value)) {
            throw new Error(`Expected ${value ?? type}, but got ${token.value}`);
        }
        this.currentToken = this.lexer.nextToken();
        return token;
    }
    advance() {
        const token = this.currentToken;
        this.currentToken = this.lexer.nextToken();
        return token;
    }
    parseProgram() {
        const statements = [];
        while (this.currentToken.type !== 'eof') {
            if (this.currentToken.type === 'semicolon') {
                this.consume('semicolon');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'pub')) {
                this.consume('identifier', 'pub');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'class')) {
                this.consume('identifier', 'class');
                const className = this.consume('identifier').value;
                this.consume('lbrace');
                const bodyStatements = this.parseClassBody();
                this.consume('rbrace');
                if (className === 'Program') {
                    return { kind: 'Class', name: className, body: bodyStatements };
                }
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'static')) {
                this.consume('identifier', 'static');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'fn')) {
                this.consume('identifier', 'fn');
                continue;
            }
            if (this.currentToken.type === 'lbrace') {
                this.consume('lbrace');
                continue;
            }
            if (this.currentToken.type === 'rbrace') {
                this.consume('rbrace');
                continue;
            }
            if (this.currentToken.type === 'lparen') {
                this.consume('lparen');
                continue;
            }
            if (this.currentToken.type === 'rparen') {
                this.consume('rparen');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'println')) {
                statements.push(this.parseCall());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'if')) {
                statements.push(this.parseIf());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'while')) {
                statements.push(this.parseWhile());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'for')) {
                statements.push(this.parseFor());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'int') || isIdentifierToken(this.currentToken, 'var')) {
                statements.push(this.parseVariableDeclaration());
                continue;
            }
            if (isIdentifierToken(this.currentToken)) {
                const name = this.currentToken.value;
                this.consume('identifier');
                if (this.currentToken.type === 'equal') {
                    statements.push(this.parseAssignment(name));
                    continue;
                }
                if (this.currentToken.type === 'plus' && this.currentToken.value === '++') {
                    this.consume('plus');
                    statements.push({ kind: 'Increment', name });
                    continue;
                }
            }
            if (this.currentToken.type === 'string') {
                statements.push(this.parseExpression());
                continue;
            }
            if (this.currentToken.type === 'number') {
                statements.push(this.parseExpression());
                continue;
            }
            this.advance();
        }
        return { kind: 'Program', statements };
    }
    parseClassBody() {
        const statements = [];
        while (this.currentToken.type !== 'eof' && this.currentToken.type !== 'rbrace') {
            if (this.currentToken.type === 'semicolon') {
                this.consume('semicolon');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'pub')) {
                this.consume('identifier', 'pub');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'static')) {
                this.consume('identifier', 'static');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'fn')) {
                this.consume('identifier', 'fn');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'Program')) {
                this.consume('identifier', 'Program');
                this.consume('lparen');
                this.consume('rparen');
                this.consume('lbrace');
                const constructorStatements = this.parseClassBody();
                this.consume('rbrace');
                statements.push(...constructorStatements);
                continue;
            }
            if (this.currentToken.type === 'lbrace') {
                this.consume('lbrace');
                continue;
            }
            if (this.currentToken.type === 'lparen') {
                this.consume('lparen');
                continue;
            }
            if (this.currentToken.type === 'rparen') {
                this.consume('rparen');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'println')) {
                statements.push(this.parseCall());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'if')) {
                statements.push(this.parseIf());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'while')) {
                statements.push(this.parseWhile());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'for')) {
                statements.push(this.parseFor());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'int') || isIdentifierToken(this.currentToken, 'var')) {
                statements.push(this.parseVariableDeclaration());
                continue;
            }
            if (isIdentifierToken(this.currentToken)) {
                const name = this.currentToken.value;
                this.consume('identifier');
                if (this.currentToken.type === 'equal') {
                    statements.push(this.parseAssignment(name));
                    continue;
                }
                if (this.currentToken.type === 'plus' && this.currentToken.value === '++') {
                    this.consume('plus');
                    statements.push({ kind: 'Increment', name });
                    continue;
                }
            }
            if (this.currentToken.type === 'string') {
                statements.push(this.parseExpression());
                continue;
            }
            if (this.currentToken.type === 'number') {
                statements.push(this.parseExpression());
                continue;
            }
            this.advance();
        }
        return statements;
    }
    parseComparison() {
        let expr = this.parseAdditive();
        while (this.currentToken.type === 'less' || this.currentToken.type === 'lessEqual' || this.currentToken.type === 'greater' || this.currentToken.type === 'greaterEqual' || this.currentToken.type === 'equal') {
            const op = this.currentToken.type;
            this.consume(op);
            const right = this.parseAdditive();
            expr = {
                kind: 'Comparison',
                left: expr,
                op: this.mapComparisonOp(op),
                right,
            };
        }
        return expr;
    }
    parseAdditive() {
        let expr = this.parseMultiplicative();
        while (this.currentToken.type === 'plus' || this.currentToken.type === 'minus') {
            const op = this.currentToken.type;
            this.consume(op);
            const right = this.parseMultiplicative();
            expr = {
                kind: 'Binary',
                left: expr,
                op: this.mapOperator(op),
                right,
            };
        }
        return expr;
    }
    parseMultiplicative() {
        let expr = this.parsePrimary();
        while (this.currentToken.type === 'star' || this.currentToken.type === 'slash') {
            const op = this.currentToken.type;
            this.consume(op);
            const right = this.parsePrimary();
            expr = {
                kind: 'Binary',
                left: expr,
                op: this.mapOperator(op),
                right,
            };
        }
        return expr;
    }
    parsePrimary() {
        if (this.currentToken.type === 'number') {
            const token = this.consume('number');
            return { kind: 'Number', value: parseFloat(token.value) };
        }
        if (this.currentToken.type === 'string') {
            const token = this.consume('string');
            return { kind: 'String', value: token.value };
        }
        if (this.currentToken.type === 'identifier' && this.currentToken.value === 'println') {
            return this.parseCall();
        }
        if (this.currentToken.type === 'identifier') {
            const name = this.currentToken.value;
            this.consume('identifier');
            if (this.currentToken.value === '(') {
                this.consume('lparen');
                const arg = this.parseExpression();
                this.consume('rparen');
                return { kind: 'Print', argument: arg };
            }
            return { kind: 'VariableReference', name };
        }
        throw new Error(`Unexpected token: ${this.currentToken.value}`);
    }
    parseCall() {
        this.consume('identifier', 'println');
        this.consume('lparen');
        const argument = this.parseExpression();
        this.consume('rparen');
        return { kind: 'Print', argument };
    }
    parseVariableDeclaration() {
        this.consume('identifier');
        const name = this.consume('identifier').value;
        const aliases = [];
        let initializer;
        if (this.currentToken.type === 'identifier' && this.currentToken.value === 'alias') {
            this.consume('identifier', 'alias');
            aliases.push(this.consume('identifier').value);
        }
        if (this.currentToken.type === 'equal') {
            this.consume('equal');
            initializer = this.parseExpression();
        }
        return { kind: 'Variable', name, aliases, initializer };
    }
    parseAssignment(name) {
        this.consume('equal');
        const value = this.parseExpression();
        return { kind: 'Assignment', name, value };
    }
    parseIf() {
        this.consume('identifier', 'if');
        this.consume('lparen');
        const condition = this.parseExpression();
        this.consume('rparen');
        this.consume('lbrace');
        const thenBranch = this.parseBranchStatements();
        this.consume('rbrace');
        let elseBranch;
        if (isIdentifierToken(this.currentToken, 'else')) {
            this.consume('identifier', 'else');
            if (this.currentToken.type === 'identifier' && this.currentToken.value === 'if') {
                this.consume('identifier', 'if');
                this.consume('lparen');
                const nestedCondition = this.parseExpression();
                this.consume('rparen');
                this.consume('lbrace');
                const nestedThen = this.parseBranchStatements();
                this.consume('rbrace');
                elseBranch = [{ kind: 'If', condition: nestedCondition, thenBranch: nestedThen }];
            }
            else {
                this.consume('lbrace');
                elseBranch = this.parseBranchStatements();
                this.consume('rbrace');
            }
        }
        return { kind: 'If', condition, thenBranch, elseBranch };
    }
    parseWhile() {
        this.consume('identifier', 'while');
        this.consume('lparen');
        const condition = this.parseExpression();
        this.consume('rparen');
        this.consume('lbrace');
        const body = this.parseBranchStatements();
        this.consume('rbrace');
        return { kind: 'While', condition, body };
    }
    parseFor() {
        this.consume('identifier', 'for');
        this.consume('lparen');
        let initializer;
        let condition;
        let increment;
        if (this.currentToken.type === 'identifier' && this.currentToken.value === 'var') {
            initializer = this.parseVariableDeclaration();
        }
        else if (this.currentToken.type === 'identifier') {
            initializer = this.parseExpression();
        }
        if (this.currentToken.type === 'semicolon') {
            this.consume('semicolon');
            condition = this.parseExpression();
            this.consume('semicolon');
            const nextToken = this.currentToken;
            if (nextToken.type === 'identifier') {
                const name = nextToken.value;
                this.consume('identifier');
                if (this.currentToken.value === '++') {
                    this.consume('plus');
                    increment = { kind: 'Increment', name };
                }
                else {
                    increment = { kind: 'VariableReference', name };
                }
            }
            else {
                increment = this.parseExpression();
            }
        }
        this.consume('rparen');
        this.consume('lbrace');
        const body = this.parseBranchStatements();
        this.consume('rbrace');
        return { kind: 'For', initializer, condition, increment, body };
    }
    parseBranchStatements() {
        const statements = [];
        while (this.currentToken.type !== 'eof' && this.currentToken.type !== 'rbrace') {
            if (this.currentToken.type === 'semicolon') {
                this.consume('semicolon');
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'println')) {
                statements.push(this.parseCall());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'if')) {
                statements.push(this.parseIf());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'while')) {
                statements.push(this.parseWhile());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'for')) {
                statements.push(this.parseFor());
                continue;
            }
            if (isIdentifierToken(this.currentToken, 'int') || isIdentifierToken(this.currentToken, 'var')) {
                statements.push(this.parseVariableDeclaration());
                continue;
            }
            if (isIdentifierToken(this.currentToken)) {
                const name = this.currentToken.value;
                this.consume('identifier');
                if (this.currentToken.type === 'equal') {
                    statements.push(this.parseAssignment(name));
                    continue;
                }
                if (this.currentToken.type === 'plus' && this.currentToken.value === '++') {
                    statements.push({ kind: 'Increment', name });
                    this.consume('plus');
                    continue;
                }
            }
            if (this.currentToken.type === 'string') {
                statements.push(this.parseExpression());
                continue;
            }
            if (this.currentToken.type === 'number') {
                statements.push(this.parseExpression());
                continue;
            }
            this.advance();
        }
        return statements;
    }
    mapOperator(op) {
        switch (op) {
            case 'plus': return '+';
            case 'minus': return '-';
            case 'star': return '*';
            case 'slash': return '/';
            default: throw new Error(`Unsupported operator: ${op}`);
        }
    }
    mapComparisonOp(op) {
        switch (op) {
            case 'less': return '<';
            case 'lessEqual': return '<=';
            case 'greater': return '>';
            case 'greaterEqual': return '>=';
            case 'equal': return '==';
            default: throw new Error(`Unsupported comparison operator: ${op}`);
        }
    }
}
exports.Parser = Parser;
