import { CompletionItem, CompletionItemKind } from "vscode-languageserver/node";
import { AnyAstNode, Attribute, Block, Body, Identifier, SourceUnit } from "../hcl";
import { Suggestor } from "./utils";

export class ToSuggestor implements Suggestor {
    match(nodes: AnyAstNode[]): boolean {
        const attribute = this.getClosestAttributeNode(nodes[0]);

        return attribute !== undefined && nodes[0] !== attribute.name;
    }

    suggest(nodes: AnyAstNode[]): CompletionItem[] {
        const attribute = this.getClosestAttributeNode(nodes[0]);

        if (attribute === undefined) {
            return [];
        }

        const unit = nodes[0].getRoot() as SourceUnit;
        const candidates: string[] = [];

        for (const child of unit.getChildren()) {
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

        return candidates.map((candidate) => ({
            label: candidate,
            kind: CompletionItemKind.Property,
            textEdit: {
                range: attribute.value.getLspRange(),
                newText: candidate
            }
        }));
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
