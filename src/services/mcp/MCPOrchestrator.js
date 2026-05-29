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
  constructor() {
    this.providers = [new ScryfallProvider()];
  }

  async getContext(message) {
    const intentFlags = this._detectIntent(message);

    const contexts = await Promise.all(
      this.providers
        .filter(p => p.canHandle(intentFlags))
        .map(p => p.getContext(message, intentFlags))
    );

    const valid = contexts.filter(Boolean);
    if (valid.length === 0) return null;

    return `[MTG Reference Data]\n${valid.join('\n\n')}\n[End Reference Data]`;
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
