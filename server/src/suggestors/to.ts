import { CompletionItem, CompletionItemKind } from "vscode-languageserver/node";
import { AnyAstNode, Attribute, Block, Body, ConfigFile, Identifier } from "../hcl";
import { Suggestor } from "./suggestor";

export class ToSuggestor implements Suggestor {
    suggest(nodes: AnyAstNode[]): CompletionItem[] | undefined {
        const closest = nodes[0];
        const attribute = this.getClosestAttributeNode(closest);

        if (attribute === undefined || nodes[0] === attribute.name) {
            return undefined;
        }

        const file = closest.getRoot() as ConfigFile;
        const candidates: string[] = [];

        for (const child of file.getChildren()) {
            if (!(child instanceof Block && child.labels.length > 1)) {
                continue;
            }

            const nameLabel = child.labels[1];
            const name = nameLabel instanceof Identifier ? nameLabel.name : nameLabel.value;
            const candidate = child.type.name + "." + name;

            if (candidates.includes(candidate)) {
                continue;
            }

            candidates.push(candidate);
        }

        return candidates.map((candidate) => {
            const item: CompletionItem = {
                label: candidate,
                kind: CompletionItemKind.Property
            };

            if (attribute.value) {
                item.textEdit = {
                    range: attribute.value.getLspRange(),
                    newText: candidate
                };
            }

            return item;
        });
    }

    private getClosestAttributeNode(current: AnyAstNode): Attribute | undefined {
        return current.getClosestParentBySelector(
            (node) =>
                node instanceof Attribute &&
                node.parent instanceof Body &&
                (node.name.name === "to" || node.name.name === "reply_to")
        );
    }
}
