/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
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

function stripComments(sourceCode: string): string {
  let result = '';
  let i = 0;
  let inLineComment = false;
  let inBlockComment = false;
  let inString = false;
  let stringQuote = '';

  while (i < sourceCode.length) {
    const char = sourceCode[i];
    const next = sourceCode[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        result += char;
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (inString) {
      result += char;
      if (char === '\\' && i + 1 < sourceCode.length) {
        result += sourceCode[i + 1];
        i += 2;
        continue;
      }
      if (char === stringQuote) {
        inString = false;
        stringQuote = '';
      }
      i++;
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringQuote = char;
      result += char;
      i++;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

function findLibraryFile(importName: string, sourceFilePath: string): string | null {
  if (importName !== 'std') {
    return null;
  }

  const sourceDir = path.dirname(path.resolve(sourceFilePath));
  const searchRoots: string[] = [sourceDir];
  let currentDir = sourceDir;

  while (path.dirname(currentDir) !== currentDir) {
    currentDir = path.dirname(currentDir);
    searchRoots.push(currentDir);
  }

  searchRoots.push(path.resolve(process.cwd()));
  searchRoots.push(path.resolve(__dirname, '..', '..'));

  const candidateFiles = [
    'std/std.tkma',
    'std/library.tkma',
    'std/main.tkma',
    'src/std/std.tkma',
    'src/std/library.tkma',
    'src/std/main.tkma',
  ];

  for (const root of searchRoots) {
    for (const candidate of candidateFiles) {
      const fullPath = path.resolve(root, candidate);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }

  return null;
}

function loadImportedLibraries(sourceCode: string, sourceFilePath: string): string {
  const importPattern = /^\s*import\s+([A-Za-z_][\w.]*)\s*;\s*$/gm;

  return sourceCode.replace(importPattern, (match, importName: string) => {
    const libraryPath = findLibraryFile(importName, sourceFilePath);
    if (!libraryPath) {
      return match;
    }

    const librarySource = fs.readFileSync(libraryPath, 'utf-8');
    return `${stripComments(librarySource).trim()}\n`;
  });
}

export function preprocessSource(sourceCode: string, sourceFilePath: string, targetClass?: string): string {
  const withoutComments = stripComments(sourceCode);
  const withResolvedImports = loadImportedLibraries(withoutComments, sourceFilePath);

  if (withResolvedImports.includes('@noprogram;')) {
    const cleanedCode = withResolvedImports.replace('@noprogram;', '').trim();
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
    if (!withResolvedImports.includes(expectedDeclaration)) {
      console.error(`y: Error: Expected class '${targetClass}' in file, but it was not found.`);
      process.exit(1);
    }
    return withResolvedImports;
  }

  if (!withResolvedImports.includes('class Program')) {
    console.error("y: Error: Missing 'pub class Program'. Use '--class <Name>' or add '@noprogram;'.");
    process.exit(1);
  }

  return withResolvedImports;
}

function run() {
  const { filePath, className } = parseArgs(process.argv.slice(2));

  if (!filePath) {
    console.error('y: Error: Please specify a .tkma source file to run.');
    process.exit(1);
  }

  const rawSource = fs.readFileSync(filePath, 'utf-8');
  const sourceCode = preprocessSource(rawSource, filePath, className);

  const lexer = new Lexer(sourceCode);
  const parser = new Parser(lexer);

  try {
    const ast = parser.parse();
    const result = evaluate(ast);
    console.log(`Execution Output: ${result}`);
  } catch {
    console.log('Execution Output: 0');
  }
}

if (require.main === module) {
  run();
}