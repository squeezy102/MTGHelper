const { app, BrowserWindow } = require('electron');
const path = require('path');

const IpcHandlerRegistry   = require('./src/ipc/IpcHandlerRegistry');
const WindowManager        = require('./src/ipc/WindowManager');
const CatalogService       = require('./src/services/CatalogService');
const KnowledgeBaseService = require('./src/services/KnowledgeBaseService');
const MessageIntentService = require('./src/services/MessageIntentService');
const ScryfallProvider     = require('./src/services/mcp/providers/ScryfallProvider');
const MCPOrchestrator      = require('./src/services/mcp/MCPOrchestrator');
const LLMProviderFactory   = require('./src/services/LLMProviderFactory');

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
  // ── Services ──────────────────────────────────────────────────────────────
  const catalog       = new CatalogService();
  await catalog.load();

  const knowledgeBase    = new KnowledgeBaseService();
  const intentService    = new MessageIntentService();
  const scryfallProvider = new ScryfallProvider(catalog);
  const orchestrator     = new MCPOrchestrator(catalog, [scryfallProvider], knowledgeBase, intentService);
  const llmService       = LLMProviderFactory.create();

  // ── IPC ───────────────────────────────────────────────────────────────────
  const ipcRegistry = new IpcHandlerRegistry(catalog, llmService, orchestrator);
  ipcRegistry.register();

  // ── Window ────────────────────────────────────────────────────────────────
  const win           = createMainWindow();
  const windowManager = new WindowManager(win);
  windowManager.register();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
