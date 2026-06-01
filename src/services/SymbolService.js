const log = require('./LogService');

const SYMBOLOGY_URL = 'https://api.scryfall.com/symbology';

class SymbolService {
  constructor() {
    this.symbolMap = new Map(); // '{W}' -> data URI string
    this.status = 'unloaded';
  }

  async load() {
    try {
      const res = await fetch(SYMBOLOGY_URL, {
        headers: { 'User-Agent': 'MTGHelper/1.0' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      await Promise.all(data.data.map(symbol => this._fetchSymbol(symbol)));

      this.status = 'ready';
      log.info('Symbols', `Loaded ${this.symbolMap.size} mana symbols`);
    } catch (err) {
      this.status = 'failed';
      log.warn('Symbols', `Failed to load symbol map: ${err.message}. Symbols will render as text.`);
    }
  }

  async _fetchSymbol(symbol) {
    try {
      const res = await fetch(symbol.svg_uri, {
        headers: { 'User-Agent': 'MTGHelper/1.0' },
      });
      if (!res.ok) return;
      const svg = await res.text();
      this.symbolMap.set(symbol.symbol, `data:image/svg+xml,${encodeURIComponent(svg)}`);
    } catch {
      // Skip missing symbols - they'll fall back to text
    }
  }

  getSymbolMap() {
    return Object.fromEntries(this.symbolMap);
  }
}

module.exports = SymbolService;
