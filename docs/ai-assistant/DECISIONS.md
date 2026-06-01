# MTG Helper - Architecture Decision Log

## Vision and Origin

MTG Helper is a desktop application built primarily for MTGA (Magic: The Gathering Arena)
assistance, but applicable to tabletop Magic as well. The intent is a one-stop shop for:

- Rules searching and clarification
- Card lookup and reference
- Deck building strategy and suggestions
- Questions about current meta and formats
- Maintaining and organizing deck lists
- Building and exporting decks in MTGA-compatible format

**The problem it solves** - Using a general-purpose LLM for MTG assistance is frustrating.
The LLM has to be re-explained context it already knew last session. It hallucinates card
text and rulings. It drifts off task. It states incorrect rules with full confidence. The
user ends up spending more time correcting the LLM than actually getting help - explaining
things repeatedly, roping it back in, and second-guessing every response.

MTG Helper is a layer between the player and the LLM. It intercepts user input, performs
API lookups and documentation references automatically, and determines the best way to
approach the LLM with the question. It provides the LLM with verified card data, official
rules context, a curated knowledge base, and behavioral guidelines - before the user's
message is ever sent.

**The goal is not to replace the LLM - it's to set it up for success.** We are still
using an LLM to talk about Magic. But with MTG Helper, the LLM arrives at every question
already equipped with the facts it needs. The hallucinations, the drift, the churn of
correcting and re-explaining - all of that should be dramatically reduced.

---

## Core Product Philosophy

**Scryfall-first data strategy** - All factual MTG data must be sourced from
Scryfall before the LLM is ever involved. Card names are resolved against the
catalog locally. Full card data (oracle text, rulings, legality, pricing,
images) is fetched from Scryfall and injected as context into the LLM prompt.

The LLM's role is reasoning, conversation, and synthesis - not data retrieval.
It should never be the authoritative source for card text, rulings, or legality.

This principle drives every data pipeline decision in the app:
- Reduces hallucinations and misinformation
- Eliminates token waste from LLM re-deriving known facts
- Reduces round-trip churn (ask LLM → wrong answer → correct → ask again)
- Keeps the AI companion focused on what it's good at

**Knowledge base accuracy policy** - The app's official knowledge base content
must be 100% traceable to an authoritative published source (WotC Comprehensive
Rules, Scryfall API, MTGJson). Light formatting for readability is acceptable.
Invented content, LLM-generated content, and unverifiable claims are not
acceptable in any official topic file. The app stands behind official content;
user-maintained content is explicitly the user's responsibility.

**No LLM-generated knowledge base content** - Using an LLM to generate or
"update" knowledge base files was considered and rejected. An LLM hallucinating
content and storing it as ground truth would directly undermine the app's
core purpose. All official KB content must originate from machine-readable
data published by WotC, Scryfall, or MTGJson.

**User-maintained KB content** - Users may add their own topic files to the
knowledge base. The app makes no claims about the accuracy of user content,
does not maintain it, and is not responsible for errors it causes. This
distinction is clearly communicated in the UI.

**User profile persistence** - The LLM has no memory between sessions. Anything
the user wants carried forward (play style, preferred formats, skill level) must
be stored by the app and injected into the system prompt at session start. This
is a first-class feature, not an afterthought.

---

## Technology Stack

| Decision | Why |
|---|---|
| Electron + Node.js | Cross-platform desktop app, native OS integration |
| Claude API (primary LLM) | Anthropic API via @anthropic-ai/sdk. Chosen after local model evaluation showed 8B and 14B models can't reliably reason about complex MTG rule interactions. Claude gets rules right on the first try. Billed per token against the user's Anthropic account. |
| Gemini (free cloud fallback LLM) | Google AI Studio free tier - real API key, no credit card required. Meaningfully better than open-weight local models. Recommended for contributors who don't want to pay for API access. |
| Ollama (offline-only fallback LLM) | Retained only for users who require fully local, offline operation. Quality is significantly degraded vs. Claude or Gemini - open-weight models on consumer hardware fail at complex MTG reasoning tasks. Never recommended as a default. |
| qwen2.5:14b | Default Ollama model. Better instruction following than Llama 3.1 8B but still unreliable on complex rule interactions - ceiling of what free local models can deliver at 12GB VRAM. |
| claude-haiku-4-5-20251001 | Default Claude model. Fast, cheap, accurate - far better rules reasoning than any local model tested. |
| Webpack | ES module bundling for renderer process - industry standard, enables future React adoption |
| marked.js | Markdown rendering for chat messages - lightweight, no dependencies |
| Scryfall API | Primary MTG data source - covers cards, legality, rulings, sets, pricing, images, MTGA availability |
| Scryfall bulk data (oracle-cards snapshot) | Daily snapshot replaces per-card live calls and the startup catalog fetch. Eliminates most runtime Scryfall traffic; app starts immediately from local data. See REQ-016. |
| better-sqlite3 | SQLite for structured user data (decks, collection, favorites, usage log). Synchronous API fits the existing IPC architecture; no server, no network, single `.db` file on disk. See REQ-018. |

## Security

| Decision | Why |
|---|---|
| contextIsolation: true | Electron security best practice - renderer cannot access Node.js directly |
| nodeIntegration: false | Prevents renderer from requiring Node modules, reduces attack surface |
| preload.js bridge | Safe, explicit API surface between main and renderer processes |
| sandbox: false | Required for preload.js to function with contextIsolation on |
| API keys in OS env vars only - never stored by the app | Storing API keys in a config file or database creates a local secret that can be read, copied, or leaked. Environment variables are the standard secure pattern for credentials on a developer's machine. No settings panel, no config file, no database field - ever. |

## Architecture

| Decision | Why |
|---|---|
| IpcHandlerRegistry | Keeps IPC concerns out of main.js, single responsibility principle |
| WindowManager | Keeps pop-out window concerns out of main.js and IpcHandlerRegistry - owns window lifecycle and state relay |
| Separate services/ controllers/ ipc/ directories | Separation of concerns, scalability, testability |
| ClaudeService + OllamaService + LLMProviderFactory | Each LLM is its own service with the same sendMessage interface. LLMProviderFactory selects the active provider at startup based on ANTHROPIC_API_KEY. Adding a new provider requires only a new service class - no changes to IPC or orchestration. |
| Manual constructor injection (no DI framework) | Services declare dependencies as constructor arguments. main.js is the composition root - the only place that instantiates and wires all services. InversifyJS and similar frameworks were considered and rejected: for 10-15 services the manual wiring is simpler and more readable than framework boilerplate. |
| LogService as module singleton | The one accepted exception to constructor injection. Loggers are a cross-cutting concern; injecting them into every class adds noise without benefit. Module-level singleton is the standard pattern for loggers in Node.js. |
| AppViewController | Top-level shell coordinator - owns tab switching, pop-out coordination, and card routing between views. Other controllers don't know about each other |
| ChatViewController | Takes an onCardsFound callback rather than a direct controller reference - decouples it from the Lookup view entirely |
| LookupViewController | Thin wrapper around CardPanelController that adds feed-from-chat routing |
| CardPanelController | Owns all card display: tab bar, 3-section rendering, card queue, selection state |
| DeckBuilderViewController | Placeholder - full implementation in Phase 3 |
| MCPOrchestrator + Provider pattern | New data sources added by extending BaseProvider - orchestrator routes and assembles, no changes to the rest of the stack |
| Custom middleware over Anthropic MCP | Anthropic MCP requires reliable tool calling. Local models have inconsistent tool-call behavior regardless of size. Custom middleware fetches context proactively - more predictable and reliable for all providers |
| Webpack target: web | Renderer has nodeIntegration: false so it runs in a pure browser context. electron-renderer target assumes Node access and fails |
| dist/ excluded from git | Webpack output is a build artifact - always regenerated by npm start |
| Pop-out via same index.html + getViewAssignment IPC | Each pop-out window loads the same HTML; AppViewController asks the main process at init which view it's assigned. More reliable than URL hash/query params in Electron's file:// protocol |
| Pop-out state push via did-finish-load | WindowManager pushes current card state to pop-out after did-finish-load rather than having the pop-out request it. Avoids race conditions from the request-response pattern |
| Longest-match deduplication in CatalogService | When "Meathook Massacre" and "Meathook Massacre II" both match in a message, only the more specific name is kept. Prevents duplicate cards for the same keyword |
| USD-only pricing | App is intended for personal/friends use only - no distribution. EUR and other currencies removed to reduce UI noise |

## Data Flow

```
User message
  -> ChatViewController (renderer)
  -> IPC bridge (preload.js)
  -> IpcHandlerRegistry (main process)
  -> MCPOrchestrator.getResult()
       -> CatalogService.findInMessage() - exact catalog matching
       -> ScryfallProvider: fetch card data, build CardData objects
       -> returns { context: string, cards: CardData[] }
  -> OllamaService.sendMessage(message, history, context)
       -> Ollama: system prompt + Scryfall context + history
       -> returns LLM response string
  -> IPC returns { response, cards } to renderer
  -> ChatViewController: render markdown response, calls onCardsFound(cards)
  -> AppViewController._onCardsFound()
       -> if feedEnabled + Card Lookup docked: LookupViewController.receiveCards()
       -> if feedEnabled + Card Lookup popped out: relayCardsToLookup IPC
  -> CardPanelController.addCards(): update tab bar + 3-section display
```

## Pop-out State Transfer Flow

```
User clicks pop-out button on Lookup tab
  -> AppViewController._popoutTab('lookup')
  -> IPC: popout-tab
  -> WindowManager._openPopout('lookup')
       -> new BrowserWindow loads index.html
       -> did-finish-load fires
       -> WindowManager sends 'send-current-cards' to main window renderer
  -> AppViewController._listenForCurrentCardsRequest() fires
       -> reads lookupView.cardPanel.cards + activeCardId
       -> IPC: relay-cards-to-lookup { cards, activeCardId }
  -> WindowManager sends 'cards-from-chat' to pop-out window
  -> LookupViewController.listenForRelayedCards() callback fires
       -> addCards(cards) - populates panel, selects first card
       -> selectCard(activeCardId) - overrides to match main window selection
```

## Branching Strategy

- master - stable milestones only
- dev - active development branch
- Feature branches as needed

---

## Product / UX

| Decision | Why |
|---|---|
| Tab naming: MTG Wizard, Card Lookup, Workshop | Names reflect intent, not implementation. MTG Wizard signals a conversational companion you ask things. Card Lookup is self-descriptive - it's a lookup tool, nothing more. Workshop evokes a workspace where you and an AI collaborator build side by side. |
| Card Lookup scope: no LLM card output | Card Lookup is a reference tool only. LLM response card surfacing belongs in the Workshop where the LLM is an active participant. Feeding AI output into Card Lookup would blur its purpose. |
| Card Lookup 10-card cap kept intentionally | Card Lookup is a quick reference tool, not a bulk card browser. Users looking at 50+ cards are using the wrong tab - that belongs in the Workshop. FIFO rotation keeps the panel focused. |
| Write to Lookup feeds user-mentioned cards only | The "Write to Lookup" toggle in MTG Wizard carries cards the user mentioned - not the LLM's output. The LLM's card suggestions are the Workshop's domain. |
| REQ-009 scoped to Workshop only | LLM response card matching is only meaningful where both sides of the conversation have dedicated card areas. The Workshop split-pane provides that; MTG Wizard and Card Lookup do not. |
| Diagnostics bar: single-line status bar, not toasts or inline status | A persistent bottom bar is always visible without interrupting the UI. Toast notifications disappear before the user can read them on fast events; inline status in the chat or card panel would couple unrelated concerns. |
| Diagnostics bar: toggle lives inside the bar, bar collapses when off | Putting the toggle in the nav bar clutters the nav and wastes space. Collapsing the bar to a thin strip with just the toggle icon keeps it always reachable without adding UI elements elsewhere. |
| Diagnostics bar: eye icon, not bug/debug icon | "Diagnostics" is a visibility feature, not a developer debugging tool. An eye icon communicates "watching what's happening" which matches user intent. A bug icon implies developer tooling. |
| Diagnostics bar: no history panel in UI | LogService already writes every event to logs/app.log. A duplicate scrollable log in the UI adds complexity with no new information. Users who want history can open the log file. |
| Diagnostics bar: on by default, toggleable | The feature's value is highest for users who don't know whether the app is working. Defaulting to on means new users are never left in the dark. Users who find it distracting can turn it off. |
| Workshop: compact card list rows, not full card detail panels | The deck list panel uses compact rows, not full card detail panels. Full panels (image + info + meta) would overwhelm the layout. Compact rows with a hover tooltip (REQ-014) give the user card reference without consuming space. |
| Workshop: JSON state contract over Anthropic tool use API | Tool use is Claude-API-only and would break Ollama support. A JSON schema injected into the system prompt works with any LLM that follows output format instructions. Consistent with the existing KB context injection pattern. |
| Workshop: LLM self-declares its cards via JSON, not CatalogService text scan | Running findInMessage() on LLM response text is fragile - the LLM may describe cards in ways the catalog won't match. The JSON contract is more reliable: the LLM explicitly names the cards it intends to reference. |
| Workshop: user explicitly promotes cards from In Discussion to My Deck | Cards mentioned in conversation are not automatically added to the deck. The user controls what goes in. Automatic promotion would produce decks full of cards the user was only asking about. |
| Workshop: format selected by user at session start, not in JSON | Format is stable for a session and does not need to be re-declared by the LLM on every turn. Injecting it once in the system prompt keeps the JSON payload clean. |
| Workshop: collection manager moved to a dedicated 4th tab (REQ-015) | Collection management is an inventory concern, not a deckbuilding concern. Mixing them bloats the Workshop and limits how far collection features can grow. A separate tab keeps both focused. |
| Workshop redesigned: two-panel layout replaces three-area layout | The original design (left player area / center chat / right LLM area) was revisited. A dedicated LLM card area alongside a dedicated user card area made the Workshop feel like two competing deck builders rather than a collaboration. The new design: conversation on the left, the user's deck list on the right. Claude participates through structured output (the SUGGESTIONS block), not through a mirrored card area. |
| Workshop: no card staging area | A dedicated "In Discussion" staging area was designed and then rejected. Hover provides card inspection; double-click provides full detail. Adding a staging panel would add UI complexity without adding user value - cards either go into the deck or they don't. |
| Workshop: inline pill suggestions over a card panel | Claude's suggested cards appear as inline pills in the conversation prose with a single-click add button. This keeps the conversation readable and the action immediate. A separate card panel would require the user to switch attention between two areas. |
| Workshop: deck contract always visible and always editable | The contract (format, strategy, win condition, budget) lives in the toolbar. The user can change it at any time. Claude re-evaluates against the current contract on every turn - not just at session start. A locked or hidden contract would force the user to restart sessions unnecessarily. |
| Workshop: anti-sycophancy is a first-class design goal | Claude must evaluate every suggestion against the contract and push back on conflicts, not just agree. Sycophantic deck building (agreeing with everything the user says) produces bad decks. The user always has final say but must consciously override, not passively drift. |
| Workshop: wildcard budget as contract constraint, not a filter | Budget constraints live in the deck contract alongside format and strategy. Claude knows the budget when suggesting cards and surfaces lower-rarity alternatives proactively - not after the user has already decided they want a card. |
| Workshop: compact deck state notation in prompt | The deck list is sent to Claude as compact text (`DECK (42/60): 4x Death Baron...`), never as full Scryfall card objects. Oracle text, rulings, and images are UI state - Claude does not need them to reason about deck composition. |
| Card Lookup: printing browser is lazy | Fetching all printings on card load would be wasteful for most users who never browse alternate art. A count label ("14 printings available") surfaces the feature without the cost. The full fetch triggers only when the user explicitly asks for it. |
| CSS custom properties required from day one | A full visual overhaul is planned. Hardcoded color and spacing values scattered through CSS make a theme change a full rewrite. CSS custom properties mean the entire app appearance can change by editing token definitions in one place. |
| Dark theme as the correct default | Card art pops on dark backgrounds. MTG players commonly use tools late at night. Every serious MTG tool trends dark. Defaulting to light would work against the natural use case. |
| Card tooltip via shared CardTooltipController | Any view that shows card names benefits from hover image preview. Building it as shared infrastructure once avoids rebuilding it per-view. |
| Gemini replaces Ollama as the recommended free fallback | Ollama's open-weight models fail at the reasoning tasks this app requires - rules interpretation, coherent multi-turn deck building, structured output reliability. Gemini (Google AI Studio free tier) is a real frontier model with no credit card required. It is meaningfully better for this use case and is now the recommended free option for contributors. Ollama is retained only for offline/local use cases with explicit quality warnings. |
| Three-tier provider hierarchy | Claude (canonical, full experience) → Gemini (free cloud, good quality) → Ollama (offline only, degraded quality). The hierarchy is documented in REQ-008 and surfaced in the README and UI so users always know what they are choosing. |
| LLM provider selected via LLM_PROVIDER env var | Keeps the app agnostic to provider with no code changes required to switch. Consistent with the existing API key pattern (env vars only, never stored by the app). |
| BaseLLMProvider abstraction layer | Mirrors the existing BaseProvider pattern in src/services/mcp/providers/. Each LLM is its own service implementing the same interface. Adding a new provider requires only a new service class - no changes to IPC, orchestration, or the rest of the stack. |
| RAG pattern confirmed | The pipeline is: query verified data sources first, inject results into Claude's context as grounded fact, instruct Claude to answer from provided context only. Claude handles genuine gaps (edge case rules interpretation, strategy nuance, opinion). Claude is never the source of truth for card data. |
| Full MCP protocol ruled out | The existing src/services/mcp/ structure (MCPOrchestrator, BaseProvider, ScryfallProvider) is already MCP architecture - the pattern is correct and should be preserved. Full MCP protocol, where Claude drives tool calls directly, is explicitly ruled out. For an anti-hallucination use case, the app must control the context pipeline. Native MCP tool calling introduces unpredictability that works against the project's core goal. The orchestrator-driven approach is predictable, debuggable, and auditable. |
| LocalDataService in front of all card data access | ScryfallProvider must not call the Scryfall API directly. LocalDataService is the single point of access: checks local bulk data first, falls back to live Scryfall on cache miss. Centralizes cache logic and makes the fallback behavior testable and replaceable. |
| Mana symbols bundled at build time, not fetched at startup | MTG symbols never change between app versions. Fetching them from Scryfall at every startup is unnecessary network traffic with no benefit. Bundling into resources/data/symbols/ eliminates the call entirely. |
| SQLite over JSON for relational/high-volume user data | Decks (one deck has many cards), collection (thousands of cards), and usage logs (one row per API call) are relational or high-volume. JSON files are fine for flat key-value preferences but break down for these cases. SQLite enables real queries (filter by format, sort by modified, join decks to owned cards) without a server. |
| UserDataService + UserPreferencesService split | Two services, two storage backends, chosen to match data shape. UserDataService owns SQLite (structured, relational). UserPreferencesService owns JSON (flat, human-readable, small). Neither service knows about the other's storage mechanism. |
| Token usage logged to SQLite from day one | Raw per-call rows are logged before the usage panel is built. Pre-aggregating would limit what can be computed later. Raw data can be sliced any way; aggregations can always be computed on read. |
