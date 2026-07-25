import * as fs from 'fs';
import { Lexer } from './lexer'
import { Parser } from './parser'
import { evaluate } from './evaluator'

function runFile(filePath: string) {
    if (!filePath.endsWith('.tkma')) {
        console.error('y: err: y source files must end w/ the .tkma file extension')
        process.exit(1);
    }

    const sourceCode = fs.readFileSync(filePath, 'utf-8');

    if (!sourceCode.includes('class Program')) {
        console.error('y: err: y source files must contain a class named Program to run. Basically, Y finds the class named "Program" to run and the class runs the function inside.');
    }

    const lexer = new Lexer(sourceCode);
    const parser = new Parser(lexer);
    const ast = parser.parse();

    const result = evaluate(ast);
    console.log('y: out: ${result}');
}

const filename = process.argv[2] || 'program.tkma';
runFile(filename);