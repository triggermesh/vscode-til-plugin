import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    InsertTextMode
} from "vscode-languageserver/node";
import { AnyAstNode, SourceUnit } from "../hcl";
import { Suggestor } from "./utils";

export class FileLevelSuggestor implements Suggestor {
    match(nodes: AnyAstNode[]): boolean {
        return nodes.length === 1 && nodes[0] instanceof SourceUnit;
    }

    suggest(): CompletionItem[] {
        return [
            {
                label: "bridge",
                kind: CompletionItemKind.Class,

                insertText: "bridge ${1:name} {}",
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            },
            {
                label: "source",
                kind: CompletionItemKind.Class,

                insertText: "source ${1:type} ${2:name} {\n\t$3\n}",
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            },
            {
                label: "channel",
                kind: CompletionItemKind.Class,

                insertText: "channel ${1:type} ${2:name} {\n\t$3\n}",
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            },
            {
                label: "router",
                kind: CompletionItemKind.Class,

                insertText: "router ${1:type} ${2:name} {\n\t$3\n}",
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            },
            {
                label: "transformer",
                kind: CompletionItemKind.Class,

                insertText: "transformer ${1:type} ${2:name} {\n\t$3\n}",
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            },
            {
                label: "target",
                kind: CompletionItemKind.Class,

                insertText: "target ${1:type} ${2:name} {\n\t$3\n}",
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            },
            {
                label: "function",
                kind: CompletionItemKind.Class,

                insertText: "function ${1:name} {\n\t$2\n}",
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            }
        ];
    }
}
