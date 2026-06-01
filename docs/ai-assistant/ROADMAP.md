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

- [x] Manual card search (search bar, Enter key support, loading state, status messages)
- [x] Full card detail view (image, info, meta - same three sections)
- [x] 10 card cap with FIFO rotation - oldest card evicted when cap is reached
- [ ] Alternate printings browser (lazy - fetch count on load, full list on demand)
- [ ] Card display layout redesign: split top half (text left / image right), meta bottom

**Requirements covered:** REQ-004 (partial - alternate printings and layout redesign pending)

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

- [ ] `StatusService` - main process event emitter; services call `StatusService.emit()`
- [ ] `status-update` IPC push channel (main → renderer)
- [ ] `StatusBarController` - single-line bottom bar, idle timer, toggle state
- [ ] Eye icon toggle: "Diagnostics on" / "Diagnostics off", bar collapses when off
- [ ] Status calls wired into all services: CatalogService, SymbolService,
  KnowledgeBaseService, LLMProviderFactory, MCPOrchestrator, ScryfallProvider
- [ ] Persistent toggle preference via Settings (Phase 4)

**Requirements covered:** REQ-013

---

## Cross-cutting: Local Data Layer

Replace startup network fetches with a local bulk data layer. Eliminates most
runtime Scryfall traffic; app starts immediately from cached data.

- [ ] Download Scryfall `oracle-cards` bulk snapshot to `resources/data/scryfall-bulk/`
- [ ] `LocalDataService` - checks local data first, falls back to live Scryfall
- [ ] Refactor `ScryfallProvider` to call `LocalDataService` instead of Scryfall API directly
- [ ] Refactor `CatalogService` to read card names from local bulk data
- [ ] Background freshness check + refresh on startup
- [ ] Bundle mana symbol SVGs into `resources/data/symbols/` at build time;
  remove `SymbolService` startup network call

**Requirements covered:** REQ-016

---

## Cross-cutting: User Data Layer

Persistent storage foundation for decks, collection, favorites, and usage logs.
Must exist before Workshop deck saving or token telemetry can be built.

- [ ] `UserDataService` - SQLite via `better-sqlite3`; tables: decks, deck_cards,
  favorites, collection, llm_usage
- [ ] `UserPreferencesService` - JSON file storage for settings, user profile,
  wildcard budgets
- [ ] Wire into composition root (`main.js`)
- [ ] Add `llm_usage` logging to `ClaudeService.js` immediately after table exists

**Requirements covered:** REQ-018, REQ-020 (logging only - panel is Phase 5)

---

## Cross-cutting: Card Tooltip Service

Shared hover tooltip infrastructure used by Workshop initially, adoptable by
all other views without rework.

- [ ] `CardTooltipController` - single shared controller, one floating `<div>`
  at document level
- [ ] Hover listeners wired to any card row with `data-card-image` attribute
- [ ] Viewport-aware positioning (clamps to screen edges)
- [ ] Integrated into Workshop card list areas (Phase 3)
- [ ] Future: MTG Wizard bolded card names, Card Lookup rows

**Requirements covered:** REQ-014

---

## Phase 3 - Workshop

Build the two-panel collaborative deck building workspace.

> **Note:** The previous three-area layout (left player / center chat / right LLM)
> has been superseded. See REQ-005 and DECISIONS.md for the redesigned layout.

- [ ] Two-panel layout: conversation | deck list (resizable)
- [ ] Toolbar: deck name, format selector, strategy selector, Save, Export
- [ ] Deck contract: format, strategy, win condition, color identity, wildcard budget mode
- [ ] Session start - contract gathering flow (max 3 questions before cards surface)
- [ ] Workshop system prompt: deckbuilding expert, anti-sycophancy, contract enforcement,
  SUGGESTIONS block spec, wildcard budget awareness
- [ ] MCPOrchestrator Workshop mode: inject deck state (compact notation) + contract,
  parse SUGGESTIONS block from response, route to deck list
- [ ] Deck list panel: full card list with +/- controls, mana curve, color distribution,
  creature/spell ratio, card count, land count - always visible
- [ ] Inline pill rendering for suggested cards with single-click add
- [ ] Bolded hoverable card names for mentioned-only cards
- [ ] Bulk suggestion flow: Review & Add All / Review Card by Card / Dismiss
- [ ] Swap suggestion rendering: named card swaps with Apply / Ignore
- [ ] User delegation handling ("your call" → Claude commits and narrates)
- [ ] Wildcard budget sliders (Common / Uncommon / Rare / Mythic) in toolbar
- [ ] CatalogService runs on user messages → surfaces candidate cards
- [ ] Card tooltip integration (REQ-014)
- [ ] Card favorites star icon in deck list (REQ-017)
- [ ] MTGA plain text import/export
- [ ] Deck save / load via UserDataService (REQ-018)

**Requirements covered:** REQ-005, REQ-009, REQ-014, REQ-017 (partial)

---

## Phase 4 - Settings and Configuration

- Settings dialogue accessible from the app
- Feed Lookup from Chat toggle
- Inject card context into prompts toggle (with token usage tooltip)
- LLM provider selector (Ollama / Claude API); API keys remain in env vars -
  settings UI surfaces provider selection only
- Knowledge base status panel: official vs. user topics, last refresh, manual trigger
- User profile editor: persistent context injected into every LLM session (REQ-012)
- Diagnostics bar toggle persistence
- Any additional settings surfaced by earlier phases

**Requirements covered:** REQ-006, REQ-008 (partial), REQ-012

---

## Phase 5 - Multi-LLM Support (in progress - pulled forward)

Allow the user to choose their LLM backend.

- Provider selector in Settings (Ollama, Claude API)
- Refactor OllamaService into a provider pattern (mirrors MCP provider arch)
- Clear UX guidance on Anthropic API key vs. Claude.ai subscription distinction
- Note: API keys always live in OS env vars - no key storage in the app

**Requirements covered:** REQ-008

---

## Phase 6 - Token Usage Panel

Surface usage telemetry to the user. Logging starts as soon as `UserDataService`
exists (cross-cutting); this phase builds the UI on top of that data.

- [ ] Usage summary view: avg tokens per turn by tab, prompt/completion ratio,
  most expensive turn, estimated API cost, total spend
- [ ] Query view: filter by date, tab, token thresholds; individual turn breakdowns
- [ ] CSV export of full history or current filtered view

**Requirements covered:** REQ-020 (panel)

---

## Phase 7 - Collection Manager Tab

A dedicated fourth tab for personal MTGA card collection management.

- [ ] Collection import from MTGA exporter tool (CSV, JSON, plain text)
- [ ] Owned card tracking with quantities (stored in UserDataService)
- [ ] Workshop integration: owned card indicators in deck lists
- [ ] "Suggest owned cards only" toggle surfaced in Workshop and Settings

**Requirements covered:** REQ-015

---

## Future / Unscheduled

- Additional data providers beyond Scryfall (e.g. EDHRec, MTGGoldfish)
- Format legality checker against a saved deck
- Price tracking over time
- 17Lands integration for Limited/draft win-rate data
- MTGGoldfish meta snapshots
- Full UI/UX visual overhaul with MTG color themes (REQ-021 governs CSS standards
  from day one; the overhaul applies the themes when designed)
