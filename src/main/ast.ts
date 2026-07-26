export type BinaryOp = '+' | '-' | '*' | '/';

export interface NumberNode {
    kind: 'Number';
    value: number;
}

export interface StringNode {
    kind: 'String';
    value: string;
}

export type ComparisonOp = '<' | '<=' | '>' | '>=' | '==' | '!=';

export interface BinaryNode {
    kind: 'Binary';
    left: ExprNode;
    op: BinaryOp;
    right: ExprNode;
}

export interface ComparisonNode {
    kind: 'Comparison';
    left: ExprNode;
    op: ComparisonOp;
    right: ExprNode;
}

export interface PrintNode {
    kind: 'Print';
    argument: ExprNode;
}

export interface VariableNode {
    kind: 'Variable';
    name: string;
    aliases?: string[];
    initializer?: ExprNode;
}

export interface AssignmentNode {
    kind: 'Assignment';
    name: string;
    value: ExprNode;
}

export interface VariableReferenceNode {
    kind: 'VariableReference';
    name: string;
}

export interface IncrementNode {
    kind: 'Increment';
    name: string;
}

export interface IfNode {
    kind: 'If';
    condition: ExprNode;
    thenBranch: ExprNode[];
    elseBranch?: ExprNode[];
}

export interface WhileNode {
    kind: 'While';
    condition: ExprNode;
    body: ExprNode[];
}

export interface ForNode {
    kind: 'For';
    initializer?: ExprNode;
    condition?: ExprNode;
    increment?: ExprNode;
    body: ExprNode[];
}

export interface ProgramNode {
    kind: 'Program';
    statements: ExprNode[];
}

export interface ClassNode {
    kind: 'Class';
    name: string;
    body: ExprNode[];
}

export type ExprNode = NumberNode | StringNode | BinaryNode | ComparisonNode | PrintNode | VariableNode | AssignmentNode | VariableReferenceNode | IncrementNode | IfNode | WhileNode | ForNode | ProgramNode | ClassNode;