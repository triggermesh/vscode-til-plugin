import { Range as LspRange } from "vscode-languageserver/node";

export interface Position {
    offset: number;
    line: number;
    column: number;
}

export interface Range {
    start: Position;
    end: Position;
}

export function hclToLspRange(range: Range): LspRange {
    return {
        start: {
            line: range.start.line - 1,
            character: range.start.column - 1
        },
        end: {
            line: range.end.line - 1,
            character: range.end.column - 1
        }
    };
}

export enum AstNodeType {
    SourceUnit = "SourceUnit",
    Block = "Block",
    Body = "Body",
    Attribute = "Attribute",
    Identifier = "Identifier",
    NullLiteral = "NullLiteral",
    BooleanLiteral = "BooleanLiteral",
    NumberLiteral = "NumberLiteral",
    StringLiteral = "StringLiteral",
    Tuple = "Tuple",
    Object = "Object",
    IndexAccess = "IndexAccess",
    AttributeAccess = "AttributeAccess",
    FunctionCall = "FunctionCall"
}

export enum AstWalkOrder {
    ChildrenFirst = 1,
    ParentFirst = 2
}

export enum AstWalkPolicy {
    Inclusive = 1,
    Exclusive = 2
}

export type AstWalkCallback = (node: AnyAstNode) => void;
export type AstNodeSelector = (node: AnyAstNode) => boolean;

export class AstNode<T extends AstNodeType> {
    readonly id: number;
    readonly nodeType: T;
    readonly location: Range;

    parent?: AnyAstNode;

    constructor(id: number, nodeType: T, location: Range) {
        this.id = id;
        this.nodeType = nodeType;
        this.location = location;
    }

    getChildren(): readonly AnyAstNode[] {
        return [];
    }

    acceptChildren(): void {
        for (const node of this.getChildren()) {
            node.parent = this as unknown as AnyAstNode;
        }
    }

    firstChild(): AnyAstNode | undefined {
        const children = this.getChildren();

        return children[0];
    }

    lastChild(): AnyAstNode | undefined {
        const children = this.getChildren();

        return children[children.length - 1];
    }

    previousSibling(): AnyAstNode | undefined {
        if (this.parent === undefined) {
            return undefined;
        }

        const siblings = this.parent.getChildren();
        const index = siblings.indexOf(this as unknown as AnyAstNode);

        return siblings[index - 1];
    }

    nextSibling(): AnyAstNode | undefined {
        if (this.parent === undefined) {
            return undefined;
        }

        const siblings = this.parent.getChildren();
        const index = siblings.indexOf(this as unknown as AnyAstNode);

        return siblings[index + 1];
    }

    walk(
        callback: AstWalkCallback,
        policy = AstWalkPolicy.Inclusive,
        order = AstWalkOrder.ParentFirst
    ): void {
        let walker: AstWalkCallback;

        switch (order) {
            case AstWalkOrder.ParentFirst:
                walker = (node) => {
                    callback(node);

                    for (const child of node.getChildren()) {
                        walker(child);
                    }
                };
                break;

            case AstWalkOrder.ChildrenFirst:
                walker = (node) => {
                    for (const child of node.getChildren()) {
                        walker(child);
                    }

                    callback(node);
                };
                break;

            default:
                throw new Error("Unhandled AstWalkOrder value");
        }

        switch (policy) {
            case AstWalkPolicy.Inclusive:
                walker(this as unknown as AnyAstNode);
                break;

            case AstWalkPolicy.Exclusive:
                for (const child of this.getChildren()) {
                    walker(child);
                }
                break;

            default:
                throw new Error("Unhandled AstWalkPolicy value");
        }
    }

    walkParents(callback: AstWalkCallback): void {
        let node: AnyAstNode | undefined = this.parent;

        while (node) {
            callback(node);

            node = node.parent;
        }
    }

    getAllChildren(
        policy = AstWalkPolicy.Inclusive,
        order = AstWalkOrder.ParentFirst
    ): AnyAstNode[] {
        const nodes: AnyAstNode[] = [];
        const callback: AstWalkCallback = (node) => {
            nodes.push(node);
        };

        this.walk(callback, policy, order);

        return nodes;
    }

    getAllParents(): AnyAstNode[] {
        const nodes: AnyAstNode[] = [];

        this.walkParents((node) => {
            nodes.push(node);
        });

        return nodes;
    }

    getChildrenBySelector<T extends AnyAstNode>(
        selector: AstNodeSelector,
        policy = AstWalkPolicy.Inclusive,
        order = AstWalkOrder.ParentFirst
    ): T[] {
        const nodes: T[] = [];
        const callback: AstWalkCallback = (node) => {
            if (selector(node)) {
                nodes.push(node as T);
            }
        };

        this.walk(callback, policy, order);

        return nodes;
    }

    getParentsBySelector<T extends AnyAstNode>(selector: AstNodeSelector): T[] {
        const nodes: T[] = [];
        const callback: AstWalkCallback = (node) => {
            if (selector(node)) {
                nodes.push(node as T);
            }
        };

        this.walkParents(callback);

        return nodes;
    }

    getClosestParentBySelector<T extends AnyAstNode>(selector: AstNodeSelector): T | undefined {
        let node = this.parent as T | undefined;

        while (node) {
            if (selector(node)) {
                return node;
            }

            node = node.parent as T | undefined;
        }

        return undefined;
    }

    getRoot(): AnyAstNode | undefined {
        let node: AnyAstNode | undefined = this as unknown as AnyAstNode;

        while (node.parent) {
            node = node.parent;
        }

        return node;
    }

    getLspRange(): LspRange {
        return hclToLspRange(this.location);
    }
}

export class SourceUnit extends AstNode<AstNodeType.SourceUnit> {
    nodes: Array<Attribute | Block>;

    constructor(id: number, location: Range, nodes: Array<Attribute | Block>) {
        super(id, AstNodeType.SourceUnit, location);

        this.nodes = nodes;

        this.acceptChildren();
    }

    getChildren(): readonly AnyAstNode[] {
        return this.nodes;
    }
}

export class Block extends AstNode<AstNodeType.Block> {
    type: Identifier;
    labels: Array<Identifier | StringLiteral>;
    body: Body;

    constructor(
        id: number,
        location: Range,
        type: Identifier,
        labels: Array<Identifier | StringLiteral>,
        body: Body
    ) {
        super(id, AstNodeType.Block, location);

        this.type = type;
        this.labels = labels;
        this.body = body;

        this.acceptChildren();
    }

    getChildren(): readonly AnyAstNode[] {
        return [this.type, ...this.labels, this.body];
    }
}

export class Body extends AstNode<AstNodeType.Body> {
    members: Array<Block | Attribute | Identifier>;

    constructor(id: number, location: Range, members: Array<Block | Attribute>) {
        super(id, AstNodeType.Body, location);

        this.members = members;

        this.acceptChildren();
    }

    getChildren(): readonly AnyAstNode[] {
        return this.members;
    }
}

export class Attribute extends AstNode<AstNodeType.Attribute> {
    name: Identifier;
    value: Expression;

    constructor(id: number, location: Range, name: Identifier, value: Expression) {
        super(id, AstNodeType.Attribute, location);

        this.name = name;
        this.value = value;

        this.acceptChildren();
    }

    getChildren(): readonly AnyAstNode[] {
        return [this.name, this.value];
    }
}

export class Identifier extends AstNode<AstNodeType.Identifier> {
    name: string;

    constructor(id: number, location: Range, name: string) {
        super(id, AstNodeType.Identifier, location);

        this.name = name;
    }
}

class Literal<
    T extends
        | AstNodeType.NullLiteral
        | AstNodeType.NumberLiteral
        | AstNodeType.BooleanLiteral
        | AstNodeType.StringLiteral,
    V
> extends AstNode<T> {
    value: V;

    constructor(id: number, nodeType: T, location: Range, value: V) {
        super(id, nodeType, location);

        this.value = value;
    }
}

export class NullLiteral extends Literal<AstNodeType.NullLiteral, "null"> {
    constructor(id: number, location: Range) {
        super(id, AstNodeType.NullLiteral, location, "null");
    }
}

export class BooleanLiteral extends Literal<AstNodeType.BooleanLiteral, "true" | "false"> {
    constructor(id: number, location: Range, value: "true" | "false") {
        super(id, AstNodeType.BooleanLiteral, location, value);
    }
}

export class NumberLiteral extends Literal<AstNodeType.NumberLiteral, string> {
    constructor(id: number, location: Range, value: string) {
        super(id, AstNodeType.NumberLiteral, location, value);
    }
}

export class StringLiteral extends Literal<AstNodeType.StringLiteral, string> {
    terminator?: string;

    constructor(id: number, location: Range, value: string, terminator?: string) {
        super(id, AstNodeType.StringLiteral, location, value);

        this.terminator = terminator;
    }
}

export class Tuple extends AstNode<AstNodeType.Tuple> {
    elements: Expression[];

    constructor(id: number, location: Range, elements: Expression[]) {
        super(id, AstNodeType.Tuple, location);

        this.elements = elements;

        this.acceptChildren();
    }

    getChildren(): readonly AnyAstNode[] {
        return this.elements;
    }
}

export class HclObject extends AstNode<AstNodeType.Object> {
    attributes: Array<[Expression, Expression]>;

    constructor(id: number, location: Range, attributes: Array<[Expression, Expression]>) {
        super(id, AstNodeType.Object, location);

        this.attributes = attributes;

        this.acceptChildren();
    }

    getChildren(): readonly AnyAstNode[] {
        const result = [];

        for (const [k, v] of this.attributes) {
            result.push(k, v);
        }

        return result;
    }
}

export class IndexAccess extends AstNode<AstNodeType.IndexAccess> {
    base: Expression;
    index: Expression | undefined;

    constructor(id: number, location: Range, base: Expression, index: Expression) {
        super(id, AstNodeType.IndexAccess, location);

        this.base = base;
        this.index = index;

        this.acceptChildren();
    }

    getChildren(): readonly AnyAstNode[] {
        const result: AnyAstNode[] = [this.base];

        if (this.index) {
            result.push(this.index);
        }

        return result;
    }
}

export class AttributeAccess extends AstNode<AstNodeType.AttributeAccess> {
    base: Expression;
    attribute: Identifier | undefined;

    constructor(id: number, location: Range, base: Expression, attribute: Identifier) {
        super(id, AstNodeType.AttributeAccess, location);

        this.base = base;
        this.attribute = attribute;

        this.acceptChildren();
    }

    getChildren(): readonly AnyAstNode[] {
        const result: AnyAstNode[] = [this.base];

        if (this.attribute) {
            result.push(this.attribute);
        }

        return result;
    }
}

export class FunctionCall extends AstNode<AstNodeType.FunctionCall> {
    base: Expression;
    arguments: Expression[];

    constructor(id: number, location: Range, base: Expression, args: Expression[]) {
        super(id, AstNodeType.FunctionCall, location);

        this.base = base;
        this.arguments = args;

        this.acceptChildren();
    }

    getChildren(): readonly AnyAstNode[] {
        return [this.base, ...this.arguments];
    }
}

export type Expression =
    | NullLiteral
    | BooleanLiteral
    | NumberLiteral
    | StringLiteral
    | Tuple
    | HclObject
    | IndexAccess
    | AttributeAccess
    | FunctionCall
    | Identifier;

export type AnyAstNode = SourceUnit | Block | Body | Attribute | Expression;

// const node = new StringLiteral(1, { start: {column: 0, line: 0, offset: 0}, end: {column: 0, line: 0, offset: 0}}, "1");
