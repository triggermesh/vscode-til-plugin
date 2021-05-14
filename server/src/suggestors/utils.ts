import { CompletionItem } from "vscode-languageserver/node";
import { AnyAstNode } from "../hcl";

export interface Suggestor {
    match(nodes: AnyAstNode[]): boolean;
    suggest(nodes: AnyAstNode[]): CompletionItem[];
}
