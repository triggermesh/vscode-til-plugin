import { CompletionItem } from "vscode-languageserver/node";
import { AnyAstNode } from "../hcl";

export interface Suggestor {
    suggest(nodes: AnyAstNode[]): CompletionItem[] | undefined;
}
