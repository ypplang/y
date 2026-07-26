"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    lexer;
    constructor(lexer) {
        this.lexer = lexer;
    }
    parse() {
        const tok1 = this.lexer.nextToken();
        if (tok1.type !== 'number') {
            throw new Error(`Expected a number, but got: ${tok1.value}`);
        }
        const num1 = parseFloat(tok1.value);
        const opTok = this.lexer.nextToken();
        if (opTok.type === 'eof') {
            return { kind: 'Number', value: num1 };
        }
        if (opTok.type !== 'plus' && opTok.type !== 'minus' && opTok.type !== 'star' && opTok.type !== 'slash') {
            throw new Error(`Expected an operator, but got: ${opTok.value}`);
        }
        const tok2 = this.lexer.nextToken();
        if (tok2.type !== 'number') {
            throw new Error(`Expected a number, but got: ${tok2.value}`);
        }
        const num2 = parseFloat(tok2.value);
        return {
            kind: 'Binary',
            left: { kind: 'Number', value: num1 },
            op: opTok.value,
            right: { kind: 'Number', value: num2 },
        };
    }
}
exports.Parser = Parser;
