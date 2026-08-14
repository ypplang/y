import { ProgramNode } from './ast';

export class YScriptJIT {
    public compileAndRun(ast: ProgramNode): any {
        const jsCode = this.generateJS(ast);
        const nativeFunction = new Function('Terminal', jsCode);

        const Terminal = {
            println: (val: any) => console.log(val),
            print: (val: any) => process.stdout.write(String(val))
        };

        return nativeFunction(Terminal);
    }

    private generateJS(ast: ProgramNode): string {
        let code = '';
        for (const stmt of ast.body) {
            code += this.emitStatement(stmt) + '\n';
        }
        return code;
    }

    private emitStatement(node: any): string {
        switch (node.type) {
            case 'Import':
                return ``;
            case 'VarDecl':
                return `let ${node.name} = ${this.emitExpr(node.value)};`;
            case 'FunctionDecl':
                const params = node.params.map((p: any) => p.name).join(', ');
                const body = node.body.map((s: any) => this.emitStatement(s)).join('\n');
                return `function ${node.name}(${params}) {\n${body}\n}`;
            case 'If':
                const thenBody = node.thenBranch.map((s: any) => this.emitStatement(s)).join('\n');
                let ifCode = `if (${this.emitExpr(node.condition)}) {\n${thenBody}\n}`;
                if (node.elseBranch) {
                    const elseBody = node.elseBranch.map((s: any) => this.emitStatement(s)).join('\n');
                    ifCode += ` else {\n${elseBody}\n}`;
                }
                return ifCode;
            case 'While':
                const whileBody = node.body.map((s: any) => this.emitStatement(s)).join('\n');
                return `while (${this.emitExpr(node.condition)}) {\n${whileBody}\n}`;
            case 'Return':
                return node.value ? `return ${this.emitExpr(node.value)};` : `return;`;
            case 'CallExpr':
                const args = node.arguments.map((a: any) => this.emitExpr(a)).join(', ');
                return `${node.callee}(${args});`;
            case 'BinaryExpr':
                return `${this.emitExpr(node)};`;
            default:
                return '';
        }
    }

    private emitExpr(node: any): string {
        switch (node.type) {
            case 'Literal':
                if (node.valueType === 'String') {
                    return `"${this.processInterpolation(node.value)}"`;
                }
                return String(node.value);
            case 'Identifier':
                return node.name;
            case 'BinaryExpr':
                return `(${this.emitExpr(node.left)} ${node.operator} ${this.emitExpr(node.right)})`;
            case 'CallExpr':
                const args = node.arguments.map((a: any) => this.emitExpr(a)).join(', ');
                return `${node.callee}(${args})`;
            default:
                return '';
        }
    }

    private processInterpolation(str: string): string {
        return str.replace(/\{(\w+)\}/g, '"+$1+"');
    }
}