const { ipcMain } = require('electron');
const log          = require('../services/LogService');

class IpcHandlerRegistry {
  constructor(catalog, llmService, orchestrator) {
    this.catalog      = catalog;
    this.llmService   = llmService;
    this.orchestrator = orchestrator;
  }

  register() {
    ipcMain.handle('send-message', async (event, message, history) => {
      const preview = message.length > 80 ? message.slice(0, 80) + '…' : message;
      log.info('Chat', `User message (history: ${history.length} msg(s)): "${preview}"`);
      const { context, cards } = await this.orchestrator.getResult(message);
      const response = await this.llmService.sendMessage(message, history, context);
      return { response, cards, contextUsed: context !== null };
    });

    ipcMain.handle('get-catalog-status', () => {
      return this.catalog.getStatus();
    });

    ipcMain.handle('lookup-cards', async (event, query) => {
      return await this.orchestrator.lookupCards(query);
    });

    ipcMain.handle('get-llm-info', () => ({
      displayName: this.llmService.displayName
    }));
  }
}

module.exports = IpcHandlerRegistry;
