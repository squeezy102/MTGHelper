const BaseProvider = require('./BaseProvider');

const SCRYFALL_BASE = 'https://api.scryfall.com';
const MAX_CARDS = 5;
const MAX_RULINGS = 5;
const DISPLAYED_FORMATS = [
  'standard', 'pioneer', 'modern', 'legacy', 'vintage',
  'commander', 'pauper', 'historic', 'alchemy', 'explorer', 'brawl'
];

// Common English words that appear capitalized but are not card names
const COMMON_WORDS = new Set([
  'The', 'A', 'An', 'It', 'He', 'She', 'We', 'They', 'You', 'I',
  'What', 'How', 'When', 'Where', 'Why', 'Who', 'Which',
  'This', 'That', 'These', 'Those', 'My', 'Your', 'His', 'Her', 'Our', 'Their',
  'Is', 'Are', 'Was', 'Were', 'Has', 'Have', 'Had', 'Do', 'Does', 'Did',
  'Can', 'Could', 'Would', 'Should', 'Will', 'May', 'Might', 'Must', 'Shall',
  'Be', 'Been', 'Being', 'And', 'But', 'Not', 'Also', 'Just', 'Then', 'Now',
  'Tell', 'Show', 'Give', 'Make', 'Let', 'Put', 'Get', 'Use', 'See', 'Ask',
  'Please', 'Thanks', 'Hello', 'Hi', 'Hey', 'Yes', 'No', 'Okay', 'Ok',
  'Magic', 'Card', 'Cards', 'Deck', 'Format', 'Turn', 'Game', 'Play', 'Player',
]);

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

    // Deduplicate by card id (multiple name variants can resolve to the same card)
    const seen = new Set();
    const uniqueCards = validCards.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    const cards = await Promise.all(
      uniqueCards.map(raw => this._buildCardData(raw, intentFlags))
    );

    const contextText = cards
      .map(card => this._cardToContextText(card, intentFlags))
      .join('\n\n');

    return { contextText, cards };
  }

  _extractCardNames(message) {
    const names = [];

    // Quoted strings - highest confidence
    const quoted = message.match(/"([^"]+)"/g) || [];
    names.push(...quoted.map(q => q.replace(/"/g, '').trim()));

    // Multi-word capitalized sequences (2-4 words)
    const multiWord = message.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g) || [];
    names.push(...multiWord);

    // Single capitalized words that aren't common English words
    const singleWord = message.match(/\b([A-Z][a-z]{2,})\b/g) || [];
    names.push(...singleWord.filter(w => !COMMON_WORDS.has(w)));

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
      flavorText: raw.flavor_text || null,
      power: raw.power || null,
      toughness: raw.toughness || null,
      artist: raw.artist || null,
      setName: raw.set_name || null,
      collectorNumber: raw.collector_number || null,
      imageUri: raw.image_uris?.normal
        || raw.card_faces?.[0]?.image_uris?.normal
        || null,
      legalities: raw.legalities || {},
      prices: raw.prices || {},
      arenaId: raw.arena_id || null,
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
