export type BinaryOp = '+' | '-' | '*' | '/';

export interface NumberNode {
    kind: 'Number';
    value: number;
}

export interface BinaryNode {
    kind: 'Binary';
    left: ExprNode;
    op: BinaryOp;
    right: ExprNode;
}

export type ExprNode = NumberNode | BinaryNode;