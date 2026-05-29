const { ipcMain } = require('electron');
const OllamaService = require('../services/OllamaService');

class IpcHandlerRegistry {
  constructor() {
    this.ollamaService = new OllamaService();
  }

  register() {
    ipcMain.handle('send-message', async (event, message, history) => {
      return await this.ollamaService.sendMessage(message, history);
    });
  }
}

module.exports = IpcHandlerRegistry;