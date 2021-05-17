import { CompletionItem } from "vscode-languageserver/node";
import { AnyAstNode, AstNodeType, Range, SourceUnit } from "./hcl";
import { BlocksSuggestor, FileLevelSuggestor, Suggestor, ToSuggestor } from "./suggestors";

type AstNodeOffsetInclusionChecker = (offset: number, range: Range) => boolean;

const offsetBoundsExclusive: AstNodeOffsetInclusionChecker = (offset, range) => {
    return range.start.offset < offset && offset < range.end.offset;
};

const offsetBoundsInclusive: AstNodeOffsetInclusionChecker = (offset, range) => {
    return range.start.offset <= offset && offset <= range.end.offset;
};

const offsetInclusionCheckers: Map<AstNodeType, AstNodeOffsetInclusionChecker> = new Map([
    [AstNodeType.SourceUnit, offsetBoundsInclusive],
    [AstNodeType.Block, offsetBoundsInclusive],
    [AstNodeType.Body, offsetBoundsExclusive],
    [AstNodeType.Attribute, offsetBoundsInclusive],
    [AstNodeType.Identifier, offsetBoundsInclusive],
    [AstNodeType.NullLiteral, offsetBoundsInclusive],
    [AstNodeType.BooleanLiteral, offsetBoundsInclusive],
    [AstNodeType.NumberLiteral, offsetBoundsInclusive],
    [AstNodeType.StringLiteral, offsetBoundsInclusive],
    [AstNodeType.Tuple, offsetBoundsExclusive],
    [AstNodeType.Object, offsetBoundsExclusive],
    [AstNodeType.IndexAccess, offsetBoundsInclusive],
    [AstNodeType.AttributeAccess, offsetBoundsInclusive],
    [AstNodeType.FunctionCall, offsetBoundsInclusive]
]);

const suggestors: Suggestor[] = [
    new FileLevelSuggestor(),
    new BlocksSuggestor(),
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
