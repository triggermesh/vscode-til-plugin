import {
    CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    InsertTextMode
} from "vscode-languageserver/node";
import { AnyAstNode, Attribute, Block, Body, Identifier } from "../hcl";
import { Suggestor } from "./utils";

interface BlockSchema {
    type: string;
    kind: string;
    attributes: { [name: string]: string };
    documentation?: string;
}

const schemas: BlockSchema[] = [
    {
        type: "source",
        kind: "aws_s3",
        attributes: {
            arn: 'arn = "$1"',
            event_types: "event_types = [\n\t$1\n]",
            access_key: 'access_key = "$1"',
            secret_key: 'secret_key = "$1"',
            to: "to = router."
        }
    },
    {
        type: "source",
        kind: "azure_blob_storage",
        attributes: {
            storage_account_id: 'storage_account_id = "$1"',
            event_hub_id: 'event_hub_id = "$1"',
            event_types: "event_types = [\n\t$1\n]",
            auth: 'auth = "$1"',
            to: "to = router."
        }
    },
    {
        type: "target",
        kind: "slack",
        attributes: {
            auth: 'auth = "$1"'
        }
    },
    {
        type: "target",
        kind: "kafka",
        attributes: {
            topic: 'topic = "$1"'
        }
    },
    {
        type: "target",
        kind: "container",
        attributes: {
            image: 'image = "$1"',
            public: "public = ${1|true,false|}"
        }
    },
    {
        type: "transformer",
        kind: "function",
        attributes: {
            runtime: 'runtime = "$1"',
            public: "public = ${1|true,false|}",
            code: "code = <<EOF\n$1\nEOF\n",
            entrypoint: 'entrypoint = "$1"',
            to: "to = target."
        }
    }
];

export class BlocksSuggestor implements Suggestor {
    match(nodes: AnyAstNode[]): boolean {
        const closest = nodes[0];
        const block = this.getClosestBlockNode(closest);

        return (
            block !== undefined &&
            block.labels.length > 1 &&
            (closest === block.body || closest.parent === block.body)
        );
    }

    suggest(nodes: AnyAstNode[]): CompletionItem[] {
        const closest = nodes[0];
        const block = this.getClosestBlockNode(closest) as Block;
        const schema = this.getMatchedSchema(block);

        const result: CompletionItem[] = [];

        if (schema === undefined) {
            return result;
        }

        const definedAttrs = this.getDefinedAttrs(block.body);

        for (const [key, value] of Object.entries(schema.attributes)) {
            if (definedAttrs.includes(key)) {
                continue;
            }

            result.push({
                label: key,
                kind: CompletionItemKind.Property,

                insertText: value,
                insertTextFormat: InsertTextFormat.Snippet,
                insertTextMode: InsertTextMode.adjustIndentation
            });
        }

        return result;
    }

    private getClosestBlockNode(current: AnyAstNode): Block | undefined {
        return current.getClosestParentBySelector((node) => node instanceof Block);
    }

    private getMatchedSchema(block: Block): BlockSchema | undefined {
        const firstLabel = block.labels[0];

        const type = block.type.name;
        const kind = firstLabel instanceof Identifier ? firstLabel.name : firstLabel.value;

        for (const schema of schemas) {
            if (schema.type === type && schema.kind === kind) {
                return schema;
            }
        }

        return undefined;
    }

    private getDefinedAttrs(node: Body): string[] {
        return node.members.map((member) => {
            if (member instanceof Attribute) {
                return member.name.name;
            }

            if (member instanceof Block) {
                return member.type.name;
            }

            return member.name;
        });
    }
}
