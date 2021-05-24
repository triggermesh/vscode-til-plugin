# vscode-bridge-dl

An extension for TriggerMesh bridge description language.

## Development
### Development prerequisites

For development you would need following tools:
- [Visual Studio Code](https://code.visualstudio.com/)
- [NodeJS](https://nodejs.org/en/) `^12.0.0`
- [NPM](https://www.npmjs.com/package/npm) (compatible to installed NodeJS version)

_Consider to use [NVM](https://github.com/nvm-sh/nvm) instead of plain **NodeJS** + **NPM** installation It would make things easier. In case of Windows OS, [consider](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows) to use [NVM for Windows](https://github.com/coreybutler/nvm-windows)._

### Development installation

- Install prerequisites.
- Clone this repository.
- Run `npm install` in repository root folder. This will install all necessary npm modules in both the client and server.
- Open VS Code on repository root folder.
- Press <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>B</kbd> to transpile the client and server.
- Switch to the **Debug** viewlet (<kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>D</kbd>).
- Select `Client + Server` launch configuraion from the dropdown list.
- Run the launch configuraion.
- In the `[Extension Development Host]` instance of VS Code:
  - Open a document with `.hcl` extension or in `HCL` language mode.
  - Try to define a block or do other common tasks.
  - Press <kbd>CTRL</kbd>+<kbd>SPACE</kbd> to trigger completion.

### Directory structure

```text
├───.vscode                         IDE-specific settings
├───client                          Client extension (frontend)
│   ├───out                         Produced client extension (JavaScript)
│   └───src                         Extension sources (TypeScript)
│       └───extension.ts            Client extension entry point
├───server                          Language server (backend)
│   ├───out                         Produced server (JavaScript)
│   └───src                         Extension sources (TypeScript)
│       ├───hcl                     HCL language parser and AST
│       │   ├───grammar.pegjs       Language parser grammar (PEG.js)
│       │   ├───nodes.ts            AST implementation (AST nodes and traversal logic)
│       │   ├───parser.ts           Produced language parser.
│       │   └───parser_header.ts    TypeScript source that is added to beginning of generated parser.
│       ├───checkers                Diagnostic components for AST checking and other validation
│       ├───suggestors              Completion items suggestion components
│       ├───completion.ts           BridgeDL completion service
│       ├───diagnostics.ts          BridgeDL diagnosticts service
│       ├───schema.ts               BridgeDL blocks schema (blocks and attributes)
│       └───server.ts               Server entry point
├───syntaxes                        TextMate highlighting grammars
│   └───hcl.tmLanguage.json         HCL language highlighting grammar
└───language-configuration.json     IDE-specific language behavior settings
```

### Server approach

Following approach is used for implementation:
- Incoming source is parsed by a custom HCL parser and returns AST. Note following:
  - Custom parser is needed to relax parsing rules little bit here-and-there: allow incomplete blocks and dangling identifiers.
  - Custom parser is generated by [PEG.js](https://pegjs.org/) / [TS PEG.js](https://github.com/metadevpro/ts-pegjs). Grammar is generated at package build step, so we do not need to re-parse grammar each time.
- Produced AST is processed:
  - Passed to [diagnostic service](https://github.com/triggermesh/vscode-bridge-dl/blob/main/server/src/diagnostics.ts) to inform client about semantic issues: relaxed grammar elements that are not applicable to production, misused code entities. Diagnostic components are located in directory [`checkers/`](https://github.com/triggermesh/vscode-bridge-dl/tree/main/server/src/checkers).
  - Passed to [completion service](https://github.com/triggermesh/vscode-bridge-dl/blob/main/server/src/completion.ts) alongside with cursor position if there is a completion request. Completion suggestions are produced, considering [defined schema](https://github.com/triggermesh/vscode-bridge-dl/blob/main/server/src/schema.ts). Completion components are located in directory [`suggestors/`](https://github.com/triggermesh/vscode-bridge-dl/tree/main/server/src/suggestors).
