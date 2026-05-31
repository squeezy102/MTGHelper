# MTG Helper - AI Session Context

Running notes for AI assistant continuity across sessions.

## Repository State

- **Branch:** `dev` (all active development; merge to `master` at stable milestones only)
- **Last commit:** `46059fe` - "Add message source header and clean up LLM disclosure UX"
- **Uncommitted changes:** None

## Current App State

Phase 1 is complete. Phase 2 (Lookup Tab) is in progress and partially built.

### Phase 1 features (committed, stable)
- Tabbed layout: MTG Wizard / Card Lookup / Workshop (placeholder)
- Pop-out windows per tab; popped-out tabs grayed out in nav, restored on close
- MTG Wizard tab: full-width chat with markdown rendering, "Write to Lookup" toggle
- Scryfall card catalog (~26k names) loaded at startup for exact local name matching
- Longest-match deduplication: overlapping card names in a message keep only the most specific
- Card panel: tab bar + 3-section display (image, card info, card meta)
- Card state persists when Lookup is popped out (main window pushes state on did-finish-load)
- USD-only pricing in card meta section
- **LLM source header** on every assistant message: muted chip showing active provider name
  (e.g. "Claude Haiku"), plus a gold `+ MTGHelper` label when KB context was injected.
  Implemented in `ChatViewController._buildSourceHeader(contextUsed)`. The `contextUsed`
  boolean comes from `IpcHandlerRegistry` (`context !== null` after orchestration).
- **Active LLM label** in the MTG Wizard toolbar (top-right, italic) populated at init via
  `getLlmInfo()` IPC. Updates automatically if provider changes at next restart.

### Phase 2 features (committed)
- **Manual card search** in Card Lookup tab: search bar with Enter key support, loading state,
  status messages. Clears input on submit, shows "No cards found." or error as appropriate.
- **`MCPOrchestrator.lookupCards(query)`** - direct name-based fetch bypassing intent
  detection and LLM context building; used by the Lookup search bar
- **`ScryfallProvider.fetchCards(names)`** - direct card fetch by known name list with no
  context text generation
- **IPC: `lookup-cards`** handler registered in IpcHandlerRegistry; exposed as
  `window.mtgHelper.lookupCards(query)` in preload.js
- **MTG Arena logo** displayed inline in the Availability and Legality meta blocks;
  logo file at `resources/images/MTG_Arena_Logo.png`; CSS: `.arena-logo { height: 32px }`,
  `.arena-label { display: flex; align-items: center; gap: 6px }`
- **Meta block borders** - each `.meta-block` now has a subtle border, border-radius,
  and padding to visually separate the four cells in the meta section
- **Lookup auto-focus** - switching to the Card Lookup tab automatically focuses the search input

### Phase 2 gaps (not yet built)
- Batch import from a deck list (paste, rate-limited fetch)
- Batch import from a deck list (paste, rate-limited fetch) - moved to Workshop tab scope
- LLM response card matching (REQ-009) - scoped to Workshop tab; not yet built
- Mana symbol rendering (REQ-007) - oracle text and mana costs display raw shorthand
  ({B}, {T}, etc.) instead of official WotC SVG icons

### Phase 2b features (committed - KB structure and injection pipeline)
- `resources/knowledge/` directory: `manifest.json` + 5 seeded topic files in `topics/`
- `KnowledgeBaseService` - loads all topic files at startup, keyword-matches using the intent
  object from MessageIntentService, injects relevant sections into LLM context before each message
- `MessageIntentService` - stateless intent analysis: detects question type, MTG vocabulary
  (keywords, mechanics, card types, formats, archetypes), routes to KB topics and Scryfall flags
- `MCPOrchestrator` integrates both services - assembles KB context + Scryfall context before
  each LLM call
- Seeded topics: glossary, rules & mechanics, card types & interactions, formats & legality,
  deck building strategy (user-maintained, ships with disclaimer)

### Phase 2b gaps (not yet built)
- ContentManagerService (REQ-011) - fetches WotC Comprehensive Rules, Scryfall catalogs, MTGJson;
  rebuilds official topic files automatically
- 30/90-day KB staleness notifications
- KB status panel in Settings (Phase 4)

## Active Work / Known Issues

- Slang card names ("bolt", "goyf") won't match the catalog - requires exact or
  near-exact name. Acceptable for now.
- "Write to Lookup" toggle is off by default and not persisted between sessions
  (resets on restart). Persistence is a settings/config feature (Phase 4).
- Workshop tab is a placeholder - Phase 3 work.
- Mana symbols in oracle text and mana cost fields currently render as raw
  shorthand notation ({B}, {T}, etc.). REQ-007 tracks replacement with
  official WotC SVG icons. Scryfall's card symbol endpoint is the intended source.
- `MAX_CARDS = 10` in CardPanelController is correct and intentional for Card Lookup.
  Workshop will need its own separate card panel logic when built - these should diverge.
- **Sticky context on follow-up messages** - when a user sends a correction like "that's wrong,
  try again" with no MTG vocabulary, MessageIntentService finds no keyword matches and
  MCPOrchestrator injects no KB context. The LLM is then flying blind. MCPOrchestrator
  should remember the last injected context and re-use it on follow-ups that generate no
  new context of their own.

## File Structure

```
MTGHelper/
- README.md                         Public-facing onboarding doc; rendered on GitHub as the
                                    repo landing page. Must be kept current - see USERPREFERENCES.md
- main.js                           Composition root: creates and wires all services, registers
                                    IpcHandlerRegistry and WindowManager, creates main window
- preload.js                        contextBridge IPC surface for renderer
- webpack.config.js                 Bundles src/renderer.js -> dist/renderer.bundle.js
- package.json
- resources/images/
  - MTG_Arena_Logo.png              MTGA logo used inline in card meta labels
- resources/knowledge/
  - manifest.json                   Topic index: IDs, keywords, injection flags, source type
  - topics/                         MD files injected into LLM context (5 seeded)
- docs/ai-assistant/                This directory
- src/
  - index.html                      App shell: nav bar + 3 tab panels
  - renderer.js                     Webpack entry - boots AppViewController
  - styles/main.css
  - controllers/
    - AppViewController.js          Top-level shell: tab switching, pop-out coordination,
                                    card routing between MTG Wizard and Card Lookup
    - ChatViewController.js         Chat UI and markdown rendering; takes onCardsFound callback
    - LookupViewController.js       Wraps CardPanelController; handles search bar and
                                    relayed cards from chat
    - CardPanelController.js        Card tab bar + 3-section display (image, info, meta)
    - DeckBuilderViewController.js  Placeholder (Workshop tab - pending rename)
  - ipc/
    - IpcHandlerRegistry.js         Registers send-message, get-catalog-status, lookup-cards,
                                    get-llm-info; receives llmService and orchestrator via DI
    - WindowManager.js              Creates/tracks pop-out windows; pushes card state on load
  - services/
    - ClaudeService.js              Anthropic API communication; primary LLM provider
    - OllamaService.js              Ollama/LLM communication; fallback provider (qwen2.5:14b)
    - LLMProviderFactory.js         Selects LLM provider at startup: Claude if
                                    ANTHROPIC_API_KEY is set, Ollama otherwise
    - LogService.js                 Singleton logger; color-coded console output + logs/app.log
                                    (file wiped on each session start)
    - CatalogService.js             Loads all ~26k Scryfall card names at startup; provides
                                    findInMessage() for exact catalog-based name matching
    - KnowledgeBaseService.js       Loads topic files from resources/knowledge/ at startup;
                                    getRelevantContext(intent) returns matched KB sections
    - MessageIntentService.js       Stateless message analysis; returns intent object with
                                    KB injection flags and Scryfall routing flags
    - mcp/
      - MCPOrchestrator.js          Intent detection, fans out to providers, returns
                                    {context, cards}; also exposes lookupCards() for direct
                                    name-based fetch
      - providers/
        - BaseProvider.js           Interface all providers implement
        - ScryfallProvider.js       Card data, oracle text, rulings, legality, pricing,
                                    images; fetchCards() for direct lookup, getContext()
                                    for LLM-enriched lookup
```

## IPC Surface (preload.js)

| Method | Direction | Purpose |
|---|---|---|
| `sendMessage(message, history)` | renderer → main | Send chat message; returns `{ response, cards, contextUsed: boolean }` |
| `getCatalogStatus()` | renderer → main | Check Scryfall catalog load state |
| `popoutTab(tabName)` | renderer → main | Open a tab in its own window |
| `getViewAssignment()` | renderer → main | Pop-out window asks which tab it owns |
| `relayCardsToLookup(payload)` | renderer → main | Send cards from assistant/main to lookup pop-out |
| `lookupCards(query)` | renderer → main | Manual search; returns `CardData[]` |
| `getLlmInfo()` | renderer → main | Returns `{ displayName }` of active LLM provider |
| `onTabReturned(cb)` | main → renderer | Event: pop-out window was closed |
| `onCardsFromChat(cb)` | main → renderer | Event: cards relayed to lookup window |
| `onSendCurrentCards(cb)` | main → renderer | Event: pop-out asking main to relay card state |

## Key Technical Notes

- `"type": "commonjs"` in package.json - main-process files use require/module.exports,
  renderer files use ES module import/export (handled by webpack with `type: 'javascript/auto'`).
- `dist/` is gitignored - always regenerated by webpack on npm start.
- Scryfall catalog uses exact name lookup (`/cards/named?exact=`) since we know the true
  card name before fetching. Previously used fuzzy search.
- Double-faced cards don't have top-level image_uris - falls back to
  card_faces[0].image_uris.normal. Handled in ScryfallProvider._buildCardData.
- Pop-out windows load the same index.html. AppViewController calls getViewAssignment()
  IPC at init; WindowManager identifies the window by webContents.id and returns its
  tab name. Main window returns null (full mode).
- Pop-out state transfer: WindowManager listens for did-finish-load on the pop-out window,
  then sends 'send-current-cards' to the main window. AppViewController relays
  { cards, activeCardId } to the pop-out via relay-cards-to-lookup IPC.
- Card ordering: first card in the array is always auto-selected when the panel is empty.
  Subsequent card additions don't change selection. Pop-out overrides selection to
  match activeCardId after state restore.
- VS Code shows "File is a CommonJS module; it may be converted to an ES module" hint
  on main-process .js files. This is a hint only, not an error - safe to ignore.
- Webpack target is `web` (not `electron-renderer`) because nodeIntegration is false
  in the renderer BrowserWindow. electron-renderer target assumes Node access and fails.
- Services use manual constructor injection (no framework). `main.js` is the composition
  root - the only place that instantiates services and wires dependencies. `LogService` is
  the accepted exception: a module-level singleton imported directly, which is standard
  practice for cross-cutting loggers.
- LLM provider is selected at startup by `LLMProviderFactory`: Claude API if
  `ANTHROPIC_API_KEY` is set in the environment, Ollama otherwise. Switching providers
  requires a restart (Phase 4 Settings will handle live switching).

## Decisions Still Open

- Chat markdown uses innerHTML without sanitization. Acceptable for a single-user
  desktop app with local LLM, but flag if the app ever handles untrusted content.
- "Write to Lookup" toggle state not persisted between sessions - tracked as a
  settings feature in REQ-006 / Phase 4.
- TCGPlayer pricing comes from Scryfall's embedded data (updated periodically).
  A direct TCGPlayer API key would give real-time pricing but adds API key management.

## Implementation Concerns

Foresights and potential complications to keep in mind before reaching the
relevant phase. Remove an entry once it has been resolved or designed around.

- **Phase 3a - Dual CardPanelController in Workshop:** The split-pane
  layout requires two independent card panels running simultaneously (one for
  user-side cards, one for AI-side cards). CardPanelController is already
  self-contained so instantiating two should be clean, but both panels will
  need distinct DOM element IDs and the Workshop view will need to manage
  them without letting them bleed into each other.

- **REQ-008 - Anthropic API key vs. Claude.ai Pro:** These are separate
  products. A Claude.ai Pro subscription does not grant API access. Users
  obtain an API key from console.anthropic.com billed by token. The Settings
  UI must make this clear with a brief explainer to avoid user confusion.

- **REQ-011 - WotC Comprehensive Rules parsing:** The rules document is
  ~280,000 words with its own internal section numbering and formatting. Parsing
  it into clean topic files is non-trivial. The document format could change
  between WotC releases. Do not underestimate this work - budget time for
  a robust parser and test against multiple versions of the document.

- **REQ-011 - sources/ populated on first run:** A fresh clone has no
  sources/ directory content (gitignored). The app must handle the case where
  source documents haven't been fetched yet - either run ContentManagerService
  automatically on first launch, or ensure the seeded topics/ files are used
  as fallback until the first refresh completes.
