"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
function evaluate(expr) {
    switch (expr.kind) {
        case 'Number':
            return expr.value;
        case 'Binary': {
            const left = evaluate(expr.left);
            const right = evaluate(expr.right);
            switch (expr.op) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
            }
        }
    }
}
