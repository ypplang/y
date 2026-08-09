#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";

const VERSION = "1.0.0";

function printHelp() {
  console.log(`
  X Language CLI (v${VERSION})
  Usage: xlang <command> [options]

  Commands:
    run <file.xsrc>    Execute an .xsrc source file
    check <file.xsrc>  Parse and check for syntax errors
    version            Display current version
    help               Show this help menu
  `);
}

function runFile(filePath: string) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found '${filePath}'`);
    process.exit(1);
  }

  const source = fs.readFileSync(absolutePath, "utf-8");

  try {
    const lexer = new Lexer(source);
    const parser = new Parser(lexer);
    const ast = parser.parse();

    const interpreter = new Interpreter();
    interpreter.execute(ast);
  } catch (err: any) {
    console.error(`[X Runtime Error]: ${err.message}`);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    return;
  }

  const command = args[0];

  switch (command) {
    case "run":
      if (!args[1]) {
        console.error("Error: Please specify a file path.");
        process.exit(1);
      }
      runFile(args[1]);
      break;

    case "check":
      if (!args[1]) {
        console.error("Error: Please specify a file path.");
        process.exit(1);
      }
      try {
        const source = fs.readFileSync(path.resolve(args[1]), "utf-8");
        new Parser(new Lexer(source)).parse();
        console.log(`Check succeeded: '${args[1]}' has no syntax errors.`);
      } catch (e: any) {
        console.error(`Check failed: ${e.message}`);
      }
      break;

    case "version":
    case "-v":
    case "--version":
      console.log(`xlang v${VERSION}`);
      break;

    case "help":
    case "-h":
    case "--help":
      printHelp();
      break;

    default:
      if (command.endsWith(".xsrc")) {
        runFile(command);
      } else {
        console.error(`Unknown command: '${command}'`);
        printHelp();
      }
      break;
  }
}

main();