import { CompletionItem } from "vscode-languageserver";
import { AnyAstNode, AstNodeType, ConfigFile, Range } from "./hcl";
import { Suggestor } from "./suggestors";

type AstNodeOffsetInclusionChecker = (offset: number, range: Range) => boolean;

const offsetBoundsExclusive: AstNodeOffsetInclusionChecker = (offset, range) => {
    return range.start.offset < offset && offset < range.end.offset;
};

const offsetBoundsInclusive: AstNodeOffsetInclusionChecker = (offset, range) => {
    return range.start.offset <= offset && offset <= range.end.offset;
};

const offsetInclusionCheckers: Map<AstNodeType, AstNodeOffsetInclusionChecker> = new Map([
    [AstNodeType.ConfigFile, offsetBoundsInclusive],
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

export class CompletionService {
    suggestors: Suggestor[];

    constructor(suggestors: Suggestor[]) {
        this.suggestors = suggestors;
    }

    complete(offset: number, file: ConfigFile): CompletionItem[] {
        const nodes = this.getNodesAtOffset(offset, file).reverse();
        const result: CompletionItem[] = [];

        if (nodes.length === 0) {
            return result;
        }

        for (const suggestor of this.suggestors) {
            const completionItems = suggestor.suggest(nodes);

            if (completionItems) {
                result.push(...completionItems);
            }
        }

        return result;
    }

    getNodesAtOffset(offset: number, file: ConfigFile): AnyAstNode[] {
        const result: AnyAstNode[] = [];
        const queue: AnyAstNode[] = [file];

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
