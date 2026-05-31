# MTG Helper - Environment Setup

## Prerequisites

1. Install Ollama from https://ollama.com
2. Run `ollama pull qwen2.5:14b` to download the default local model (~9GB)
3. Install Node.js LTS from https://nodejs.org
4. Install VS Code from https://code.visualstudio.com
5. Install Git from https://git-scm.com

## Windows Execution Policy Fix

If you get a "running scripts is disabled" error in PowerShell:

    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

## Project Setup

1. Clone the repo: `git clone https://github.com/squeezy102/MTGHelper.git`
2. Open folder in VS Code
3. Open terminal with Ctrl+`
4. Install dependencies: `npm install`

## Electron Binary Fix (if needed)

If Electron fails to download its binary automatically:

1. Check your Electron version:
   `node -e "console.log(require('./node_modules/electron/package.json').version)"`
2. Download `electron-v[version]-win32-x64.zip` from https://github.com/electron/electron/releases
3. Extract contents into `node_modules/electron/dist/`
4. Fix path.txt:
   `node -e "require('fs').writeFileSync('node_modules/electron/path.txt', 'electron.exe')"`

## Running the App

    npm start

This runs `webpack` to bundle the renderer, then launches Electron. The bundle
is written to `dist/` (excluded from git - regenerated on every start).

## Development Notes

- Ollama runs as a background service automatically after first install
- `npm start` always rebuilds the Webpack bundle before launching
- Changes to `main.js` or anything in `src/ipc/` or `src/services/` require a full app restart (`npm start`)
- Changes to `src/index.html` or `src/styles/` can be refreshed with Ctrl+R in the app window
- Changes to `src/controllers/` require a Webpack rebuild - run `npm run build` then Ctrl+R, or just `npm start`
- Open DevTools in the app window with Ctrl+Shift+I
- All development work happens on the `dev` branch - only merge to `master` at stable milestones
