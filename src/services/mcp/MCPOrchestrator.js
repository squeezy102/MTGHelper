const log = require('../LogService');

class MCPOrchestrator {
  constructor(catalog, providers, knowledgeBase, intentService) {
    this.catalog       = catalog;
    this.providers     = providers;
    this.knowledgeBase = knowledgeBase;
    this.intentService = intentService;
  }

  async lookupCards(query) {
    const cardNames = this.catalog.findInMessage(query).slice(0, 5);
    if (cardNames.length === 0) return [];
    return this.providers[0].fetchCards(cardNames);
  }

  async getResult(message) {
    log.info('Orchestrator', 'Building context...');
    const intent = this.intentService.analyze(message);

    const results = await Promise.all(
      this.providers
        .filter(p => p.canHandle(intent))
        .map(p => p.getContext(message, intent))
    );

    const cards = results.flatMap(r => r.cards || []);

    const contextParts = [];

    const kbContext = this.knowledgeBase.getRelevantContext(intent);
    if (kbContext) {
      contextParts.push(`[MTG Knowledge Base]\n${kbContext}\n[End Knowledge Base]`);
    }

    const scryfallParts = results.map(r => r.contextText).filter(Boolean);
    if (scryfallParts.length > 0) {
      contextParts.push(`[MTG Reference Data]\n${scryfallParts.join('\n\n')}\n[End Reference Data]`);
    }

    const context = contextParts.length > 0 ? contextParts.join('\n\n') : null;

    if (context) {
      log.info('Orchestrator', `Context ready: ${contextParts.length} section(s), ${context.length} chars, ${cards.length} card(s)`);
    } else {
      log.warn('Orchestrator', 'No context built - LLM will rely on training knowledge only');
    }

    return { context, cards };
  }
}

module.exports = MCPOrchestrator;
