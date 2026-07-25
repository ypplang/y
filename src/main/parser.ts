import { ExprNode, BinaryOp} from './ast';
import { Lexer, Token } from './lexer';

export class Parser {
    constructor(private lexer: Lexer) {}

    public parse(): ExprNode {
        const tok1 = this.lexer.nextToken();
        const num1 = parseFloat(tok1.value);

        const opTok = this.lexer.nextToken();
        if (opTok.type === 'eof') {
            return { kind: 'Number', value: num1 };
        }

        const tok2 = this.lexer.nextToken();
        const num2 = parseFloat(tok2.value);

        return {
            kind: 'Binary',
            left: { kind: 'Number', value: num1 },
            op: opTok.value as BinaryOp,
            right: { kind: 'Number', value: num2 },
        }
    }
}