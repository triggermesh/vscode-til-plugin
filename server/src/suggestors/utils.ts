import { Attribute, Block, Body, Identifier } from "../hcl";
import { AttributeSchema, BlockSchema } from "../schema/types";

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends ReadonlyArray<
    infer ElementType
>
    ? ElementType
    : never;

export function isBlockSchema(schema: AttributeSchema | BlockSchema): schema is BlockSchema {
    return "type" in schema;
}

export function isAttributeSchema(
    schema: AttributeSchema | BlockSchema
): schema is AttributeSchema {
    return "name" in schema;
}

export function getScopedSchemas(
    block: Block,
    schemas: readonly BlockSchema[]
): readonly BlockSchema[] {
    const parents = block.getParentsBySelector<Block>((node) => node instanceof Block);

    let result: readonly BlockSchema[] = schemas;

    while (parents.length) {
        const parent = parents.pop();

        if (parent === undefined) {
            break;
        }

        const schema = matchSchema(parent, result);

        if (schema === undefined || schema.members === undefined) {
            break;
        }

        result = schema.members.filter(isBlockSchema);

        if (result.length === 0) {
            break;
        }
    }

    return result;
}

export function matchSchema(
    block: Block,
    schemas: readonly BlockSchema[]
): BlockSchema | undefined {
    const type = block.type.name;
    const firstLabel = block.labels.length > 0 ? block.labels[0] : undefined;

    let kind: string | undefined;

    if (firstLabel) {
        kind = firstLabel instanceof Identifier ? firstLabel.name : firstLabel.value;
    }

    for (const schema of schemas) {
        if (schema.type === type && (!schema.kindNeeded || schema.kind === kind)) {
            return schema;
        }
    }

    return undefined;
}

export function getBodyMemberName(node: ArrayElement<Body["members"]>): string {
    if (node instanceof Attribute) {
        return node.name.name;
    }

    if (node instanceof Block) {
        return node.type.name;
    }

    return node.name;
}
