# MTG Helper - Architecture Decision Log

## Technology Stack

| Decision | Why |
|---|---|
| Electron + Node.js | Cross-platform desktop app, native OS integration |
| Ollama (local LLM) | Free, no API costs, privacy - runs entirely on local hardware |
| Llama 3.1 8B | Strong reasoning ability, fits comfortably in a 4070's 12GB VRAM |
| Webpack | Proper ES module bundling for renderer process - industry standard for Electron apps, enables future React adoption |

## Security

| Decision | Why |
|---|---|
| contextIsolation: true | Electron security best practice - renderer cannot access Node.js directly |
| nodeIntegration: false | Prevents renderer from requiring Node modules, reduces attack surface |
| preload.js bridge | Safe, explicit API surface between main and renderer processes |

## Architecture

| Decision | Why |
|---|---|
| IpcHandlerRegistry | Keeps IPC concerns out of main.js, single responsibility principle |
| Separate services/ controllers/ ipc/ directories | Separation of concerns, scalability, testability |
| OllamaService class | Encapsulates all AI communication, easy to swap providers later |
| ChatViewController class | Separates UI logic from business logic |

## Branching Strategy

- master - stable milestones only
- dev - active development branch
- Feature branches as needed
