import { ASTNode, ProgramNode, StatementNode } from "./parser";

export class Interpreter {
  private env: Map<string, any> = new Map();

  public execute(program: ProgramNode): void {
    for (const classDecl of program.classes) {
      const mainMethod = classDecl.methods.find((m) => m.name === "main");
      if (mainMethod) {
        this.executeStatements(mainMethod.body);
      }
    }
  }

  private executeStatements(statements: StatementNode[]): void {
    for (const stmt of statements) {
      if (stmt.type === "VarDecl") {
        const value = this.evaluate(stmt.initializer);
        this.env.set(stmt.name, value);
      } else if (stmt.type === "PrintStmt") {
        const value = this.evaluate(stmt.value);
        console.log(value);
      }
    }
  }

  private evaluate(node: ASTNode): any {
    switch (node.type) {
      case "Literal":
        return node.value;

      case "VarRef":
        if (!this.env.has(node.name)) {
          throw new Error(`Runtime Error: Variable '${node.name}' is not defined.`);
        }
        return this.env.get(node.name);

      case "BinaryExpr":
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);
        if (node.operator === "+") return left + right;
        if (node.operator === "-") return left - right;
        if (node.operator === "*") return left * right;
        if (node.operator === "/") return left / right;
        throw new Error(`Unsupported operator: ${node.operator}`);

      default:
        throw new Error(`Unknown AST Node`);
    }
  }
}