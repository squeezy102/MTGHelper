const CATALOG_URL = 'https://api.scryfall.com/catalog/card-names';
const LOAD_TIMEOUT_MS = 10000;

class CatalogService {
  constructor() {
    this.nameMap = new Map(); // normalized -> original casing
    this.status = 'unloaded'; // 'unloaded' | 'ready' | 'failed'
    this.errorMessage = null;
  }

  async load() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);

      const res = await fetch(CATALOG_URL, {
        headers: { 'User-Agent': 'MTGHelper/1.0' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Scryfall catalog returned HTTP ${res.status}`);
      }

      const data = await res.json();
      for (const name of data.data) {
        this.nameMap.set(this._normalize(name), name);
      }

      this.status = 'ready';
      console.log(`[Catalog] Loaded ${this.nameMap.size} card names.`);
    } catch (err) {
      this.status = 'failed';
      this.errorMessage = err.name === 'AbortError'
        ? 'Scryfall catalog request timed out. Card recognition will be unavailable until the app is restarted.'
        : `Failed to load card catalog: ${err.message}. Card recognition will be unavailable until the app is restarted.`;
      console.error('[Catalog]', this.errorMessage);
    }
  }

  findInMessage(message) {
    if (this.status !== 'ready') return [];

    const words = message
      .replace(/[^a-zA-Z0-9\s'-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);

    const found = new Set();

    for (let start = 0; start < words.length; start++) {
      for (let len = 1; len <= 5 && start + len <= words.length; len++) {
        const phrase = this._normalize(words.slice(start, start + len).join(' '));
        if (this.nameMap.has(phrase)) {
          found.add(this.nameMap.get(phrase));
        }
      }
    }

    return [...found];
  }

  getStatus() {
    return { status: this.status, errorMessage: this.errorMessage };
  }

  _normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }
}

module.exports = CatalogService;
