import {
    AnyAstNode,
    AstNodeType,
    AstWalkCallback,
    AstWalkOrder,
    AstWalkPolicy,
    AttributeAccess,
    Body,
    FunctionCall,
    Identifier,
    IndexAccess,
    SourceUnit
} from "./nodes";

export interface SemanticIssue {
    node: AnyAstNode;
    message: string;
}

interface SemanticChecker {
    check(node: AnyAstNode): SemanticIssue | SemanticIssue[] | undefined;
}

class AttributeAccessChecker implements SemanticChecker {
    check(node: AttributeAccess): SemanticIssue | SemanticIssue[] | undefined {
        if (node.attribute === undefined) {
            return {
                node,
                message: "Missing accessed attribute name"
            };
        }
    }
}

class IndexAccessChecker implements SemanticChecker {
    check(node: IndexAccess): SemanticIssue | SemanticIssue[] | undefined {
        if (node.index === undefined) {
            return {
                node,
                message: "Missing accessed index expression"
            };
        }
    }
}

class FunctionCallChecker implements SemanticChecker {
    supported = new Set(["file", "secret_name"]);

    check(node: FunctionCall): SemanticIssue | SemanticIssue[] | undefined {
        if (!(node.base instanceof Identifier && this.supported.has(node.base.name))) {
            const names = Array.from(this.supported).join(", ");

            return {
                node: node.base,
                message: `Unsupported function name. Supported names: ${names}.`
            };
        }
    }
}

class BodyChecker implements SemanticChecker {
    check(node: Body): SemanticIssue[] | undefined {
        const issues = [];

        for (const member of node.members) {
            if (member instanceof Identifier) {
                issues.push({
                    node: member,
                    message: "Incomplete block or attribute"
                });
            }
        }

        return issues;
    }
}

const semanticCheckers = new Map<AstNodeType, SemanticChecker>([
    [AstNodeType.AttributeAccess, new AttributeAccessChecker()],
    [AstNodeType.IndexAccess, new IndexAccessChecker()],
    [AstNodeType.FunctionCall, new FunctionCallChecker()],
    [AstNodeType.Body, new BodyChecker()]
]);

export function semanticCheck(unit: SourceUnit): SemanticIssue[] {
    const issues: SemanticIssue[] = [];
    const callback: AstWalkCallback = (node) => {
        const checker = semanticCheckers.get(node.nodeType);

        if (checker) {
            const result = checker.check(node);

            if (result instanceof Array) {
                issues.push(...result);
            } else if (result !== undefined) {
                issues.push(result);
            }
        }
    };

    unit.walk(callback, AstWalkPolicy.Inclusive, AstWalkOrder.ChildrenFirst);

    return issues;
}
