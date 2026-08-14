import * as fs from 'fs';
import * as path from 'path';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { YScriptJIT } from './jit';

function runFile(filePath: string) {
    const absolutePath = path.resolve(filePath);
    const source = fs.readFileSync(absolutePath, 'utf8');

    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const jit = new YScriptJIT();
    jit.compileAndRun(ast);
}

const targetFile = process.argv[2] || 'src/samples/test.ys';
runFile(targetFile);