"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node" />
const fs = __importStar(require("fs"));
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const evaluator_1 = require("./evaluator");
function parseArgs(args) {
    let filePath = '';
    let className = '';
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--class' || args[i] === '-c') {
            className = args[i + 1];
            i++;
        }
        else if (!filePath && args[i].endsWith('.tkma')) {
            filePath = args[i];
        }
    }
    return { filePath, className };
}
function preprocessSource(sourceCode, targetClass) {
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
    const lexer = new lexer_1.Lexer(sourceCode);
    const parser = new parser_1.Parser(lexer);
    try {
        const ast = parser.parse();
        const result = (0, evaluator_1.evaluate)(ast);
        console.log(`Execution Output: ${result}`);
    }
    catch {
        console.log('Execution Output: 0');
    }
}
run();
