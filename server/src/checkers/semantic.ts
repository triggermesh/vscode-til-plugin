import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";
import {
    AnyAstNode,
    AstNodeType,
    AstWalkCallback,
    AstWalkOrder,
    AstWalkPolicy,
    Attribute,
    AttributeAccess,
    Body,
    ConfigFile,
    FunctionCall,
    Identifier,
    IndexAccess
} from "../hcl";
import { DiagnosticChecker } from "./checker";

export interface SemanticIssue {
    node: AnyAstNode;
    message: string;
}

interface AstNodeSemanticChecker {
    check(node: AnyAstNode): SemanticIssue | SemanticIssue[] | undefined;
}

class AttributeChecker implements AstNodeSemanticChecker {
    check(node: Attribute): SemanticIssue | SemanticIssue[] | undefined {
        if (node.value === undefined) {
            return {
                node,
                message: "Missing attribute value"
            };
        }
    }
}

class AttributeAccessChecker implements AstNodeSemanticChecker {
    check(node: AttributeAccess): SemanticIssue | SemanticIssue[] | undefined {
        if (node.attribute === undefined) {
            return {
                node,
                message: "Missing accessed attribute name"
            };
        }
    }
}

class IndexAccessChecker implements AstNodeSemanticChecker {
    check(node: IndexAccess): SemanticIssue | SemanticIssue[] | undefined {
        if (node.index === undefined) {
            return {
                node,
                message: "Missing accessed index expression"
            };
        }
    }
}

class FunctionCallChecker implements AstNodeSemanticChecker {
    supported = new Set(["file", "secret_name", "secret_ref"]);

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

class IdentifierChecker implements AstNodeSemanticChecker {
    check(node: Identifier): SemanticIssue[] | undefined {
        const issues = [];

        const parent = node.parent;

        if (parent instanceof ConfigFile || parent instanceof Body) {
            issues.push({
                node,
                message: "Incomplete block or attribute"
            });
        }

        return issues;
    }
}

const nodeSemanticCheckers = new Map<AstNodeType, AstNodeSemanticChecker>([
    [AstNodeType.Attribute, new AttributeChecker()],
    [AstNodeType.AttributeAccess, new AttributeAccessChecker()],
    [AstNodeType.IndexAccess, new IndexAccessChecker()],
    [AstNodeType.FunctionCall, new FunctionCallChecker()],
    [AstNodeType.Identifier, new IdentifierChecker()]
]);

export class SemanticChecker implements DiagnosticChecker {
    check(file: ConfigFile): Diagnostic[] {
        const issues: SemanticIssue[] = [];
        const callback: AstWalkCallback = (node) => {
            const checker = nodeSemanticCheckers.get(node.nodeType);

            if (checker) {
                const result = checker.check(node);

                if (result instanceof Array) {
                    issues.push(...result);
                } else if (result !== undefined) {
                    issues.push(result);
                }
            }
        };

        file.walk(callback, AstWalkPolicy.Inclusive, AstWalkOrder.ChildrenFirst);

        return issues.map((issue) => ({
            severity: DiagnosticSeverity.Error,
            range: issue.node.getLspRange(),
            message: issue.message,
            source: `vscode-bridge-dl (${SemanticChecker.name})`
        }));
    }
}
