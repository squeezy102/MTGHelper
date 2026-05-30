const { app, BrowserWindow } = require('electron');
const path = require('path');
const IpcHandlerRegistry = require('./src/ipc/IpcHandlerRegistry');
const WindowManager = require('./src/ipc/WindowManager');
const CatalogService = require('./src/services/CatalogService');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile('src/index.html');
  return mainWindow;
}

app.whenReady().then(async () => {
  const catalog = new CatalogService();
  await catalog.load();

  const ipcRegistry = new IpcHandlerRegistry(catalog);
  ipcRegistry.register();

  const win = createMainWindow();
  const windowManager = new WindowManager(win);
  windowManager.register();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
