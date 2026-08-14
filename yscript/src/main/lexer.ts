export enum TokenType {
    Keyword,
    Identifier,
    Number,
    String,
    Operator,
    Punctuation,
    EOF
}

export interface Token {
    type: TokenType;
    value: string;
    line: number;
}

export class Lexer {
    private src: string;
    private pos = 0;
    private line = 1;

    private keywords = new Set([
        'Integer', 'Float', 'Char', 'String', 'Boolean', 'Void',
        'function', 'import', 'return', 'if', 'else', 'while', 'true', 'false'
    ]);

    constructor(src: string) {
        this.src = src;
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];

        while (this.pos < this.src.length) {
            const ch = this.src[this.pos];

            if (ch === '\n') {
                this.line++;
                this.pos++;
                continue;
            }

            if (/\s/.test(ch)) {
                this.pos++;
                continue;
            }

            if (/[0-9]/.test(ch)) {
                tokens.push(this.readNumber());
                continue;
            }

            if (ch === '"') {
                tokens.push(this.readString());
                continue;
            }

            if (/[a-zA-Z_]/.test(ch)) {
                tokens.push(this.readIdentifier());
                continue;
            }

            if (this.isOperatorStart(ch)) {
                tokens.push(this.readOperator());
                continue;
            }

            if (['(', ')', '{', '}', ';', '.', ',', ':'].includes(ch)) {
                tokens.push({ type: TokenType.Punctuation, value: ch, line: this.line });
                this.pos++;
                continue;
            }

            this.pos++;
        }

        tokens.push({ type: TokenType.EOF, value: '', line: this.line });
        return tokens;
    }

    private isOperatorStart(ch: string): boolean {
        return ['+', '-', '*', '/', '=', '!', '<', '>', '&', '|'].includes(ch);
    }

    private readOperator(): Token {
        let op = this.src[this.pos++];
        const next = this.src[this.pos];

        if ((op === '=' || op === '!' || op === '<' || op === '>') && next === '=') {
            op += this.src[this.pos++];
        } else if ((op === '&' && next === '&') || (op === '|' && next === '|')) {
            op += this.src[this.pos++];
        }

        return { type: TokenType.Operator, value: op, line: this.line };
    }

    private readNumber(): Token {
        let numStr = '';
        while (this.pos < this.src.length && /[0-9.]/.test(this.src[this.pos])) {
            numStr += this.src[this.pos++];
        }
        return { type: TokenType.Number, value: numStr, line: this.line };
    }

    private readString(): Token {
        this.pos++;
        let str = '';
        while (this.pos < this.src.length && this.src[this.pos] !== '"') {
            str += this.src[this.pos++];
        }
        this.pos++;
        return { type: TokenType.String, value: str, line: this.line };
    }

    private readIdentifier(): Token {
        let id = '';
        while (this.pos < this.src.length && /[a-zA-Z0-9_]/.test(this.src[this.pos])) {
            id += this.src[this.pos++];
        }
        const type = this.keywords.has(id) ? TokenType.Keyword : TokenType.Identifier;
        return { type, value: id, line: this.line };
    }
}