// https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md
// https://github.com/apiaryio/blueprint-parser/blob/master/src/apiary-blueprint-parser.pegjs
// https://www.andreas-rozek.de/PEG.js/index_en.html
// https://github.com/ConsenSys/scribble/blob/develop/src/spec-lang/expr_grammar.pegjs
// https://github.com/triggermesh/bridgedl/blob/main/docs/samples/cloud_storage/s3_blob_to_slack.brg.hcl

// Entry
// ==========================

ConfigFile
    = __ nodes: ((Attribute / Block / Identifier) __)* {
        return new ConfigFile(nextId(), location(), nodes.map((b) => b[0]));
    }

Block "block"
    = type: Identifier _ labels: ((Identifier / StringLiteral) _)* _ body: Body {
        return new Block(
            nextId(),
            location(),
            type,
            labels === null ? [] : labels.map((l) => l[0]),
            body
        );
    }

Body "body"
    = "{" __ members: ((Block / Attribute / Identifier) __)* __ "}" {
        return new Body(nextId(), location(), members.map((m) => m[0]));
    }

Attribute "attribute"
    = name: Identifier _ "=" _ value: Expression? {
        return new Attribute(
            nextId(),
            location(),
            name,
            value === null ? undefined : value
        );
    }

Expression "expression"
    = NullLiteral
    / NumberLiteral
    / BooleanLiteral
    / StringLiteral
    / MemberAccess
    / Tuple
    / Object

IdentifierStart
    = [a-zA-Z_]

IdentifierTrail
    = [a-zA-Z0-9_-]

Identifier "identifier"
    = !(Keyword !IdentifierTrail) IdentifierStart IdentifierTrail* {
        return new Identifier(nextId(), location(), text());
    }

// Essentials
// ==========================

Zs
    = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

AnyChar
    = .

NoLineEndChars
    = (!EOL AnyChar)

EOLF
    = EOL / EOF

EOL "end of line"
    = [\n\r\u2028\u2029]

EOF "end of file"
    = !AnyChar { return ""; }

WhiteSpace "whitespace"
    = "\t"
    / "\v"
    / "\f"
    / " "
    / "\u00A0"
    / "\uFEFF"
    / Zs

_
    = (WhiteSpace / Comment) *

__
    = (WhiteSpace / EOL / Comment)*

// Comments
// =========================

Comment "comment"
    = LineComment / BlockComment

LineComment
    = ("#" / "//") NoLineEndChars* EOL

BlockComment
    = "/*" (!"*/" AnyChar)* "*/"

// Reserved keywords
// =========================

TRUE = "true"
FALSE = "false"
NULL = "null"

Keyword
    = NULL
    / TRUE
    / FALSE

// NULL
// =========================

NullLiteral =
    value: NULL {
        return new NullLiteral(nextId(), location());
    }

// Booleans
// =========================

BooleanLiteral =
    value: (TRUE / FALSE) {
        return new BooleanLiteral(nextId(), location(), value);
    }

// Numbers
// =========================

DecDigit
    = [0-9]

ExponentIndicator
    = ("e" / "E")

SignedDec
    = ("+" / "-")? DecDigit+

FloatingPart
    = "." DecDigit+

ExponentPart
    = ExponentIndicator SignedDec

DecNumber =
    SignedDec FloatingPart? ExponentPart? { return text(); }

HexDigit
    = [0-9a-fA-F]

HexNumber =
    "0x" HexDigit+  { return text(); }

NumberLiteral =
    value: (HexNumber / DecNumber) {
        return new NumberLiteral(nextId(), location(), value);
    }

// Strings
// =========================

StringLiteral
    = literal: (DoubleQuotedString / HereDocumentString) {
        return new StringLiteral(
            nextId(),
            location(),
            literal.value,
            literal.terminator
        );
    }

DoubleQuotedString
    = '"' chars: DoubleQuotedStringChar* '"' {
        return { value: chars.join("") };
    }

DoubleQuotedStringChar
    = !('"' / "\\" / EOL) AnyChar { return text(); }
    / "\\" sequence: EscapeSequence { return sequence; }
    / LineContinuation

LineContinuation
    = "\\" EOL { return ""; }

EscapeSequence
    = CharEscapeSequence
    / "0" !DecDigit { return "\0"; }
    / HexEscapeSequence
    / UnicodeEscapeSequence

CharEscapeSequence
    = SingleEscapeChar
    / NonEscapeChar

SingleEscapeChar
    = "'"
    / '"'
    / "\\"
    / "b"  { return "\b"; }
    / "f"  { return "\f"; }
    / "n"  { return "\n"; }
    / "r"  { return "\r"; }
    / "t"  { return "\t"; }
    / "v"  { return "\v"; }

NonEscapeChar
    = !(EscapeChar / EOL) AnyChar { return text(); }

EscapeChar
    = SingleEscapeChar
    / DecDigit
    / "x"
    / "u"

HexEscapeSequence
    = "x" digits: $(HexDigit HexDigit) {
        return charFromHex(digits);
    }

UnicodeEscapeSequence
    = "u" digits: $(HexDigit HexDigit HexDigit HexDigit) {
        return charFromHex(digits);
    }

// Heredoc
// =========================

HereDocumentString =
    ("<<" "-"?) terminator: Text1 EOL &{ return heredocStart(terminator); }
    lines: HereDocumentStringLineWithoutTerminator*
    HereDocumentStringTerminator &{ return heredocStop(terminator); }
    { return { terminator, value: lines.join("\n") } }

HereDocumentStringLineWithoutTerminator
    = !HereDocumentStringTerminator text: Text0 EOL { return text; }

/**
 * @todo: Fix any char fitting here. Should allow only ID-like, I guess.
 */
HereDocumentStringTerminator
    = terminator: Text1 EOLF &{ return isHeredoc(terminator); }

Text0 "zero or more characters"
    = chars: NoLineEndChars* { return chars.map((c) => c[1]).join(""); }

Text1 "one or more characters"
    = chars: NoLineEndChars+ { return chars.map((c) => c[1]).join(""); }

// Compound
// =========================

TupleElements =
    head: (Expression)
    tail: (__ "," __ Expression)* (__ ",")? {
        return tail.reduce(
            (accumulator, element) => {
                accumulator.push(element[3]);

                return accumulator;
            },
            [head]
        );
    }

Tuple
    = "[" __ elements: TupleElements? __ "]" {
        return new Tuple(nextId(), location(), elements === null ? [] : elements);
    }

ObjectElement
    = name: (Identifier / Expression) __ ("=" / ":") __ value: Expression {
        return [name, value];
    }

ObjectElements =
    head: (ObjectElement)
    tail: (__ "," __ ObjectElement)* (__ ",")? {
        return tail.reduce(
            (accumulator, element) => {
                accumulator.push(element[3]);

                return accumulator;
            },
            [head]
        );
    }

Object
    = "{" __ attributes: ObjectElements? __ "}" {
        return new HclObject(nextId(), location(), attributes === null ? [] : attributes);
    }

ArgumentList =
    head: (Expression)
    tail: (__ "," __ expr: Expression)* (__ ("," / "..."))? {
        return tail.reduce(
            (accumulator, element) => {
                accumulator.push(element[3]);

                return accumulator;
            },
            [head]
        );
    }

MemberAccess =
    head: Identifier
    tail: (
        "." attribute: (Identifier / Expression)? { return { attribute: attribute === null ? undefined : attribute }; }
        / "[" _ index: Expression? _ "]" { return { index: index === null ? undefined : index }; }
        / "(" __ args: ArgumentList? __ ")" { return { arguments: args === null ? [] : args }; }
    )* {
        return tail.reduce(
            (accumulator, element) => {
                if (element.hasOwnProperty("attribute")) {
                    return new AttributeAccess(
                        nextId(),
                        location(),
                        accumulator,
                        element.attribute
                    );
                }

                if (element.hasOwnProperty("index")) {
                    return new IndexAccess(
                        nextId(),
                        location(),
                        accumulator,
                        element.index
                    );
                }

                if (element.hasOwnProperty("arguments")) {
                    return new FunctionCall(
                        nextId(),
                        location(),
                        accumulator,
                        element.arguments
                    );
                }

                throw new Error("Unknown MemberAccess grammar edge-case");
            },
            head
        )
    }
