import { Diagnostic } from "vscode-languageserver/node";
import { AnyAstNode } from "../hcl";

export interface DiagnosticChecker {
    check(node: AnyAstNode): Diagnostic[] | undefined;
}
