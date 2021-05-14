# vscode-bridge-dl

An extension for TriggerMesh bridge description language.

## Development

- Clone this repository.
- Run `npm install` in repository root folder. This will install all necessary npm modules in both the client and server.
- Open VS Code on repository root folder.
- Press <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>B</kbd> to transpile the client and server.
- Switch to the **Debug** viewlet (<kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>D</kbd>).
- Select `Client + Server` from the drop down.
- Run the launch config.
- In the `[Extension Development Host]` instance of VS Code:
  - Open a document with `.hcl` extension or in `HCL` language mode.
  - Press <kbd>CTRL</kbd>+<kbd>SPACE</kbd> to trigger completion.
