const ScryfallProvider = require('./providers/ScryfallProvider');

const INTENT_KEYWORDS = {
  isRulesQuestion:   ['can', 'does', 'when', 'trigger', 'stack', 'ruling', 'interaction',
                      'how does', 'resolve', 'ability', 'effect', 'phase', 'priority',
                      'combat', 'damage', 'dies', 'destroy', 'exile', 'ambiguous', 'proceed'],
  isPricingQuestion: ['price', 'worth', 'buy', 'sell', 'cheap', 'expensive', 'value'],
  isLegalityQuestion:['legal', 'ban', 'banned', 'format', 'standard', 'modern',
                      'commander', 'pioneer', 'legacy', 'vintage', 'pauper'],
  isArenaQuestion:   ['arena', 'mtga', 'digital', 'bo1', 'bo3'],
};

class MCPOrchestrator {
  constructor(catalog) {
    this.providers = [new ScryfallProvider(catalog)];
  }

  async getResult(message) {
    const intentFlags = this._detectIntent(message);

    const results = await Promise.all(
      this.providers
        .filter(p => p.canHandle(intentFlags))
        .map(p => p.getContext(message, intentFlags))
    );

    const cards = results.flatMap(r => r.cards || []);
    const contextParts = results.map(r => r.contextText).filter(Boolean);

    const context = contextParts.length > 0
      ? `[MTG Reference Data]\n${contextParts.join('\n\n')}\n[End Reference Data]`
      : null;

    return { context, cards };
  }

  _detectIntent(message) {
    const lower = message.toLowerCase();
    const flags = {};
    for (const [flag, keywords] of Object.entries(INTENT_KEYWORDS)) {
      flags[flag] = keywords.some(k => lower.includes(k));
    }
    return flags;
  }
}

module.exports = MCPOrchestrator;
