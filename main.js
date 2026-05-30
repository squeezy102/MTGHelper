const { app, BrowserWindow } = require('electron');
const path = require('path');
const IpcHandlerRegistry = require('./src/ipc/IpcHandlerRegistry');
const CatalogService = require('./src/services/CatalogService');

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 1000,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
    }
  });

  mainWindow.loadFile('src/index.html');
}

app.whenReady().then(async () => {
  const catalog = new CatalogService();
  await catalog.load();

  const ipcRegistry = new IpcHandlerRegistry(catalog);
  ipcRegistry.register();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
