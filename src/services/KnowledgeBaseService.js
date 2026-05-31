const fs   = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, '../../resources/knowledge');
const MANIFEST_PATH = path.join(KNOWLEDGE_DIR, 'manifest.json');
const TOPICS_DIR    = path.join(KNOWLEDGE_DIR, 'topics');

// Map from manifest topic IDs to the intent flag that enables them.
// Topics not in this map are never injected automatically.
const TOPIC_INTENT_MAP = {
  'glossary':       'injectGlossary',
  'rules-and-mechanics': 'injectRules',
  'card-types':     'injectCardTypes',
  'formats':        'injectFormats',
  'deck-building':  'injectDeckBuilding',
};

class KnowledgeBaseService {
  constructor() {
    this.topics = new Map(); // id -> { id, content }
    this._load();
  }

  // Returns a context string for topics relevant to the given intent object,
  // or null if nothing is relevant.
  // intent is the object returned by MessageIntentService.analyze().
  getRelevantContext(intent) {
    if (this.topics.size === 0) return null;

    const selected = [];
    for (const [id, flagName] of Object.entries(TOPIC_INTENT_MAP)) {
      if (intent[flagName] && this.topics.has(id)) {
        selected.push(this.topics.get(id).content);
      }
    }

    return selected.length > 0 ? selected.join('\n\n---\n\n') : null;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _load() {
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch {
      console.warn('[KnowledgeBaseService] manifest.json not found or invalid - knowledge base unavailable');
      return;
    }

    for (const entry of manifest.topics) {
      const filePath = path.join(TOPICS_DIR, entry.file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        this.topics.set(entry.id, { id: entry.id, content });
      } catch {
        console.warn(`[KnowledgeBaseService] Could not load topic file: ${entry.file}`);
      }
    }

    console.log(`[KnowledgeBaseService] Loaded ${this.topics.size} topic(s)`);
  }
}

module.exports = KnowledgeBaseService;
