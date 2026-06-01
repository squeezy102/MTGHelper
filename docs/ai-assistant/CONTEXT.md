# MTG Helper - AI Session Context

Running notes for AI assistant continuity across sessions.

## Repository State

- **Branch:** `dev` (all active development; merge to `master` at stable milestones only)
- **Last commit:** `7ed1952` - "Add Gemini as free cloud fallback; define three-tier LLM provider hierarchy"
- **Uncommitted changes:** None

## Tab Naming - Docs vs. Code

The product names defined in REQ-003 and used throughout all docs are:
- **MTG Wizard** (tab 1), **Card Lookup** (tab 2), **Workshop** (tab 3)

The current HTML (`src/index.html`) and all JS code use different names:
- "Assistant" / `assistant`, "Lookup" / `lookup`, "Deck Builder" / `deckbuilder`

The HTML labels and internal IDs need to be updated to match the product spec. This is a
pending code change - renaming the tab labels is cosmetic; renaming the internal IDs
(`data-tab`, `panel-*`, JS references) touches every controller. Do both together.

## Current App State

Phases 1, 2, and 2b (partial) are complete. No code work was done this session -
it was entirely design and documentation. The next session begins implementation.

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
  Implemented in `ChatViewController._buildSourceHeader(contextUsed)`.
- **Active LLM label** in the MTG Wizard toolbar (top-right, italic) populated at init via
  `getLlmInfo()` IPC.

### Phase 2 features (committed, stable)
- **Manual card search** in Card Lookup tab: search bar with Enter key support, loading state,
  status messages. Clears input on submit, shows "No cards found." or error as appropriate.
- **`MCPOrchestrator.lookupCards(query)`** - direct name-based fetch bypassing intent
  detection and LLM context building; used by the Lookup search bar
- **`ScryfallProvider.fetchCards(names)`** - direct card fetch by known name list
- **IPC: `lookup-cards`** handler in IpcHandlerRegistry; exposed as `window.mtgHelper.lookupCards(query)`
- **MTG Arena logo** displayed inline in Availability and Legality meta blocks
- **Meta block borders** - subtle border, border-radius, and padding on each `.meta-block`
- **Lookup auto-focus** - switching to Card Lookup tab automatically focuses the search input
- **Mana symbol rendering (REQ-007)** - `SymbolService` fetches all card symbols from Scryfall
  at startup and caches them as data URIs; `CardPanelController._renderSymbols()` replaces
  `{X}` notation with inline `<img>` tags in mana cost and oracle text fields.

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

### Not yet built (confirmed this session)
- **Diagnostics bar (REQ-013)** - StatusService, IPC channel, StatusBarController, eye icon
  toggle. Previously listed as complete in CONTEXT.md - this was incorrect. Not built.
- **CSS custom properties (REQ-021)** - main.css uses entirely hardcoded hex values, pixel
  sizes, and font names. No `var()` usage anywhere.
- **Token logging (REQ-020)** - ClaudeService captures elapsed time and character count only.
  `response.usage` (input_tokens, completion_tokens) is available from the Anthropic SDK
  but currently discarded.
- **UserDataService / UserPreferencesService (REQ-018)** - no SQLite, no JSON preferences.
- **LocalDataService / Scryfall bulk data (REQ-016)** - still using live Scryfall calls.
- **GeminiService** - Gemini provider defined in requirements but not yet implemented.
  `LLMProviderFactory` still selects Claude vs. Ollama only.

## Implementation Sprint - Build Order

Agreed build order. None of the items below are started yet.

1. **CSS variable refactor** - convert all hardcoded values in `main.css` to CSS custom
   properties. Single file change, Ctrl+R to verify. Unblocks all future UI work.

2. **UserDataService + UserPreferencesService** - SQLite via `better-sqlite3`, JSON prefs file.
   Create tables: `decks`, `deck_cards`, `favorites`, `collection`, `llm_usage`.
   Unblocks token logging, deck saving, and favorites.

3. **Token logging** - read `response.usage.input_tokens` and `response.usage.output_tokens`
   in `ClaudeService.js` after every API call; write a row to `llm_usage` via UserDataService.
   Start collecting baseline data immediately.

4. **LocalDataService + Scryfall bulk data** - download `oracle-cards` snapshot to
   `resources/data/scryfall-bulk/`; refactor `ScryfallProvider` and `CatalogService` to
   read from local data first. Bundle mana symbol SVGs into `resources/data/symbols/`
   and remove the `SymbolService` startup network call.

5. **Diagnostics bar** - `StatusService` (main process event emitter), `status-update` IPC
   push channel, `StatusBarController` (renderer), eye icon toggle, idle timer.

6. **Workshop (Phase 3)** - two-panel layout, deck contract, SUGGESTIONS block parsing,
   inline pill rendering, wildcard budget, deck save/load. Multi-session effort.

## Active Work / Known Issues

- **Tab naming mismatch** - HTML uses "Assistant"/"Deck Builder" and internal IDs
  `assistant`/`deckbuilder`; product spec and all docs use "MTG Wizard"/"Workshop".
  Labels are cosmetic; renaming internal IDs touches every controller and should be
  done together as a single change. See "Tab Naming" section above.
- Slang card names ("bolt", "goyf") won't match the catalog - requires exact or near-exact
  name. Acceptable for now.
- "Write to Lookup" toggle not persisted between sessions (Phase 4).
- Workshop tab is a placeholder (Phase 3).
- **Card panel layout redesign pending** - current three-section vertical stack wastes
  horizontal space. Intended redesign: top half splits left (card text) / right (card image),
  bottom half keeps meta unchanged. Documented in REQ-004. Implement before or during Phase 3.
- **Sticky context on follow-up messages** - MCPOrchestrator injects no KB context when a
  follow-up message has no MTG vocabulary. Fix: cache last injected context and re-use on
  turns that generate no new context. Documented in REQ-019.
- `MAX_CARDS = 10` in CardPanelController is intentional for Card Lookup. Workshop will need
  its own separate list logic - do not reuse CardPanelController there.

## LLM Provider State

- `LLMProviderFactory` currently selects: Claude if `ANTHROPIC_API_KEY` is set, Ollama otherwise.
- Gemini tier added to requirements (REQ-008) and decisions but `GeminiService` not yet built.
- When building GeminiService, refactor `LLMProviderFactory` to read `LLM_PROVIDER` env var
  and select from all three: `claude`, `gemini`, `ollama`.
- `BaseLLMProvider` abstraction layer needs to be formalized (currently implicit via shared
  `sendMessage` interface on ClaudeService and OllamaService).

## File Structure

```
MTGHelper/
- README.md                         Public-facing onboarding doc
- main.js                           Composition root: creates and wires all services
- preload.js                        contextBridge IPC surface for renderer
- webpack.config.js                 Bundles src/renderer.js -> dist/renderer.bundle.js
- package.json
- resources/images/
  - MTG_Arena_Logo.png              MTGA logo used inline in card meta labels
- resources/knowledge/
  - manifest.json                   Topic index: IDs, keywords, injection flags, source type
  - topics/                         MD files injected into LLM context (5 seeded)
- resources/data/                   TO BE CREATED - local data layer (REQ-016)
  - scryfall-bulk/                  oracle-cards.json snapshot (gitignored)
  - symbols/                        Bundled SVGs (committed)
- docs/ai-assistant/                This directory
- src/
  - index.html                      App shell: nav bar + 3 tab panels
  - renderer.js                     Webpack entry - boots AppViewController
  - styles/main.css                 All hardcoded values - needs CSS variable refactor
  - controllers/
    - AppViewController.js          Top-level shell: tab switching, pop-out coordination,
                                    card routing between MTG Wizard and Card Lookup
    - ChatViewController.js         Chat UI and markdown rendering; takes onCardsFound callback
    - LookupViewController.js       Wraps CardPanelController; handles search bar and
                                    relayed cards from chat
    - CardPanelController.js        Card tab bar + 3-section display (image, info, meta)
    - DeckBuilderViewController.js  Placeholder (Workshop tab - pending rename to WorkshopViewController)
  - ipc/
    - IpcHandlerRegistry.js         Registers IPC handlers; receives services via DI
    - WindowManager.js              Creates/tracks pop-out windows; pushes card state on load
  - services/
    - ClaudeService.js              Anthropic API; primary LLM provider
    - OllamaService.js              Ollama fallback provider (offline/local only)
    - LLMProviderFactory.js         Selects LLM at startup (needs Gemini + LLM_PROVIDER refactor)
    - LogService.js                 Singleton logger; console + logs/app.log
    - CatalogService.js             ~26k card names at startup; findInMessage() matching
    - SymbolService.js              Fetches MTG symbols from Scryfall at startup (to be replaced
                                    by bundled SVGs in resources/data/symbols/)
    - KnowledgeBaseService.js       Loads KB topics; getRelevantContext(intent)
    - MessageIntentService.js       Stateless message analysis; returns intent object
    - mcp/
      - MCPOrchestrator.js          Intent detection, context assembly, provider fan-out
      - providers/
        - BaseProvider.js           Interface all data providers implement
        - ScryfallProvider.js       Card data, oracle text, rulings, legality, pricing, images
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
| `getSymbolMap()` | renderer → main | Returns symbol code → data URI map for mana symbol rendering |
| `onTabReturned(cb)` | main → renderer | Event: pop-out window was closed |
| `onCardsFromChat(cb)` | main → renderer | Event: cards relayed to lookup window |
| `onSendCurrentCards(cb)` | main → renderer | Event: pop-out asking main to relay card state |

## Key Technical Notes

- `"type": "commonjs"` in package.json - main-process files use require/module.exports,
  renderer files use ES module import/export (Webpack handles with `type: 'javascript/auto'`).
- `dist/` is gitignored - always regenerated by webpack on npm start.
- Scryfall catalog uses exact name lookup (`/cards/named?exact=`). Previously used fuzzy.
- Double-faced cards fall back to `card_faces[0].image_uris.normal` - handled in ScryfallProvider.
- Pop-out windows load the same index.html; AppViewController calls getViewAssignment() at init.
- Services use manual constructor injection. `main.js` is the composition root. `LogService`
  is the accepted module-level singleton exception.
- Webpack target is `web` (not `electron-renderer`) because nodeIntegration is false.
- VS Code "File is a CommonJS module" hint on main-process files is safe to ignore.

## Decisions Still Open

- Chat markdown uses innerHTML without sanitization. Acceptable for single-user desktop app,
  but flag if the app ever handles untrusted content.
- "Write to Lookup" toggle state not persisted between sessions (Phase 4).
- TCGPlayer pricing comes from Scryfall's embedded data. Direct TCGPlayer API would give
  real-time pricing but adds API key management complexity.
- History summarization approach (client-side vs. secondary Claude call) - decide after
  baseline token data is available.
- Exact sliding window size for conversation history - start at 6-10 turns, tune from data.

## Implementation Concerns

- **Workshop: do not reuse CardPanelController** - Workshop card areas are compact scrollable
  lists, not full card detail panels. WorkshopViewController owns its own list components.
- **Workshop: SUGGESTIONS block parsing** - MCPOrchestrator must reliably split prose from
  the SUGGESTIONS block before routing. Test edge cases where Claude omits or malforms it.
- **Workshop: system prompt token pressure** - the Workshop prompt carries contract, deck
  state, format rules, and behavioral guidelines. It will be the heaviest prompt in the app.
  Monitor context window usage carefully.
- **Workshop: format rule accuracy is non-negotiable** - incorrect ban list, commander rules,
  or deck size has real consequences. KB format topics must be comprehensive before Workshop ships.
- **REQ-011 - WotC Comprehensive Rules parsing** - ~280,000 words with internal section
  numbering. Parsing is non-trivial; document format may change between releases.
- **REQ-011 - sources/ on fresh clone** - gitignored, so empty on first clone. App must
  handle missing sources gracefully and use seeded topics/ as fallback.
- **LocalDataService - bulk data first run** - fresh clone has no oracle-cards.json.
  App must trigger a background download on first launch and use live Scryfall as fallback
  until local data is populated.
- **GeminiService - structured output** - Gemini's response format differs from Anthropic's.
  The Workshop SUGGESTIONS block parsing must be tested against Gemini output specifically.
