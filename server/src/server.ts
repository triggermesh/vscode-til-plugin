import { TextDocument } from "vscode-languageserver-textdocument";
import {
    CompletionItem,
    createConnection,
    Diagnostic,
    DiagnosticSeverity,
    DidChangeConfigurationNotification,
    InitializeParams,
    InitializeResult,
    ProposedFeatures,
    TextDocumentPositionParams,
    TextDocuments,
    TextDocumentSyncKind
} from "vscode-languageserver/node";
import { CompletionService } from "./completion";
import { AnyAstNode, hclToLspRange, parse, semanticCheck, SourceUnit, SyntaxError } from "./hcl";

const connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );

    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );

    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ["."]
            }
        }
    };

    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }

    return result;
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }

    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders((event) => {
            connection.console.log("Workspace folder change event received.");
        });
    }
});

interface Settings {
    maxNumberOfProblems: number;
}

const defaultSettings: Settings = { maxNumberOfProblems: 100 };

let globalSettings: Settings = defaultSettings;

const documentSettings: Map<string, Thenable<Settings>> = new Map();
const documentAsts: Map<string, SourceUnit> = new Map();

const completionService = new CompletionService();

connection.onDidChangeConfiguration((params) => {
    if (hasConfigurationCapability) {
        documentSettings.clear();
    } else {
        globalSettings = <Settings>params.settings["vscode-bridge-dl"] || defaultSettings;
    }

    documents.all().forEach(processDocument);
});

function getDocumentSettings(resource: string): Thenable<Settings> {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }

    let result = documentSettings.get(resource);

    if (result === undefined) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: "vscode-bridge-dl"
        });

        documentSettings.set(resource, result);
    }

    return result;
}

documents.onDidClose((e) => {
    documentSettings.delete(e.document.uri);
    documentAsts.delete(e.document.uri);
});

documents.onDidChangeContent((e) => {
    processDocument(e.document);
});

async function processDocument(textDocument: TextDocument): Promise<void> {
    const settings = await getDocumentSettings(textDocument.uri);
    const source = textDocument.getText();
    const diagnostics: Diagnostic[] = [];

    try {
        const unit = parse(source);

        documentAsts.set(textDocument.uri, unit);

        const issues = semanticCheck(unit).slice(0, settings.maxNumberOfProblems);

        diagnostics.push(
            ...issues.map((issue) => ({
                severity: DiagnosticSeverity.Error,
                range: issue.node.getLspRange(),
                message: issue.message,
                source: "HCL (semcheck)"
            }))
        );
    } catch (e) {
        documentAsts.delete(textDocument.uri);

        if (e instanceof SyntaxError) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: hclToLspRange(e.location),
                message: e.constructor.name + ": " + e.message,
                source: "HCL (parser)"
            });
        } else {
            throw e;
        }
    }

    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((params) => {
    connection.console.log("We received an file change event");
});

connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
    const document = documents.get(params.textDocument.uri);

    if (document === undefined) {
        return [];
    }

    const offset = document.offsetAt(params.position);
    const unit = documentAsts.get(params.textDocument.uri);

    return unit === undefined ? [] : completionService.complete(offset, unit);
});

connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
    const data = item.data as AnyAstNode | undefined;

    if (data) {
        item.detail = data.nodeType;
        item.documentation = `Defined on line ${data.location.start.line} at column ${data.location.start.column}`;
    }

    return item;
});

documents.listen(connection);

connection.listen();
