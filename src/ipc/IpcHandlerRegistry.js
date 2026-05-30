const { ipcMain } = require('electron');
const OllamaService = require('../services/OllamaService');
const MCPOrchestrator = require('../services/mcp/MCPOrchestrator');

class IpcHandlerRegistry {
  constructor(catalog) {
    this.catalog = catalog;
    this.ollamaService = new OllamaService();
    this.orchestrator = new MCPOrchestrator(catalog);
  }

  register() {
    ipcMain.handle('send-message', async (event, message, history) => {
      const { context, cards } = await this.orchestrator.getResult(message);
      const response = await this.ollamaService.sendMessage(message, history, context);
      return { response, cards };
    });

    ipcMain.handle('get-catalog-status', () => {
      return this.catalog.getStatus();
    });
  }
}

module.exports = IpcHandlerRegistry;
