# MTG Helper - Roadmap

High-level build order. Each phase should be stable and committed before the next begins.

---

## Phase 1 - App Shell (current focus)

Restructure the application around the three-tab layout. No new features - just
getting the scaffolding right so everything that follows has a solid home.

- Replace the hardcoded left/right split with a tabbed app shell
- Implement pop-out window functionality
- Migrate the existing Assistant chat into the MTG Wizard tab
- Migrate the existing card panel into the Card Lookup tab (as-is, no new Lookup features yet)
- Inter-tab/inter-window communication via IPC event bus
- Feed-from-chat toggle wired up (Card Lookup tab)

**Requirements covered:** REQ-003, REQ-004 (partial)

---

## Phase 2 - Card Lookup Tab

Enhance the Card Lookup tab as a standalone manual card reference tool.

- Manual card search (search bar, results list)
- Full card detail view (image, info, meta - same three sections)
- 10 card cap with FIFO rotation - oldest card evicted when cap is reached

**Requirements covered:** REQ-004 (complete)

---

## Phase 2b - Knowledge Base (in progress)

Build the foundational MTG knowledge layer that grounds every LLM conversation
in verified, source-traceable facts.

- [x] `resources/knowledge/` directory structure (topics/, manifest.json)
- [x] KnowledgeBaseService: startup loading, keyword matching, MCPOrchestrator integration
- [x] Seed topics/: glossary, rules & mechanics, card types & interactions, formats & legality
- [x] Deck building strategy file ships as user-maintained example with disclaimer
- [ ] ContentManagerService: fetch WotC Comprehensive Rules, Scryfall catalogs,
  MTGJson; rebuild official topic files; 30-day auto-refresh + user-triggered
- [ ] sources/ directory (gitignored, populated at runtime by ContentManagerService)
- [ ] KB status visible in Settings (Phase 4)

**Requirements covered:** REQ-010, REQ-011

---

## Cross-cutting: Diagnostics Bar

A real-time status display that keeps the user informed across all phases.
Built as a standalone feature, not tied to a specific phase.

- [x] `StatusService` - main process event emitter; services call `StatusService.emit()`
- [x] `status-update` IPC push channel (main → renderer)
- [x] `StatusBarController` - single-line bottom bar, idle timer, toggle state
- [x] Eye icon toggle: "Diagnostics on" / "Diagnostics off", bar collapses when off
- [x] Status calls wired into all services: CatalogService, SymbolService,
  KnowledgeBaseService, LLMProviderFactory, MCPOrchestrator, ScryfallProvider
- [ ] Persistent toggle preference via Settings (Phase 4)

**Requirements covered:** REQ-013

---

## Cross-cutting: Card Tooltip Service

Shared hover tooltip infrastructure used by Workshop initially, adoptable by
all other views without rework.

- [ ] `CardTooltipController` - single shared controller, one floating `<div>`
  at document level
- [ ] Hover listeners wired to any card row with `data-card-image` attribute
- [ ] Viewport-aware positioning (clamps to screen edges)
- [ ] Integrated into Workshop card list areas (Phase 3a)
- [ ] Future: MTG Wizard bolded card names, Card Lookup rows

**Requirements covered:** REQ-014

---

## Phase 3a - Workshop: Card and Conversation Layer

Build the three-area collaborative workspace with live JSON state management.

- [ ] Three-area layout: left player area | center chat | right LLM area (resizable)
- [ ] Workshop state JSON document: `user_deck`, `user_referenced`, `llm_deck`,
  `llm_referenced`, `llm_notes`
- [ ] Format selection at session start; injected into system prompt
- [ ] Workshop system prompt: deckbuilding expert, format rules, JSON contract spec
- [ ] MCPOrchestrator Workshop mode: inject state JSON, parse LLM JSON response block,
  route structured data to Workshop panel and readable text to chat
- [ ] Left panel: *In Discussion* list + *My Deck* list with +/- controls
- [ ] Right panel: *In Discussion* list + *LLM's Deck* list + *Deck Intent* notes area
- [ ] User actions: promote card to deck, adjust count, remove card, copy from LLM
- [ ] CatalogService runs on user messages → populates `user_referenced`
- [ ] MTGA plain text import/export for user's deck
- [ ] Card tooltip integration (REQ-014)

**Requirements covered:** REQ-005 (partial - conversational layer), REQ-009, REQ-014

---

## Phase 3b - Workshop: Deck Stats and Storage

Build the deck analysis tools and persistence on top of the Phase 3a foundation.

- [ ] Deck stats for user's committed deck: total count, mana curve bar chart,
  creature vs. spell breakdown, color distribution, land ratio, power spike
- [ ] Custom deck save / load (named decks, persisted locally)
- [ ] Collection integration once REQ-015 is built: owned card indicators,
  "suggest owned cards only" toggle

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

## Phase 5 - Multi-LLM Support (in progress - pulled forward)

Allow the user to choose their LLM backend and configure credentials.

- Provider selector in Settings (Ollama, Claude API)
- API key input and local storage for cloud providers
- Refactor OllamaService into a provider pattern (mirrors MCP provider arch)
- Clear UX guidance on Anthropic API key vs. Claude.ai subscription distinction

**Requirements covered:** REQ-008

---

## Phase 6 - Collection Manager Tab

A dedicated fourth tab for personal MTGA card collection management.

- [ ] Collection import from MTGA exporter tool (CSV, JSON, plain text)
- [ ] Owned card tracking with quantities
- [ ] Workshop integration: owned card indicators in deck lists
- [ ] "Suggest owned cards only" toggle surfaced in Workshop and Settings

**Requirements covered:** REQ-015

---

## Future / Unscheduled

- Additional data providers beyond Scryfall (e.g. EDHRec, MTGGoldfish)
- Format legality checker against a saved deck
- Price tracking over time
