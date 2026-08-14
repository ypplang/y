export type TypeAnnotation = 'Integer' | 'Float' | 'Char' | 'String' | 'Boolean' | 'Void';

export interface ASTNode {
    type: string;
}

export interface ProgramNode extends ASTNode {
    type: 'Program';
    body: ASTNode[];
}

export interface VarDeclNode extends ASTNode {
    type: 'VarDecl';
    varType: TypeAnnotation;
    name: string;
    value: ASTNode;
}

export interface FunctionDeclNode extends ASTNode {
    type: 'FunctionDecl';
    name: string;
    params: { name: string; paramType: TypeAnnotation }[];
    returnType: TypeAnnotation;
    body: ASTNode[];
}

export interface ParameterNode {
    name: string;
    paramType: TypeAnnotation;
}

export interface ReturnNode extends ASTNode {
    type: 'Return';
    value: ASTNode | null;
}

export interface IfNode extends ASTNode {
    type: 'If';
    condition: ASTNode;
    thenBranch: ASTNode[];
    elseBranch: ASTNode[] | null;
}

export interface WhileNode extends ASTNode {
    type: 'While';
    condition: ASTNode;
    body: ASTNode[];
}

export interface CallExprNode extends ASTNode {
    type: 'CallExpr';
    callee: string;
    arguments: ASTNode[];
}

export interface LiteralNode extends ASTNode {
    type: 'Literal';
    valueType: TypeAnnotation;
    value: any;
}

export interface IdentifierNode extends ASTNode {
    type: 'Identifier';
    name: string;
}

export interface BinaryExprNode extends ASTNode {
    type: 'BinaryExpr';
    operator: string;
    left: ASTNode;
    right: ASTNode;
}

export interface ImportNode extends ASTNode {
    type: 'Import';
    moduleName: string;
}