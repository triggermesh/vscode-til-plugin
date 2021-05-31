import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    InsertTextMode,
    MarkupContent,
    MarkupKind
} from "vscode-languageserver/node";
import {
    AnyAstNode,
    Attribute,
    Block,
    Body,
    ConfigFile,
    Identifier,
    StringLiteral,
    Tuple
} from "../hcl";
import { AttributeSchema, AttributeType, BlockSchema, schemas } from "../schema";
import { Suggestor } from "./suggestor";

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends ReadonlyArray<
    infer ElementType
>
    ? ElementType
    : never;

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

        const scopedSchemas = this.getScopedSchemas(block, schemas);

        if (closest === block.type) {
            return this.suggestTypes(closest, scopedSchemas);
        }

        if (closest === block.labels[0]) {
            return this.suggestKinds(block, closest, scopedSchemas);
        }

        const schema = this.matchSchema(block, scopedSchemas);

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
            return this.suggestValue(attribute, closest, schema);
        }

        return undefined;
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
                (member): member is BlockSchema => !("attributeType" in member)
            );

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

    private getBodyMemberName(node: ArrayElement<Body["members"]>): string {
        if (node instanceof Attribute) {
            return node.name.name;
        }

        if (node instanceof Block) {
            return node.type.name;
        }

        return node.name;
    }

    private buildValueSnippet(schema: AttributeSchema): string {
        if (schema.attributeType === AttributeType.Custom) {
            return schema.snippet;
        }

        if (schema.attributeType === AttributeType.Boolean) {
            return "${1|true,false|}";
        }

        if (
            schema.attributeType === AttributeType.Number ||
            schema.attributeType === AttributeType.Void
        ) {
            return "";
        }

        if (schema.attributeType === AttributeType.String) {
            return schema.options ? `"\${1|${schema.options.join(",")}|}"` : '"$1"';
        }

        if (schema.attributeType === AttributeType.Object) {
            return "{}";
        }

        if (schema.attributeType === AttributeType.Tuple) {
            return "[]";
        }

        throw new Error("Unsupported attribute type in schema: " + schema.attributeType);
    }

    private buildAttributeSnippet(schema: AttributeSchema): string {
        return schema.name + " = " + this.buildValueSnippet(schema);
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
                schema.kind !== undefined &&
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
        const memberNames = block.body.members.map(this.getBodyMemberName);

        for (const member of schema.members) {
            if ("attributeType" in member) {
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

    private suggestValue(
        attribute: Attribute,
        closest: AnyAstNode,
        schema: BlockSchema
    ): CompletionItem[] | undefined {
        if (schema.members === undefined || attribute.value === undefined) {
            return undefined;
        }

        const attrSchema = schema.members.find<AttributeSchema>(
            (member: BlockSchema | AttributeSchema): member is AttributeSchema => {
                return "name" in member && member.name === attribute.name.name;
            }
        );

        if (attrSchema === undefined) {
            return undefined;
        }

        if (attrSchema.attributeType === AttributeType.String && attrSchema.options) {
            const replaceRange = attribute.value.getLspRange();

            return attrSchema.options.map((option) => ({
                label: `"${option}"`,
                kind: CompletionItemKind.Text,
                textEdit: {
                    range: replaceRange,
                    newText: `"${option}"`
                }
            }));
        }

        if (
            attrSchema.attributeType === AttributeType.Tuple &&
            attrSchema.elements &&
            closest instanceof Tuple
        ) {
            return attrSchema.elements.map((element) => ({
                label: `"${element}"`,
                kind: CompletionItemKind.Property,

                insertText: `"${element}"`,
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            }));
        }
    }
}
