import { AstNodeType, ConfigFile } from "./nodes";
import { parse as execParser, SyntaxError } from "./parser";

export * from "./nodes";
export { SyntaxError };

export function parse(source: string): ConfigFile {
    return execParser(source, { startRule: AstNodeType.ConfigFile });
}
