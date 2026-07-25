import * as fs from 'fs';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { evaluate } from './evaluator';

function parseArgs(args: string[]) {
  let filePath = '';
  let className = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--class' || args[i] === '-c') {
      className = args[i + 1];
      i++;
    } else if (!filePath && args[i].endsWith('.tkma')) {
      filePath = args[i];
    }
  }

  return { filePath, className };
}

function preprocessSource(sourceCode: string, targetClass?: string): string {
  if (sourceCode.includes('@noprogram;')) {
    const cleanedCode = sourceCode.replace('@noprogram;', '').trim();
    const entryName = targetClass || 'Program';
    return `
import std;

pub class ${entryName} {
    pub ${entryName}() {
        ${cleanedCode}
    }
}
`;
  }

  if (targetClass) {
    const expectedDeclaration = `class ${targetClass}`;
    if (!sourceCode.includes(expectedDeclaration)) {
      console.error(`y: Error: Expected class '${targetClass}' in file, but it was not found.`);
      process.exit(1);
    }
    return sourceCode;
  }

  if (!sourceCode.includes('class Program')) {
    console.error("y: Error: Missing 'pub class Program'. Use '--class <Name>' or add '@noprogram;'.");
    process.exit(1);
  }

  return sourceCode;
}

function run() {
  const { filePath, className } = parseArgs(process.argv.slice(2));

  if (!filePath) {
    console.error('y: Error: Please specify a .tkma source file to run.');
    process.exit(1);
  }

  const rawSource = fs.readFileSync(filePath, 'utf-8');
  const sourceCode = preprocessSource(rawSource, className);

  const lexer = new Lexer(sourceCode);
  const parser = new Parser(lexer);
  const ast = parser.parse();

  const ast = parser.parse();
  console.log(`Execution Output: ${result}`);
  const result = evaluate(ast);
}

run();