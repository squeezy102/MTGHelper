const BaseProvider = require('./BaseProvider');

const SCRYFALL_BASE = 'https://api.scryfall.com';
const MAX_CARDS = 5;
const MAX_RULINGS = 5;
const DISPLAYED_FORMATS = [
  'standard', 'pioneer', 'modern', 'legacy', 'vintage',
  'commander', 'pauper', 'historic', 'alchemy', 'explorer', 'brawl'
];

class ScryfallProvider extends BaseProvider {
  canHandle(intentFlags) {
    return true;
  }

  async getContext(message, intentFlags) {
    const cardNames = this._extractCardNames(message);
    if (cardNames.length === 0) return { contextText: null, cards: [] };

    const rawCards = await Promise.all(
      cardNames.slice(0, MAX_CARDS).map(name => this._fetchCard(name))
    );
    const validCards = rawCards.filter(Boolean);
    if (validCards.length === 0) return { contextText: null, cards: [] };

    const cards = await Promise.all(
      validCards.map(raw => this._buildCardData(raw, intentFlags))
    );

    const contextText = cards
      .map(card => this._cardToContextText(card, intentFlags))
      .join('\n\n');

    return { contextText, cards };
  }

  _extractCardNames(message) {
    const names = [];

    const quoted = message.match(/"([^"]+)"/g) || [];
    names.push(...quoted.map(q => q.replace(/"/g, '').trim()));

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

  async _buildCardData(raw, intentFlags) {
    const rulings = intentFlags.isRulesQuestion
      ? (await this._fetchRulings(raw.id)).slice(0, MAX_RULINGS).map(r => r.comment)
      : [];

    return {
      id: raw.id,
      name: raw.name,
      manaCost: raw.mana_cost || null,
      typeLine: raw.type_line,
      oracleText: raw.oracle_text || null,
      power: raw.power || null,
      toughness: raw.toughness || null,
      imageUri: raw.image_uris?.normal
        || raw.card_faces?.[0]?.image_uris?.normal
        || null,
      legalities: raw.legalities || {},
      prices: raw.prices || {},
      rulings,
    };
  }

  _cardToContextText(card, intentFlags) {
    const parts = [
      `${card.name} ${card.manaCost || ''} | ${card.typeLine}`,
      card.oracleText || '',
    ];

    if (card.power) parts.push(`${card.power}/${card.toughness}`);

    if (intentFlags.isRulesQuestion && card.rulings.length > 0) {
      parts.push(`Rulings:\n${card.rulings.map(r => `- ${r}`).join('\n')}`);
    }

    if (intentFlags.isLegalityQuestion || intentFlags.isArenaQuestion) {
      const formats = intentFlags.isArenaQuestion
        ? ['standard', 'historic', 'alchemy', 'explorer']
        : DISPLAYED_FORMATS;
      const lines = formats
        .filter(f => card.legalities[f] && card.legalities[f] !== 'not_available')
        .map(f => `${f}: ${card.legalities[f]}`);
      if (lines.length) parts.push(`Legality: ${lines.join(' | ')}`);
    }

    if (intentFlags.isPricingQuestion) {
      const prices = [];
      if (card.prices.usd) prices.push(`$${card.prices.usd}`);
      if (card.prices.usd_foil) prices.push(`$${card.prices.usd_foil} foil`);
      if (prices.length) parts.push(`Price: ${prices.join(' | ')}`);
    }

    return parts.filter(Boolean).join('\n');
  }
}

module.exports = ScryfallProvider;
