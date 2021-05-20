import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    InsertTextMode
} from "vscode-languageserver/node";
import { AnyAstNode, Identifier, ConfigFile } from "../hcl";
import { BlockSchema, schemas } from "../schema";
import { Suggestor } from "./utils";

interface SnippetParts {
    kind?: string[];
}

export class BlocksSuggestor implements Suggestor {
    suggest(nodes: AnyAstNode[]): CompletionItem[] | undefined {
        const closest = nodes[0];

        if (
            !(
                closest instanceof ConfigFile ||
                (closest instanceof Identifier && closest.parent instanceof ConfigFile)
            )
        ) {
            return undefined;
        }

        const mapping = this.createSchemaMapping(schemas);
        const result: CompletionItem[] = [];

        for (const [name, parts] of mapping.entries()) {
            result.push({
                label: name,
                kind: CompletionItemKind.Class,

                insertText: this.buildSnippet(name, parts),
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            });
        }

        return result;
    }

    private createSchemaMapping(schemas: readonly BlockSchema[]): Map<string, SnippetParts> {
        const result = new Map<string, SnippetParts>();

        for (const schema of schemas) {
            const parts = result.get(schema.type);

            if (parts) {
                if (parts.kind && schema.kind && !parts.kind.includes(schema.kind)) {
                    parts.kind.push(schema.kind);
                }
            } else {
                const kind: string[] | undefined = schema.kindNeeded ? [] : undefined;

                if (kind && schema.kind) {
                    kind.push(schema.kind);
                }

                result.set(schema.type, { kind });
            }
        }

        return result;
    }

    private buildSnippet(type: string, parts: SnippetParts): string {
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
}
