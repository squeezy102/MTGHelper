const { ipcMain } = require('electron');
const OllamaService = require('../services/OllamaService');
const MCPOrchestrator = require('../services/mcp/MCPOrchestrator');

class IpcHandlerRegistry {
  constructor() {
    this.ollamaService = new OllamaService();
    this.orchestrator = new MCPOrchestrator();
  }

  register() {
    ipcMain.handle('send-message', async (event, message, history) => {
      const context = await this.orchestrator.getContext(message);
      return await this.ollamaService.sendMessage(message, history, context);
    });
  }
}

module.exports = IpcHandlerRegistry;