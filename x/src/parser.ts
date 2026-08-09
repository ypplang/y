import { Lexer, Token, TokenType } from "./lexer";

export type ASTNode =
  | ProgramNode
  | ClassDeclNode
  | MethodDeclNode
  | VarDeclNode
  | PrintStmtNode
  | BinaryExprNode
  | LiteralNode
  | VarRefNode;

export interface ProgramNode {
  type: "Program";
  uses: string[];
  classes: ClassDeclNode[];
}

export interface ClassDeclNode {
  type: "ClassDecl";
  name: string;
  methods: MethodDeclNode[];
}

export interface MethodDeclNode {
  type: "MethodDecl";
  name: string;
  returnType: string;
  body: StatementNode[];
}

export interface VarDeclNode {
  type: "VarDecl";
  varType: string;
  name: string;
  initializer: ASTNode;
}

export interface PrintStmtNode {
  type: "PrintStmt";
  value: ASTNode;
}

export interface BinaryExprNode {
  type: "BinaryExpr";
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface LiteralNode {
  type: "Literal";
  value: any;
}

export interface VarRefNode {
  type: "VarRef";
  name: string;
}

export type StatementNode = VarDeclNode | PrintStmtNode;

export class Parser {
  private lexer: Lexer;
  private currentToken: Token;

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.nextToken();
  }

  private advance(): void {
    this.currentToken = this.lexer.nextToken();
  }

  private eat(type: TokenType): void {
    if (this.currentToken.type === type) {
      this.advance();
    } else {
      throw new Error(`Unexpected token '${this.currentToken.value}', expected type '${TokenType[type]}'`);
    }
  }

  public parse(): ProgramNode {
    const uses: string[] = [];
    const classes: ClassDeclNode[] = [];

    while (this.currentToken.type === TokenType.Use) {
      this.advance();
      uses.push(this.currentToken.value);
      this.eat(TokenType.Identifier);
      this.eat(TokenType.Semicolon);
    }

    while (this.currentToken.type === TokenType.Class) {
      classes.push(this.parseClass());
    }

    return { type: "Program", uses, classes };
  }

  private parseClass(): ClassDeclNode {
    this.eat(TokenType.Class);
    const className = this.currentToken.value;
    this.eat(TokenType.Identifier);
    this.eat(TokenType.OpenBrace);

    const methods: MethodDeclNode[] = [];
    while (this.currentToken.type !== TokenType.CloseBrace && this.currentToken.type !== TokenType.EOF) {
      methods.push(this.parseMethod());
    }

    this.eat(TokenType.CloseBrace);
    return { type: "ClassDecl", name: className, methods };
  }

  private parseMethod(): MethodDeclNode {
    const returnType = this.currentToken.value;
    this.advance();

    const methodName = this.currentToken.value;
    this.eat(TokenType.Identifier);
    this.eat(TokenType.OpenParen);
    this.eat(TokenType.CloseParen);
    this.eat(TokenType.OpenBrace);

    const body: StatementNode[] = [];
    while (this.currentToken.type !== TokenType.CloseBrace && this.currentToken.type !== TokenType.EOF) {
      if (
        this.currentToken.type === TokenType.Int ||
        this.currentToken.type === TokenType.String ||
        this.currentToken.type === TokenType.Bool
      ) {
        body.push(this.parseVarDecl());
      } else if (this.currentToken.value === "println") {
        this.advance();
        this.eat(TokenType.OpenParen);
        const expr = this.parseExpression();
        this.eat(TokenType.CloseParen);
        this.eat(TokenType.Semicolon);
        body.push({ type: "PrintStmt", value: expr });
      } else {
        this.advance();
      }
    }

    this.eat(TokenType.CloseBrace);
    return { type: "MethodDecl", name: methodName, returnType, body };
  }

  private parseVarDecl(): VarDeclNode {
    const varType = this.currentToken.value;
    this.advance();

    const varName = this.currentToken.value;
    this.eat(TokenType.Identifier);
    this.eat(TokenType.Equals);

    const initializer = this.parseExpression();
    this.eat(TokenType.Semicolon);

    return { type: "VarDecl", varType, name: varName, initializer };
  }

  private parseExpression(): ASTNode {
    let left = this.parsePrimary();

    while (
      this.currentToken.type === TokenType.Plus ||
      this.currentToken.type === TokenType.Minus ||
      this.currentToken.type === TokenType.Star ||
      this.currentToken.type === TokenType.Slash
    ) {
      const op = this.currentToken.value;
      this.advance();
      const right = this.parsePrimary();
      left = { type: "BinaryExpr", operator: op, left, right };
    }

    return left;
  }

  private parsePrimary(): ASTNode {
    if (this.currentToken.type === TokenType.NumberLiteral) {
      const val = parseInt(this.currentToken.value, 10);
      this.advance();
      return { type: "Literal", value: val };
    }

    if (this.currentToken.type === TokenType.StringLiteral) {
      const val = this.currentToken.value;
      this.advance();
      return { type: "Literal", value: val };
    }

    if (this.currentToken.type === TokenType.BooleanLiteral) {
      const val = this.currentToken.value === "true";
      this.advance();
      return { type: "Literal", value: val };
    }

    if (this.currentToken.type === TokenType.Identifier) {
      const name = this.currentToken.value;
      this.advance();
      return { type: "VarRef", name };
    }

    throw new Error(`Unexpected expression token: ${this.currentToken.value}`);
  }
}