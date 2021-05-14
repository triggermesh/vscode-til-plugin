import {
    AnyAstNode,
    Attribute,
    AttributeAccess,
    Block,
    Body,
    Expression,
    FunctionCall,
    HclObject,
    Identifier,
    IndexAccess,
    SourceUnit,
    Tuple
} from "./nodes";

export interface SemanticIssue {
    node: AnyAstNode;
    message: string;
}

function scAttributeAccess(node: AttributeAccess, issues: SemanticIssue[]): void {
    if (node.attribute === undefined) {
        issues.push({
            node,
            message: "Missing accessed attribute name"
        });
    }
}

function scIndexAccess(node: IndexAccess, issues: SemanticIssue[]): void {
    if (node.index === undefined) {
        issues.push({
            node,
            message: "Missing accessed index expression"
        });
    }
}

function scFunctionCall(node: FunctionCall, issues: SemanticIssue[]): void {
    if (
        !(
            node.base instanceof Identifier &&
            (node.base.name === "file" || node.base.name === "secret_name")
        )
    ) {
        issues.push({
            node: node.base,
            message: "Unsupported function name. Supported names: file, secret_name."
        });
    }

    scExpression(node.base, issues);

    for (const arg of node.arguments) {
        scExpression(arg, issues);
    }
}

function scTuple(node: Tuple, issues: SemanticIssue[]): void {
    for (const element of node.elements) {
        scExpression(element, issues);
    }
}

function scObject(node: HclObject, issues: SemanticIssue[]): void {
    for (const [key, value] of node.attributes) {
        scExpression(key, issues);
        scExpression(value, issues);
    }
}

function scExpression(node: Expression, issues: SemanticIssue[]): void {
    if (node instanceof AttributeAccess) {
        scAttributeAccess(node, issues);
    } else if (node instanceof IndexAccess) {
        scIndexAccess(node, issues);
    } else if (node instanceof FunctionCall) {
        scFunctionCall(node, issues);
    } else if (node instanceof Tuple) {
        scTuple(node, issues);
    } else if (node instanceof HclObject) {
        scObject(node, issues);
    }
}

function scAttribute(node: Attribute, issues: SemanticIssue[]): void {
    scExpression(node.value, issues);
}

function scBody(node: Body, issues: SemanticIssue[]): void {
    for (const member of node.members) {
        if (member instanceof Block) {
            scBlock(member, issues);
        } else if (member instanceof Attribute) {
            scAttribute(member, issues);
        } else {
            issues.push({
                node: member,
                message: "Incomplete block or attribute"
            });
        }
    }
}

function scBlock(node: Block, issues: SemanticIssue[]): void {
    scBody(node.body, issues);
}

function scSourceUnit(node: SourceUnit, issues: SemanticIssue[]): void {
    for (const child of node.nodes) {
        if (child instanceof Attribute) {
            scAttribute(child, issues);
        } else {
            scBlock(child, issues);
        }
    }
}

export function semanticCheck(unit: SourceUnit): SemanticIssue[] {
    const issues: SemanticIssue[] = [];

    scSourceUnit(unit, issues);

    return issues;
}
