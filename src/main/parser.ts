import { ExprNode, BinaryOp} from './ast';
import { Lexer, Token } from './lexer';

export class Parser {
    constructor(private lexer: Lexer) {}

    public parse(): ExprNode {
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
            op: opTok.value as BinaryOp,
            right: { kind: 'Number', value: num2 },
        };
    }
}