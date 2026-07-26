import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Lexer } from './main/lexer';
import { Parser } from './main/parser';
import { evaluate } from './main/evaluator';
import { preprocessSource } from './main/main';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('y.runTkmaFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('Open a .tkma file first.');
      return;
    }

    const document = editor.document;
    if (document.languageId !== 'plaintext' && !document.fileName.endsWith('.tkma')) {
      vscode.window.showWarningMessage('This command only works for .tkma files.');
      return;
    }

    const filePath = document.uri.fsPath;
    const source = fs.readFileSync(filePath, 'utf8');
    const processed = preprocessSource(source, filePath);

    try {
      const lexer = new Lexer(processed);
      const parser = new Parser(lexer);
      const ast = parser.parse();
      const result = evaluate(ast);

      const message = typeof result === 'number' ? `Execution Output: ${result}` : result;
      vscode.window.showInformationMessage(message.toString());
    } catch (error) {
      vscode.window.showErrorMessage(`Execution Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
