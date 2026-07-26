export type TokenType = 'number' | 'string' | 'identifier' | 'plus' | 'minus' | 'star' | 'slash' | 'equal' | 'less' | 'greater' | 'lessEqual' | 'greaterEqual' | 'lparen' | 'rparen' | 'lbrace' | 'rbrace' | 'semicolon' | 'comma' | 'eof';

export interface Token {
    type: TokenType;
    value: string;
}

export class Lexer {
    private cursor = 0;

    constructor(private source: string) {}

    public nextToken(): Token {
        while (this.cursor < this.source.length) {
            const char = this.source[this.cursor];

            if (/\s/.test(char)) {
                this.cursor++;
                continue;
            }

            switch (char) {
                case '+':
                    if (this.source[this.cursor] === '+') {
                        this.cursor += 2;
                        return { type: 'plus', value: '++' };
                    }
                    this.cursor++;
                    return { type: 'plus', value: '+' };
                case '-':
                    this.cursor++;
                    return { type: 'minus', value: '-' };
                case '*':
                    this.cursor++;
                    return { type: 'star', value: '*' };
                case '/':
                    this.cursor++;
                    return { type: 'slash', value: '/' };
                case '=':
                    this.cursor++;
                    return { type: 'equal', value: '=' };
                case '<':
                    if (this.source[this.cursor + 1] === '=') {
                        this.cursor += 2;
                        return { type: 'lessEqual', value: '<=' };
                    }
                    this.cursor++;
                    return { type: 'less', value: '<' };
                case '>':
                    if (this.source[this.cursor + 1] === '=') {
                        this.cursor += 2;
                        return { type: 'greaterEqual', value: '>=' };
                    }
                    this.cursor++;
                    return { type: 'greater', value: '>' };
                case '(':
                    this.cursor++;
                    return { type: 'lparen', value: '(' };
                case ')':
                    this.cursor++;
                    return { type: 'rparen', value: ')' };
                case '{':
                    this.cursor++;
                    return { type: 'lbrace', value: '{' };
                case '}':
                    this.cursor++;
                    return { type: 'rbrace', value: '}' };
                case ';':
                    this.cursor++;
                    return { type: 'semicolon', value: ';' };
                case ',':
                    this.cursor++;
                    return { type: 'comma', value: ',' };
            }

            if (/[0-9]/.test(char)) {
                let numStr = char;
                this.cursor++;
                while (this.cursor < this.source.length && /[0-9]/.test(this.source[this.cursor])) {
                    numStr += this.source[this.cursor];
                    this.cursor++;
                }
                return { type: 'number', value: numStr };
            }

            if (char === '"' || char === "'") {
                const quote = char;
                this.cursor++;
                let value = '';
                while (this.cursor < this.source.length) {
                    const current = this.source[this.cursor];
                    if (current === quote) {
                        this.cursor++;
                        return { type: 'string', value };
                    }
                    value += current;
                    this.cursor++;
                }
                throw new Error('Unterminated string literal');
            }

            if (/[A-Za-z_]/.test(char)) {
                let ident = char;
                this.cursor++;
                while (this.cursor < this.source.length && /[A-Za-z0-9_]/.test(this.source[this.cursor])) {
                    ident += this.source[this.cursor];
                    this.cursor++;
                }
                return { type: 'identifier', value: ident };
            }

            throw new Error(`Unexpected character: ${char}`);
        }
        return { type: 'eof', value: '' };
    }
}          