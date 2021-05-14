import { CompletionItem } from "vscode-languageserver/node";
import { AnyAstNode, AstNodeType, Range, SourceUnit } from "./hcl";
import { FileLevelSuggestor, SourceAwsS3Suggestor, Suggestor, ToSuggestor } from "./suggestors";

type AstNodeOffsetInclusionChecker = (offset: number, range: Range) => boolean;

const offsetExclusiveChecker: AstNodeOffsetInclusionChecker = (offset, range) => {
    return range.start.offset < offset && offset < range.end.offset;
};

const offsetInclusiveChecker: AstNodeOffsetInclusionChecker = (offset, range) => {
    return range.start.offset <= offset && offset <= range.end.offset;
};

const offsetInclusionCheckers: Map<AstNodeType, AstNodeOffsetInclusionChecker> = new Map([
    [AstNodeType.SourceUnit, offsetInclusiveChecker],
    [AstNodeType.Block, offsetInclusiveChecker],
    [AstNodeType.Body, offsetExclusiveChecker],
    [AstNodeType.Attribute, offsetInclusiveChecker],
    [AstNodeType.Identifier, offsetInclusiveChecker],
    [AstNodeType.NullLiteral, offsetInclusiveChecker],
    [AstNodeType.BooleanLiteral, offsetInclusiveChecker],
    [AstNodeType.NumberLiteral, offsetInclusiveChecker],
    [AstNodeType.StringLiteral, offsetInclusiveChecker],
    [AstNodeType.Tuple, offsetExclusiveChecker],
    [AstNodeType.Object, offsetExclusiveChecker],
    [AstNodeType.IndexAccess, offsetInclusiveChecker],
    [AstNodeType.AttributeAccess, offsetInclusiveChecker],
    [AstNodeType.FunctionCall, offsetInclusiveChecker]
]);

const suggestors: Suggestor[] = [
    new FileLevelSuggestor(),
    new SourceAwsS3Suggestor(),
    new ToSuggestor()
];

export class CompletionService {
    complete(offset: number, unit: SourceUnit): CompletionItem[] {
        const nodes = this.getNodesAtOffset(offset, unit).reverse();
        const result: CompletionItem[] = [];

        if (nodes.length === 0) {
            return result;
        }

        for (const suggestor of suggestors) {
            if (suggestor.match(nodes)) {
                result.push(...suggestor.suggest(nodes));
            }
        }

        return result;
    }

    getNodesAtOffset(offset: number, unit: SourceUnit): AnyAstNode[] {
        const result: AnyAstNode[] = [];
        const queue: AnyAstNode[] = [unit];

        while (queue.length) {
            const node = queue.shift();

            if (node === undefined) {
                break;
            }

            const checker = offsetInclusionCheckers.get(node.nodeType);

            if (checker === undefined) {
                throw new Error(
                    `Missing offset inclusion checker for node type "${node.nodeType}"`
                );
            }

            if (checker(offset, node.location)) {
                result.push(node);

                queue.push(...node.getChildren());
            }
        }

        return result;
    }
}
