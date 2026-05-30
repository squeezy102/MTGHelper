const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class WindowManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.popouts = {}; // tabName -> BrowserWindow
  }

  register() {
    ipcMain.handle('popout-tab', (event, tabName) => {
      this._openPopout(tabName);
    });

    ipcMain.handle('relay-cards-to-lookup', (event, payload) => {
      const lookupWin = this.popouts['lookup'];
      if (lookupWin && !lookupWin.isDestroyed()) {
        lookupWin.webContents.send('cards-from-chat', payload);
      }
    });

    ipcMain.handle('get-view-assignment', (event) => {
      for (const [tabName, win] of Object.entries(this.popouts)) {
        if (!win.isDestroyed() && win.webContents.id === event.sender.id) {
          return tabName;
        }
      }
      return null;
    });
  }

  _openPopout(tabName) {
    if (this.popouts[tabName] && !this.popouts[tabName].isDestroyed()) {
      this.popouts[tabName].focus();
      return;
    }

    const win = new BrowserWindow({
      width: 500,
      height: 800,
      title: `MTG Helper - ${this._tabTitle(tabName)}`,
      webPreferences: {
        preload: path.join(__dirname, '../../preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    win.loadFile('src/index.html');

    // Once the pop-out has finished loading and its JS has initialised,
    // tell the main window to relay its current lookup state to it.
    win.webContents.on('did-finish-load', () => {
      if (tabName === 'lookup' && this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('send-current-cards');
      }
    });

    win.on('closed', () => {
      delete this.popouts[tabName];
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('tab-returned', tabName);
      }
    });

    this.popouts[tabName] = win;
  }

  _tabTitle(tabName) {
    return { assistant: 'Assistant', lookup: 'Lookup', deckbuilder: 'Deck Builder' }[tabName] || tabName;
  }
}

module.exports = WindowManager;
