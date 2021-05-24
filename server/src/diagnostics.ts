import { Diagnostic } from "vscode-languageserver/node";
import { DiagnosticChecker, SemanticChecker } from "./checkers";
import { ConfigFile } from "./hcl";

const checkers: DiagnosticChecker[] = [new SemanticChecker()];

export class DiagnosticsService {
    check(file: ConfigFile): Diagnostic[] {
        const result: Diagnostic[] = [];

        for (const checker of checkers) {
            const issues = checker.check(file);

            if (issues) {
                result.push(...issues);
            }
        }

        return result;
    }
}
