export type TokenType = 'number' | 'plus' | 'minus' | 'star' | 'slash' | 'eof';

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
            this.cursor++

            if (/\s/.test(char)) continue;

            switch (char) {
                case '+': return { type: 'plus', value: '+' }
                case '-': return { type: 'minus', value: '-' }
                case '*': return { type: 'star', value: '*' }
                case '/': return { type: 'slash', value: '/' }
            }

            if (/[0-9]/.test(char)) {
                let numStr = char;
                while (this.cursor < this.source.length && /[0-9]/.test(this.source[this.cursor])) {
                    numStr += this.source[this.cursor];
                    this.cursor++;
                }
            }
        }
        return { type: 'eof', value: '' };
    }
}          