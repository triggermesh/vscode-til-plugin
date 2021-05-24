import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    InsertTextMode
} from "vscode-languageserver/node";
import { AnyAstNode, Attribute, Block, Body, ConfigFile, Identifier, StringLiteral } from "../hcl";
import { BlockSchema, schemas } from "../schema";
import { Suggestor } from "./suggestor";

interface BlockSnippetParts {
    kind?: string[];
}

export class BlocksSuggestor implements Suggestor {
    suggest(nodes: AnyAstNode[]): CompletionItem[] | undefined {
        const closest = nodes[0];

        if (
            closest instanceof ConfigFile ||
            (closest instanceof Identifier && closest.parent instanceof ConfigFile)
        ) {
            const mapping = this.createSchemaMapping(schemas);

            return this.suggestBlocks(mapping);
        }

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
            return this.suggestMembers(block, scopedSchemas);
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

    private buildBlockSnippetParts(
        schema: BlockSchema,
        mapping: Map<string, BlockSnippetParts>
    ): void {
        const parts = mapping.get(schema.type);

        if (parts) {
            if (parts.kind && schema.kind && !parts.kind.includes(schema.kind)) {
                parts.kind.push(schema.kind);
            }
        } else {
            const kind: string[] | undefined = schema.kindNeeded ? [] : undefined;

            if (kind && schema.kind) {
                kind.push(schema.kind);
            }

            mapping.set(schema.type, { kind });
        }
    }

    private createSchemaMapping(schemas: readonly BlockSchema[]): Map<string, BlockSnippetParts> {
        const result = new Map<string, BlockSnippetParts>();

        for (const schema of schemas) {
            this.buildBlockSnippetParts(schema, result);
        }

        return result;
    }

    private buildBlockSnippet(type: string, parts: BlockSnippetParts): string {
        const fragments: string[] = [type];

        let index = 1;

        if (parts.kind) {
            const options = parts.kind.map((option) => `"${option}"`).join(",");

            fragments.push(options.length ? `\${${index}|${options}|}` : `\${${index}:type}`);

            index++;
        }

        fragments.push(`\${${index}:name}`);

        index++;

        fragments.push("{}");

        return fragments.join(" ");
    }

    suggestBlocks(mapping: Map<string, BlockSnippetParts>): CompletionItem[] {
        const result: CompletionItem[] = [];

        for (const [name, parts] of mapping.entries()) {
            result.push({
                label: name,
                kind: CompletionItemKind.Class,

                insertText: this.buildBlockSnippet(name, parts),
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            });
        }

        return result;
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

    private suggestMembers(
        block: Block,
        schemas: readonly BlockSchema[]
    ): CompletionItem[] | undefined {
        const schema = this.matchSchema(block, schemas);

        if (schema === undefined || schema.members === undefined) {
            return undefined;
        }

        const result: CompletionItem[] = [];
        const mapping = new Map<string, BlockSnippetParts>();
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
                this.buildBlockSnippetParts(member, mapping);
            }
        }

        result.push(...this.suggestBlocks(mapping));

        return result;
    }
}
