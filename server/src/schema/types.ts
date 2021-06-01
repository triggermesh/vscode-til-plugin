export enum ValueType {
    Custom = "custom",
    Boolean = "boolean",
    Number = "number",
    ComponentReference = "component_ref",
    String = "string",
    Tuple = "tuple",
    Object = "object"
}

export interface BaseValueSchema {
    type: ValueType;
}

export interface PrimitiveValueSchema extends BaseValueSchema {
    type: ValueType.Boolean | ValueType.Number | ValueType.ComponentReference;
}

export interface StringValueSchema extends BaseValueSchema {
    type: ValueType.String;
    options?: string[];
}

export interface TupleValueSchema extends BaseValueSchema {
    type: ValueType.Tuple;
    elements?: string[];
}

export interface ObjectValueSchema extends BaseValueSchema {
    type: ValueType.Object;
}

export interface CustomValueSchema extends BaseValueSchema {
    type: ValueType.Custom;
    snippet: string;
}

export type ValueSchema =
    | PrimitiveValueSchema
    | StringValueSchema
    | TupleValueSchema
    | ObjectValueSchema
    | CustomValueSchema;

export interface AttributeSchema {
    name: string;
    value: ValueSchema;
    documentation?: string;
}

export interface BlockSchema {
    type: string;
    kind?: string;
    kindNeeded: boolean;
    nameNeeded: boolean;
    members?: Array<AttributeSchema | BlockSchema>;
    documentation?: string;
}
