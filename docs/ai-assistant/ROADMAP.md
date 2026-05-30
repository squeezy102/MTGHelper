# MTG Helper - Roadmap

High-level build order. Each phase should be stable and committed before the next begins.

---

## Phase 1 - App Shell (current focus)

Restructure the application around the three-tab layout. No new features - just
getting the scaffolding right so everything that follows has a solid home.

- Replace the hardcoded left/right split with a tabbed app shell
- Implement pop-out window functionality
- Migrate the existing Assistant chat into the Assistant tab
- Migrate the existing card panel into the Lookup tab (as-is, no new Lookup features yet)
- Inter-tab/inter-window communication via IPC event bus
- Feed-from-chat toggle wired up (Lookup tab)

**Requirements covered:** REQ-003, REQ-004 (partial)

---

## Phase 2 - Lookup Tab

Enhance the Lookup tab as a standalone manual card reference tool.

- Manual card search (search bar, results list)
- Full card detail view (image, info, meta - same three sections)
- Batch import from a deck list (paste a list, fetch all cards with rate limiting)
- No cap on card count
- LLM response card matching (REQ-009) - run catalog matching on AI responses,
  feed both user and LLM card finds to Lookup when "Write to Lookup" is on

**Requirements covered:** REQ-004 (complete), REQ-009

---

## Phase 2b - Knowledge Base

Build the foundational MTG knowledge layer that grounds every LLM conversation
in verified, source-traceable facts.

- `resources/knowledge/` directory structure (sources/, topics/, manifest.json)
- KnowledgeBaseService: startup loading, keyword matching, always-inject glossary,
  MCPOrchestrator integration
- ContentManagerService: fetch WotC Comprehensive Rules, Scryfall catalogs,
  MTGJson; rebuild official topic files; 30-day auto-refresh + user-triggered
- Seed topics/ with official-source versions of: glossary, rules & mechanics,
  card types & interactions, formats & legality
- Deck building strategy file ships as a user-maintained example with disclaimer
- KB status visible in Settings (which topics are official vs. user-maintained)

**Requirements covered:** REQ-010, REQ-011

---

## Phase 3a - Deck Builder: Conversational Layer

Build the AI-assisted conversational half of the Deck Builder tab.

- Split-pane layout: user side (input + cards) / LLM side (response + cards)
- Card matching on both sides of conversation (REQ-009 routing)
- Cards addable to a basic deck list from either pane
- Conversational context scoped to deck building (system prompt tuned)

**Requirements covered:** REQ-005 (partial - conversational layer)

---

## Phase 3b - Deck Builder: Management Tools

Build the deck management and analysis tools on top of the Phase 3a foundation.

- Full deck list with card counts, totals, add/remove/adjust
- Import / export in MTGA format
- Mana curve, creature vs. spell, color breakdown
- MTGA personal library storage and owned card indicators
- Custom deck save / load

**Requirements covered:** REQ-005 (complete)

---

## Phase 4 - Settings and Configuration

- Settings dialogue accessible from the app
- Feed Lookup from Chat toggle
- Inject card context into prompts toggle (with token usage tooltip)
- LLM provider selector and API key management (REQ-008)
- Knowledge base status panel: official vs. user topics, last refresh, manual trigger
- User profile editor: persistent context injected into every LLM session (REQ-012)
- Any additional settings surfaced by earlier phases

**Requirements covered:** REQ-006, REQ-008 (partial), REQ-012

---

## Phase 5 - Multi-LLM Support

Allow the user to choose their LLM backend and configure credentials.

- Provider selector in Settings (Ollama, Claude API)
- API key input and local storage for cloud providers
- Refactor OllamaService into a provider pattern (mirrors MCP provider arch)
- Clear UX guidance on Anthropic API key vs. Claude.ai subscription distinction

**Requirements covered:** REQ-008

---

## Future / Unscheduled

- Additional data providers beyond Scryfall (e.g. EDHRec, MTGGoldfish)
- Deck suggestions / AI-assisted deck building via the Assistant
- Format legality checker against a saved deck
- Price tracking over time
