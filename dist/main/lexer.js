"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
class Lexer {
    source;
    cursor = 0;
    constructor(source) {
        this.source = source;
    }
    nextToken() {
        while (this.cursor < this.source.length) {
            const char = this.source[this.cursor];
            this.cursor++;
            if (/\s/.test(char))
                continue;
            switch (char) {
                case '+': return { type: 'plus', value: '+' };
                case '-': return { type: 'minus', value: '-' };
                case '*': return { type: 'star', value: '*' };
                case '/': return { type: 'slash', value: '/' };
            }
            if (/[0-9]/.test(char)) {
                let numStr = char;
                while (this.cursor < this.source.length && /[0-9]/.test(this.source[this.cursor])) {
                    numStr += this.source[this.cursor];
                    this.cursor++;
                }
                return { type: 'number', value: numStr };
            }
        }
        return { type: 'eof', value: '' };
    }
}
exports.Lexer = Lexer;
