import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    InsertTextMode
} from "vscode-languageserver/node";
import { AnyAstNode, Attribute, Block, Body, Identifier } from "../hcl";
import { Suggestor } from "./utils";

export class SourceAwsS3Suggestor implements Suggestor {
    match(nodes: AnyAstNode[]): boolean {
        const closest = nodes[0];

        if (!(closest instanceof Body)) {
            return false;
        }

        const block = closest.parent as Block;

        if (block.type.name !== "source") {
            return false;
        }

        const labels = block.labels.map((l) => (l instanceof Identifier ? l.name : l.value));

        return labels.length > 0 && labels[0] === "aws_s3";
    }

    suggest(nodes: AnyAstNode[]): CompletionItem[] {
        const body = nodes[0] as Body;
        const props = body.members.map((member) => {
            if (member instanceof Attribute) {
                return member.name.name;
            }

            if (member instanceof Block) {
                return member.type.name;
            }

            return member.name;
        });

        const result: CompletionItem[] = [];

        if (!props.includes("arn")) {
            result.push({
                label: "arn",
                kind: CompletionItemKind.Property,

                insertText: 'arn = "$1"',
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            });
        }

        if (!props.includes("event_types")) {
            result.push({
                label: "event_types",
                kind: CompletionItemKind.Property,

                insertText: "event_types = [\n\t$1\n]",
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            });
        }

        if (!props.includes("access_key")) {
            result.push({
                label: "access_key",
                kind: CompletionItemKind.Property,

                insertText: 'access_key = "$1"',
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            });
        }

        if (!props.includes("secret_key")) {
            result.push({
                label: "secret_key",
                kind: CompletionItemKind.Property,

                insertText: 'secret_key = "$1"',
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            });
        }

        if (!props.includes("to")) {
            result.push({
                label: "to",
                kind: CompletionItemKind.Property,

                insertText: "to = router.",
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            });
        }

        return result;
    }
}
