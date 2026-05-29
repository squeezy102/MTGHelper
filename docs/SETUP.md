# MTG Helper - Environment Setup

## Prerequisites

1. Install Ollama from https://ollama.com
2. Run `ollama run llama3.1` to download the Llama 3.1 8B model (~4.7GB)
3. Install Node.js LTS from https://nodejs.org
4. Install VS Code from https://code.visualstudio.com
5. Install Git from https://git-scm.com

## Windows Execution Policy Fix

If you get a "running scripts is disabled" error in PowerShell:

    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

## Project Setup

1. Clone the repo: `git clone https://github.com/squeezy102/MTGHelper.git`
2. Open folder in VS Code
3. Open terminal with Ctrl + `
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

## Development Notes

- Ollama runs as a background service automatically after first install
- Changes to main.js require a full app restart
- Changes to HTML/CSS can be refreshed with Ctrl+R in the app window
- All development work happens on the dev branch
- Only merge to master at stable milestones
