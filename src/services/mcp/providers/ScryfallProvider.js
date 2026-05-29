const BaseProvider = require('./BaseProvider');

const SCRYFALL_BASE = 'https://api.scryfall.com';
const MAX_CARDS = 5;
const MAX_RULINGS = 5;
const DISPLAYED_FORMATS = [
  'standard', 'pioneer', 'modern', 'legacy', 'vintage',
  'commander', 'pauper', 'historic', 'alchemy', 'explorer', 'brawl'
];

// Common English words that are unlikely to be card names (all lowercase for comparison)
const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'it', 'he', 'she', 'we', 'they', 'you', 'i',
  'what', 'how', 'when', 'where', 'why', 'who', 'which',
  'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'our', 'their',
  'is', 'are', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did',
  'can', 'could', 'would', 'should', 'will', 'may', 'might', 'must', 'shall',
  'be', 'been', 'being', 'and', 'but', 'not', 'also', 'just', 'then', 'now',
  'tell', 'show', 'give', 'make', 'let', 'put', 'get', 'use', 'see', 'ask',
  'please', 'thanks', 'hello', 'hi', 'hey', 'yes', 'no', 'okay', 'ok',
  'magic', 'card', 'cards', 'deck', 'format', 'turn', 'game', 'play', 'played',
  'player', 'about', 'more', 'some', 'any', 'all', 'for', 'from', 'with',
  'into', 'onto', 'over', 'like', 'than', 'very', 'much', 'want', 'need',
  'think', 'know', 'look', 'help', 'good', 'bad', 'new', 'old', 'here',
  'there', 'its', 'their', 'said', 'each', 'other', 'time', 'back',
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
    const candidates = [];

    // Quoted strings - highest confidence, try as-is
    const quoted = message.match(/"([^"]+)"/g) || [];
    for (const q of quoted) candidates.push(q.replace(/"/g, '').trim());

    // Clean to plain words
    const words = message.replace(/[^a-zA-Z\s'-]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
    const lc = words.map(w => w.toLowerCase());

    // 3-word sequences starting with a non-common word
    for (let i = 0; i <= words.length - 3; i++) {
      if (!COMMON_WORDS.has(lc[i])) candidates.push(words.slice(i, i + 3).join(' '));
    }

    // 2-word sequences where at least one word is non-common
    for (let i = 0; i <= words.length - 2; i++) {
      if (!COMMON_WORDS.has(lc[i]) || !COMMON_WORDS.has(lc[i + 1])) {
        candidates.push(words.slice(i, i + 2).join(' '));
      }
    }

    // Single non-common words (min 4 chars to reduce noise)
    for (let i = 0; i < words.length; i++) {
      if (!COMMON_WORDS.has(lc[i]) && words[i].length >= 4) candidates.push(words[i]);
    }

    // Deduplicate and cap to limit API calls
    return [...new Set(candidates)].slice(0, 8);
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
