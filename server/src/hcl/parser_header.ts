// Need the ts-nocheck to suppress the noUnusedLocals errors in the generated parser
// @ts-nocheck

import {
    SourceUnit,
    Block,
    Body,
    Attribute,
    Identifier,
    NullLiteral,
    BooleanLiteral,
    NumberLiteral,
    StringLiteral,
    Tuple,
    HclObject,
    IndexAccess,
    AttributeAccess,
    FunctionCall
} from "./nodes";

let id = 0;

function nextId(): number {
    return ++id;
}

const heredocs = new Set();

function heredocStart(terminator: string) {
    heredocs.add(terminator);

    return true;
}

function isHeredoc(terminator: string) {
    return heredocs.has(terminator.trimLeft());
}

function heredocStop(terminator: string) {
    heredocs.delete(terminator.trimLeft());

    return true;
}

function charFromHex(digits: string) {
    return String.fromCharCode(parseInt(digits, 16));
}
