const BaseProvider = require('./BaseProvider');

const SCRYFALL_BASE = 'https://api.scryfall.com';
const MAX_CARDS = 5;
const MAX_RULINGS = 5;

class ScryfallProvider extends BaseProvider {
  canHandle(intentFlags) {
    return true;
  }

  async getContext(message, intentFlags) {
    const cardNames = this._extractCardNames(message);
    if (cardNames.length === 0) return null;

    const cards = await Promise.all(
      cardNames.slice(0, MAX_CARDS).map(name => this._fetchCard(name))
    );
    const validCards = cards.filter(Boolean);
    if (validCards.length === 0) return null;

    const contextParts = await Promise.all(
      validCards.map(card => this._buildCardContext(card, intentFlags))
    );

    return contextParts.filter(Boolean).join('\n\n');
  }

  _extractCardNames(message) {
    const names = [];

    // Quoted strings are treated as definite card names
    const quoted = message.match(/"([^"]+)"/g) || [];
    names.push(...quoted.map(q => q.replace(/"/g, '').trim()));

    // Capitalized multi-word sequences (2-4 words) as likely card names
    const capitalized = message.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g) || [];
    names.push(...capitalized);

    return [...new Set(names)];
  }

  async _fetchCard(name) {
    try {
      const res = await fetch(
        `${SCRYFALL_BASE}/cards/named?fuzzy=${encodeURIComponent(name)}`,
        { headers: { 'User-Agent': 'MTGHelper/1.0' } }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async _fetchRulings(cardId) {
    try {
      const res = await fetch(
        `${SCRYFALL_BASE}/cards/${cardId}/rulings`,
        { headers: { 'User-Agent': 'MTGHelper/1.0' } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  }

  async _buildCardContext(card, intentFlags) {
    const parts = [
      `${card.name} ${card.mana_cost || ''} | ${card.type_line}`,
      card.oracle_text || ''
    ];

    if (card.power && card.toughness) {
      parts.push(`${card.power}/${card.toughness}`);
    }

    if (intentFlags.isRulesQuestion) {
      const rulings = await this._fetchRulings(card.id);
      if (rulings.length > 0) {
        const lines = rulings.slice(0, MAX_RULINGS).map(r => `- ${r.comment}`);
        parts.push(`Rulings:\n${lines.join('\n')}`);
      }
    }

    if (intentFlags.isLegalityQuestion || intentFlags.isArenaQuestion) {
      const relevant = intentFlags.isArenaQuestion
        ? ['standard', 'historic', 'alchemy', 'explorer']
        : Object.keys(card.legalities);

      const lines = relevant
        .filter(fmt => card.legalities[fmt] && card.legalities[fmt] !== 'not_available')
        .map(fmt => `${fmt}: ${card.legalities[fmt]}`);

      if (lines.length) parts.push(`Legality: ${lines.join(' | ')}`);
    }

    if (intentFlags.isPricingQuestion && card.prices) {
      const prices = [];
      if (card.prices.usd) prices.push(`$${card.prices.usd}`);
      if (card.prices.usd_foil) prices.push(`$${card.prices.usd_foil} foil`);
      if (prices.length) parts.push(`Price: ${prices.join(' | ')}`);
    }

    return parts.filter(Boolean).join('\n');
  }
}

module.exports = ScryfallProvider;
