import { ExprNode } from './ast'
import { Lexer } from './lexer';
import { Parser } from './parser';

interface RuntimeState {
    variables: Map<string, number | string>;
    aliases: Map<string, string>;
}

function resolveName(name: string, state: RuntimeState): string {
    return state.aliases.get(name) ?? name;
}

function stringifyValue(value: number | string): string {
    return typeof value === 'string' ? value : String(value);
}

function interpolateString(text: string, state: RuntimeState): string {
    if (!text.includes('{') || !text.includes('}')) {
        return text;
    }

    let result = '';
    let index = 0;

    while (index < text.length) {
        const start = text.indexOf('{', index);
        if (start === -1) {
            result += text.slice(index);
            break;
        }

        result += text.slice(index, start);
        const end = text.indexOf('}', start + 1);
        if (end === -1) {
            result += text.slice(start);
            break;
        }

        const expressionText = text.slice(start + 1, end).trim();
        const lexer = new Lexer(expressionText);
        const parser = new Parser(lexer);
        const expr = parser.parseExpression();
        const value = evaluateWithState(expr, state);
        result += stringifyValue(value);
        index = end + 1;
    }

    return result;
}

function evaluateWithState(expr: ExprNode, state: RuntimeState): number | string {
    switch (expr.kind) {
        case 'Number':
            return expr.value;

        case 'String':
            return expr.value;

        case 'Print': {
            const value = evaluateWithState(expr.argument, state);
            const output = typeof value === 'string' ? interpolateString(value, state) : stringifyValue(value);
            console.log(output);
            return value;
        }

        case 'Variable': {
            if (expr.initializer !== undefined) {
                const value = evaluateWithState(expr.initializer, state);
                const canonicalName = resolveName(expr.name, state);
                state.variables.set(canonicalName, value);
                state.aliases.set(expr.name, canonicalName);
                for (const alias of expr.aliases ?? []) {
                    state.aliases.set(alias, canonicalName);
                    state.variables.set(alias, value);
                }
                return value;
            }
            const canonicalName = resolveName(expr.name, state);
            state.variables.set(canonicalName, 0);
            return 0;
        }

        case 'Assignment': {
            const value = evaluateWithState(expr.value, state);
            const canonicalName = resolveName(expr.name, state);
            state.variables.set(canonicalName, value);
            state.variables.set(expr.name, value);
            return value;
        }

        case 'VariableReference': {
            const canonicalName = resolveName(expr.name, state);
            const value = state.variables.get(canonicalName);
            if (value === undefined) {
                return '';
            }
            return value;
        }

        case 'Increment': {
            const canonicalName = resolveName(expr.name, state);
            const current = state.variables.get(canonicalName);
            if (typeof current !== 'number') {
                throw new Error(`Cannot increment non-numeric variable: ${expr.name}`);
            }
            const next = current + 1;
            state.variables.set(canonicalName, next);
            state.variables.set(expr.name, next);
            return next;
        }

        case 'If': {
            const condition = evaluateWithState(expr.condition, state);
            const isTruthy = typeof condition === 'number' ? condition !== 0 : typeof condition === 'string' ? condition !== '' : Boolean(condition);
            if (isTruthy) {
                let result: number | string = '';
                for (const statement of expr.thenBranch) {
                    result = evaluateWithState(statement, state);
                }
                return result;
            }
            if (expr.elseBranch) {
                let result: number | string = '';
                for (const statement of expr.elseBranch) {
                    result = evaluateWithState(statement, state);
                }
                return result;
            }
            return '';
        }

        case 'While': {
            let result: number | string = '';
            while (true) {
                const condition = evaluateWithState(expr.condition, state);
                const isTruthy = typeof condition === 'number' ? condition !== 0 : typeof condition === 'string' ? condition !== '' : Boolean(condition);
                if (!isTruthy) {
                    break;
                }
                for (const statement of expr.body) {
                    result = evaluateWithState(statement, state);
                }
            }
            return result;
        }

        case 'For': {
            let result: number | string = '';
            if (expr.initializer) {
                evaluateWithState(expr.initializer, state);
            }

            while (true) {
                const condition = expr.condition ? evaluateWithState(expr.condition, state) : true;
                const isTruthy = typeof condition === 'number' ? condition !== 0 : typeof condition === 'string' ? condition !== '' : Boolean(condition);
                if (!isTruthy) {
                    break;
                }
                for (const statement of expr.body) {
                    result = evaluateWithState(statement, state);
                }
                if (expr.increment) {
                    evaluateWithState(expr.increment, state);
                }
            }
            return result;
        }

        case 'Program': {
            for (const statement of expr.statements) {
                evaluateWithState(statement, state);
            }
            return '';
        }

        case 'Class': {
            if (expr.name === 'Program') {
                for (const statement of expr.body) {
                    evaluateWithState(statement, state);
                }
                return '';
            }
            return '';
        }

        case 'Binary': {
            const left = evaluateWithState(expr.left, state);
            const right = evaluateWithState(expr.right, state);

            if (typeof left !== 'number' || typeof right !== 'number') {
                throw new Error('Binary operations require numeric operands');
            }

            switch (expr.op) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
            }
        }

        case 'Comparison': {
            const left = evaluateWithState(expr.left, state);
            const right = evaluateWithState(expr.right, state);

            if (typeof left !== 'number' || typeof right !== 'number') {
                return 0;
            }

            switch (expr.op) {
                case '<': return left < right ? 1 : 0;
                case '<=': return left <= right ? 1 : 0;
                case '>': return left > right ? 1 : 0;
                case '>=': return left >= right ? 1 : 0;
                case '==': return left === right ? 1 : 0;
                case '!=': return left !== right ? 1 : 0;
            }
        }
    }
}

export function evaluate(expr: ExprNode): number | string {
    return evaluateWithState(expr, { variables: new Map<string, number | string>(), aliases: new Map<string, string>() });
}