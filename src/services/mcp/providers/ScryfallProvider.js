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
    console.log('[Scryfall] Candidates extracted:', cardNames);
    if (cardNames.length === 0) return { contextText: null, cards: [] };

    // Try all candidates - extraction already caps the list
    const rawCards = await Promise.all(
      cardNames.map(name => this._fetchCard(name))
    );
    const validCards = rawCards.filter(Boolean);
    if (validCards.length === 0) return { contextText: null, cards: [] };

    // Deduplicate by card id, then cap at MAX_CARDS unique results
    const seen = new Set();
    const uniqueCards = validCards.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    }).slice(0, MAX_CARDS);

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

    // 1. Quoted strings - highest confidence
    const quoted = message.match(/"([^"]+)"/g) || [];
    for (const q of quoted) candidates.push(q.replace(/"/g, '').trim());

    const words = message.replace(/[^a-zA-Z\s'-]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
    const lc = words.map(w => w.toLowerCase());

    // 2. 2-word sequences (highest signal - most card names are 1-3 words)
    for (let i = 0; i <= words.length - 2; i++) {
      if (!COMMON_WORDS.has(lc[i]) || !COMMON_WORDS.has(lc[i + 1])) {
        candidates.push(words.slice(i, i + 2).join(' '));
      }
    }

    // 3. Single non-common words (min 3 chars - catches short names like "Opt")
    for (let i = 0; i < words.length; i++) {
      if (!COMMON_WORDS.has(lc[i]) && words[i].length >= 3) candidates.push(words[i]);
    }

    // 4. 3-word sequences as a fallback (catches "Sheltered by Ghosts" style names)
    for (let i = 0; i <= words.length - 3; i++) {
      if (!COMMON_WORDS.has(lc[i])) candidates.push(words.slice(i, i + 3).join(' '));
    }

    return [...new Set(candidates)].slice(0, 12);
  }

  async _fetchCard(name) {
    try {
      const url = `${SCRYFALL_BASE}/cards/named?fuzzy=${encodeURIComponent(name)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'MTGHelper/1.0' } });
      console.log(`[Scryfall] "${name}" -> HTTP ${res.status}`);
      if (!res.ok) return null;
      const card = await res.json();
      console.log(`[Scryfall] "${name}" resolved to: ${card.name}`);
      return card;
    } catch (err) {
      console.error(`[Scryfall] fetch error for "${name}":`, err.message);
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
