import { AstNodeType } from "./nodes";
import { parse as execParser, SyntaxError } from "./parser";

export * from "./nodes";
export * from "./semantic_check";
export { SyntaxError };

export function parse(source: string): any {
    return execParser(source, { startRule: AstNodeType.SourceUnit });
}
