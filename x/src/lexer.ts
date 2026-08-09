export enum TokenType {
  Use,
  Class,
  Void,
  Int,
  String,
  Bool,
  Identifier,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  OpenBrace,
  CloseBrace,
  OpenParen,
  CloseParen,
  Semicolon,
  Equals,
  Plus,
  Minus,
  Star,
  Slash,
  EOF
}

export interface Token {
  type: TokenType;
  value: string;
}

export class Lexer {
  private source: string;
  private cursor: number = 0;

  constructor(source: string) {
    this.source = source;
  }

  public nextToken(): Token {
    while (this.cursor < this.source.length) {
      const char = this.source[this.cursor];

      if (/\s/.test(char)) {
        this.cursor++;
        continue;
      }

      if (char === '{') { this.cursor++; return { type: TokenType.OpenBrace, value: '{' }; }
      if (char === '}') { this.cursor++; return { type: TokenType.CloseBrace, value: '}' }; }
      if (char === '(') { this.cursor++; return { type: TokenType.OpenParen, value: '(' }; }
      if (char === ')') { this.cursor++; return { type: TokenType.CloseParen, value: ')' }; }
      if (char === ';') { this.cursor++; return { type: TokenType.Semicolon, value: ';' }; }
      if (char === '=') { this.cursor++; return { type: TokenType.Equals, value: '=' }; }
      if (char === '+') { this.cursor++; return { type: TokenType.Plus, value: '+' }; }
      if (char === '-') { this.cursor++; return { type: TokenType.Minus, value: '-' }; }
      if (char === '*') { this.cursor++; return { type: TokenType.Star, value: '*' }; }
      if (char === '/') { this.cursor++; return { type: TokenType.Slash, value: '/' }; }

      if (char === '"') {
        this.cursor++;
        let str = "";
        while (this.cursor < this.source.length && this.source[this.cursor] !== '"') {
          str += this.source[this.cursor];
          this.cursor++;
        }
        this.cursor++;
        return { type: TokenType.StringLiteral, value: str };
      }

      if (/[0-9]/.test(char)) {
        let num = "";
        while (this.cursor < this.source.length && /[0-9]/.test(this.source[this.cursor])) {
          num += this.source[this.cursor];
          this.cursor++;
        }
        return { type: TokenType.NumberLiteral, value: num };
      }

      if (/[a-zA-Z_]/.test(char)) {
        let ident = "";
        while (this.cursor < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.cursor])) {
          ident += this.source[this.cursor];
          this.cursor++;
        }

        if (ident === "use") return { type: TokenType.Use, value: ident };
        if (ident === "class") return { type: TokenType.Class, value: ident };
        if (ident === "void") return { type: TokenType.Void, value: ident };
        if (ident === "int") return { type: TokenType.Int, value: ident };
        if (ident === "string") return { type: TokenType.String, value: ident };
        if (ident === "bool") return { type: TokenType.Bool, value: ident };
        if (ident === "true" || ident === "false") return { type: TokenType.BooleanLiteral, value: ident };

        return { type: TokenType.Identifier, value: ident };
      }

      this.cursor++;
    }

    return { type: TokenType.EOF, value: "" };
  }
}