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
import { SemanticChecker } from "./checkers";
import { CompletionService } from "./completion";
import { DiagnosticsService } from "./diagnostics";
import { ConfigFile, hclToLspRange, parse, SyntaxError } from "./hcl";
import { BlocksSuggestor, ToSuggestor } from "./suggestors";

const connection = createConnection(ProposedFeatures.all);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

interface Settings {
    maxNumberOfProblems: number;
}

const defaultSettings: Settings = { maxNumberOfProblems: 100 };

let globalSettings: Settings = defaultSettings;

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const documentSettings: Map<string, Thenable<Settings>> = new Map();
const documentAsts: Map<string, ConfigFile> = new Map();

const completionService = new CompletionService([new BlocksSuggestor(), new ToSuggestor()]);
const diagnosticsService = new DiagnosticsService([new SemanticChecker()]);

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

async function processDocument(textDocument: TextDocument): Promise<void> {
    const settings = await getDocumentSettings(textDocument.uri);
    const source = textDocument.getText();
    const diagnostics: Diagnostic[] = [];

    try {
        const ast = parse(source);

        documentAsts.set(textDocument.uri, ast);

        const issues = diagnosticsService.check(ast).slice(0, settings.maxNumberOfProblems);

        diagnostics.push(...issues);
    } catch (e) {
        documentAsts.delete(textDocument.uri);

        if (e instanceof SyntaxError) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: hclToLspRange(e.location),
                message: e.constructor.name + ": " + e.message,
                source: "vscode-bridge-dl (parser)"
            });
        } else {
            throw e;
        }
    }

    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.onDidClose((e) => {
    documentSettings.delete(e.document.uri);
    documentAsts.delete(e.document.uri);
});

documents.onDidChangeContent((e) => {
    processDocument(e.document);
});

documents.listen(connection);

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );

    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
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
});

connection.onDidChangeConfiguration((params) => {
    if (hasConfigurationCapability) {
        documentSettings.clear();
    } else {
        globalSettings = <Settings>params.settings["vscode-bridge-dl"] || defaultSettings;
    }

    for (const document of documents.all()) {
        processDocument(document);
    }
});

connection.onDidChangeWatchedFiles((params) => {
    for (const e of params.changes) {
        const document = documents.get(e.uri);

        if (document) {
            processDocument(document);
        }
    }
});

connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
    const document = documents.get(params.textDocument.uri);

    if (document) {
        const ast = documentAsts.get(params.textDocument.uri);

        if (ast) {
            const offset = document.offsetAt(params.position);

            return completionService.complete(offset, ast);
        }
    }

    return [];
});

connection.listen();
