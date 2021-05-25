import { Diagnostic } from "vscode-languageserver/node";
import { DiagnosticChecker } from "./checkers";
import { ConfigFile } from "./hcl";

export class DiagnosticsService {
    checkers: DiagnosticChecker[];

    constructor(checkers: DiagnosticChecker[]) {
        this.checkers = checkers;
    }

    check(file: ConfigFile): Diagnostic[] {
        const result: Diagnostic[] = [];

        for (const checker of this.checkers) {
            const issues = checker.check(file);

            if (issues) {
                result.push(...issues);
            }
        }

        return result;
    }
}
