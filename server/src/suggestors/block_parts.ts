import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    InsertTextMode
} from "vscode-languageserver/node";
import { AnyAstNode, Attribute, Block, Body, Identifier, StringLiteral } from "../hcl";
import { BlockSchema, schemas } from "../schema";
import { Suggestor } from "./utils";

export class BlockPartsSuggestor implements Suggestor {
    suggest(nodes: AnyAstNode[]): CompletionItem[] | undefined {
        const closest = nodes[0];
        const block = this.getClosestBlockNode(closest) as Block;

        if (block === undefined) {
            return undefined;
        }

        const scopedSchemas = this.getScopedSchemas(block, schemas);

        if (closest === block.type) {
            return this.suggestTypes(closest, scopedSchemas);
        }

        if (closest === block.labels[0]) {
            return this.suggestKinds(block, closest, scopedSchemas);
        }

        if (closest === block.body || closest.parent === block.body) {
            return this.suggestMissingMembers(block, scopedSchemas);
        }

        return undefined;
    }

    private getClosestBlockNode(current: AnyAstNode): Block | undefined {
        return current.getClosestParentBySelector((node) => node instanceof Block);
    }

    private getScopedSchemas(
        block: Block,
        schemas: readonly BlockSchema[]
    ): readonly BlockSchema[] {
        const parents = block.getParentsBySelector<Block>((node) => node instanceof Block);

        let result: readonly BlockSchema[] = schemas;

        while (parents.length) {
            const parent = parents.pop();

            if (parent === undefined) {
                break;
            }

            const schema = this.matchSchema(parent, result);

            if (schema === undefined || schema.members === undefined) {
                break;
            }

            result = schema.members.filter(
                (member) => !(member instanceof Array)
            ) as readonly BlockSchema[];

            if (result.length === 0) {
                break;
            }
        }

        return result;
    }

    private matchSchema(block: Block, schemas: readonly BlockSchema[]): BlockSchema | undefined {
        const type = block.type.name;
        const firstLabel = block.labels.length > 0 ? block.labels[0] : undefined;

        let kind: string | undefined;

        if (firstLabel) {
            kind = firstLabel instanceof Identifier ? firstLabel.name : firstLabel.value;
        }

        for (const schema of schemas) {
            if (schema.type === type && (!schema.kindNeeded || schema.kind === kind)) {
                return schema;
            }
        }

        return undefined;
    }

    private getDefinedMemberNames(node: Body): string[] {
        return node.members.map((member) => {
            if (member instanceof Attribute) {
                return member.name.name;
            }

            if (member instanceof Block) {
                return member.type.name;
            }

            return member.name;
        });
    }

    private suggestTypes(
        currentType: Identifier,
        schemas: readonly BlockSchema[]
    ): CompletionItem[] | undefined {
        const candidates: string[] = [];

        for (const schema of schemas) {
            if (!candidates.includes(schema.type)) {
                candidates.push(schema.type);
            }
        }

        const replaceRange = currentType.getLspRange();

        return candidates.map((candidate) => ({
            label: candidate,
            kind: CompletionItemKind.Text,
            textEdit: {
                range: replaceRange,
                newText: candidate
            }
        }));
    }

    private suggestKinds(
        block: Block,
        currentKind: Identifier | StringLiteral,
        schemas: readonly BlockSchema[]
    ): CompletionItem[] | undefined {
        const type = block.type.name;
        const candidates: string[] = [];

        for (const schema of schemas) {
            if (
                schema.type === type &&
                schema.kind !== undefined &&
                !candidates.includes(schema.kind)
            ) {
                candidates.push(schema.kind);
            }
        }

        const replaceRange = currentKind.getLspRange();

        return candidates.map((candidate) => ({
            label: `"${candidate}"`,
            kind: CompletionItemKind.Text,
            textEdit: {
                range: replaceRange,
                newText: `"${candidate}"`
            }
        }));
    }

    private suggestMissingMembers(
        block: Block,
        schemas: readonly BlockSchema[]
    ): CompletionItem[] | undefined {
        const schema = this.matchSchema(block, schemas);

        if (schema === undefined || schema.members === undefined) {
            return undefined;
        }

        const result: CompletionItem[] = [];
        const memberNames = this.getDefinedMemberNames(block.body);

        for (const member of schema.members) {
            if (member instanceof Array) {
                const [name, value] = member;

                if (memberNames.includes(name)) {
                    continue;
                }

                result.push({
                    label: name,
                    kind: CompletionItemKind.Property,

                    insertText: `${name} = ${value}`,
                    insertTextFormat: InsertTextFormat.Snippet,
                    insertTextMode: InsertTextMode.adjustIndentation
                });
            } else {
                /**
                 * @todo Implement support for nested blocks.
                 */
            }
        }

        return result;
    }
}
