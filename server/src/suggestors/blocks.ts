import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    InsertTextMode,
    MarkupContent,
    MarkupKind
} from "vscode-languageserver/node";
import { AnyAstNode, Attribute, Block, ConfigFile, Identifier, StringLiteral, Tuple } from "../hcl";
import { AttributeSchema, BlockSchema, schemas, ValueSchema, ValueType } from "../schema";
import { Suggestor } from "./suggestor";
import { getBodyMemberName, getScopedSchemas, isAttributeSchema, matchSchema } from "./utils";

interface BlockSnippetParts {
    nameNeeded: boolean;
    kind?: string[];
    documentation: string[];
}

const MARKDOWN_SEPARATOR = "\n***\n";

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

        const block = closest.getClosestParentBySelector<Block>((node) => node instanceof Block);

        if (block === undefined) {
            return undefined;
        }

        const scopedSchemas = getScopedSchemas(block, schemas);

        if (closest === block.type) {
            return this.suggestTypes(closest, scopedSchemas);
        }

        if (closest === block.labels[0]) {
            return this.suggestKinds(block, closest, scopedSchemas);
        }

        const schema = matchSchema(block, scopedSchemas);

        if (schema === undefined) {
            return undefined;
        }

        if (closest === block.body || closest.parent === block.body) {
            return this.suggestMembers(block, schema);
        }

        const attribute = closest.getClosestParentBySelector<Attribute>(
            (node) => node instanceof Attribute
        );

        if (attribute && closest !== attribute.name) {
            return this.suggestAttributeValue(attribute, closest, schema);
        }

        return undefined;
    }

    private buildValueSnippet(schema: ValueSchema): string {
        if (schema.type === ValueType.Custom) {
            return schema.snippet;
        }

        if (schema.type === ValueType.Boolean) {
            return "${1|true,false|}";
        }

        if (schema.type === ValueType.Number || schema.type === ValueType.ComponentReference) {
            return "";
        }

        if (schema.type === ValueType.String) {
            return schema.options && schema.options.length > 0
                ? `"\${1|${schema.options.join(",")}|}"`
                : '"$1"';
        }

        if (schema.type === ValueType.Object) {
            return "{}";
        }

        if (schema.type === ValueType.Tuple) {
            return "[]";
        }

        throw new Error("Unsupported value type in schema: " + schema.type);
    }

    private buildAttributeSnippet(schema: AttributeSchema): string {
        return schema.name + " = " + this.buildValueSnippet(schema.value);
    }

    private buildBlockSnippetParts(
        schema: BlockSchema,
        mapping: Map<string, BlockSnippetParts>
    ): void {
        const parts = mapping.get(schema.type);

        if (parts) {
            parts.nameNeeded ||= schema.nameNeeded;

            if (parts.kind && schema.kind && !parts.kind.includes(schema.kind)) {
                parts.kind.push(schema.kind);
            }

            if (schema.documentation) {
                parts.documentation.push(schema.documentation);
            }
        } else {
            const nameNeeded = schema.nameNeeded;
            const kind: string[] | undefined = schema.kindNeeded ? [] : undefined;
            const documentation: string[] = schema.documentation ? [schema.documentation] : [];

            if (kind && schema.kind) {
                kind.push(schema.kind);
            }

            mapping.set(schema.type, { nameNeeded, kind, documentation });
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

            fragments.push(options.length ? `\${${index}|${options}|}` : `"\${${index}:type}"`);

            index++;
        }

        if (parts.nameNeeded) {
            fragments.push(`"\${${index}:name}"`);

            index++;
        }

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
                insertTextMode: InsertTextMode.adjustIndentation,

                documentation:
                    parts.documentation.length > 0
                        ? this.makeOptionalDocumentation(parts.documentation)
                        : undefined
            });
        }

        return result;
    }

    private makeOptionalDocumentation(
        value: string | string[] | undefined
    ): MarkupContent | undefined {
        if (value === undefined) {
            return undefined;
        }

        return {
            kind: MarkupKind.Markdown,
            value: value instanceof Array ? value.join(MARKDOWN_SEPARATOR) : value
        };
    }

    private suggestTypes(
        currentType: Identifier,
        schemas: readonly BlockSchema[]
    ): CompletionItem[] | undefined {
        const candidates = new Map<string, BlockSchema[]>();

        for (const schema of schemas) {
            const typeGroup = candidates.get(schema.type);

            if (typeGroup) {
                typeGroup.push(schema);
            } else {
                candidates.set(schema.type, [schema]);
            }
        }

        const replaceRange = currentType.getLspRange();
        const result: CompletionItem[] = [];

        for (const [type, typeGroup] of candidates.entries()) {
            const item: CompletionItem = {
                label: type,
                kind: CompletionItemKind.Text,
                textEdit: {
                    range: replaceRange,
                    newText: type
                }
            };

            const documentation: string[] = [];

            for (const schema of typeGroup) {
                if (schema.documentation) {
                    documentation.push(schema.documentation);
                }
            }

            if (documentation.length > 0) {
                item.documentation = this.makeOptionalDocumentation(documentation);
            }

            result.push(item);
        }

        return result;
    }

    private suggestKinds(
        block: Block,
        currentKind: Identifier | StringLiteral,
        schemas: readonly BlockSchema[]
    ): CompletionItem[] | undefined {
        const type = block.type.name;
        const candidates: BlockSchema[] = [];

        for (const schema of schemas) {
            if (
                schema.type === type &&
                schema.kindNeeded &&
                schema.kind &&
                !candidates.some((candidate) => candidate.kind === schema.kind)
            ) {
                candidates.push(schema);
            }
        }

        const replaceRange = currentKind.getLspRange();

        return candidates.map((candidate) => ({
            label: `"${candidate.kind}"`,
            kind: CompletionItemKind.Text,
            textEdit: {
                range: replaceRange,
                newText: `"${candidate.kind}"`
            },

            documentation: this.makeOptionalDocumentation(candidate.documentation)
        }));
    }

    private suggestMembers(block: Block, schema: BlockSchema): CompletionItem[] | undefined {
        if (schema.members === undefined) {
            return undefined;
        }

        const result: CompletionItem[] = [];
        const mapping = new Map<string, BlockSnippetParts>();
        const memberNames = block.body.members.map(getBodyMemberName);

        for (const member of schema.members) {
            if (isAttributeSchema(member)) {
                if (memberNames.includes(member.name)) {
                    continue;
                }

                result.push({
                    label: member.name,
                    kind: CompletionItemKind.Property,

                    insertText: this.buildAttributeSnippet(member),
                    insertTextFormat: InsertTextFormat.Snippet,
                    insertTextMode: InsertTextMode.adjustIndentation,

                    documentation: this.makeOptionalDocumentation(member.documentation)
                });
            } else {
                this.buildBlockSnippetParts(member, mapping);
            }
        }

        result.push(...this.suggestBlocks(mapping));

        return result;
    }

    private suggestAttributeValue(
        attribute: Attribute,
        closest: AnyAstNode,
        blockSchema: BlockSchema
    ): CompletionItem[] | undefined {
        if (blockSchema.members === undefined || attribute.value === undefined) {
            return undefined;
        }

        const attributeName = getBodyMemberName(attribute);
        const attributeSchema = blockSchema.members.find(
            (member: BlockSchema | AttributeSchema): member is AttributeSchema => {
                return isAttributeSchema(member) && member.name === attributeName;
            }
        );

        if (attributeSchema === undefined) {
            return undefined;
        }

        const valueSchema = attributeSchema.value;

        if (
            valueSchema.type === ValueType.String &&
            valueSchema.options &&
            attribute.value === closest
        ) {
            const replaceRange = closest.getLspRange();

            return valueSchema.options.map((option) => ({
                label: `"${option}"`,
                kind: CompletionItemKind.Text,
                textEdit: {
                    range: replaceRange,
                    newText: `"${option}"`
                }
            }));
        }

        if (
            valueSchema.type === ValueType.ComponentReference &&
            closest.getParentsBySelector((node) => node === attribute.value)
        ) {
            const root = closest.getRoot() as ConfigFile;
            const candidates: string[] = [];

            for (const child of root.getChildren()) {
                if (child instanceof Block && child.labels.length > 1) {
                    const nameLabel = child.labels[1];
                    const name = nameLabel instanceof Identifier ? nameLabel.name : nameLabel.value;
                    const candidate = child.type.name + "." + name;

                    if (!candidates.includes(candidate)) {
                        candidates.push(candidate);
                    }
                }
            }

            const replaceRange = attribute.value.getLspRange();

            return candidates.map((candidate) => ({
                label: candidate,
                kind: CompletionItemKind.Property,
                textEdit: {
                    range: replaceRange,
                    newText: candidate
                }
            }));
        }

        if (
            valueSchema.type === ValueType.Tuple &&
            valueSchema.elements &&
            closest instanceof Tuple
        ) {
            return valueSchema.elements.map((element) => ({
                label: `"${element}"`,
                kind: CompletionItemKind.Property,

                insertText: `"${element}"`,
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            }));
        }
    }
}
