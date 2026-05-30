# MTG Helper - Architecture Decision Log

## Core Product Philosophy

**Why this app exists** - Built out of direct frustration with LLMs confidently
stating incorrect MTG rules, misidentifying cards, and failing to retain
corrections across sessions. The goal is an AI companion that is grounded,
honest, and verifiably correct - not one that sounds plausible but makes things
up. Every architectural decision flows from this.

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
| Ollama (local LLM) | Free, no API costs, privacy - runs entirely on local hardware |
| Llama 3.1 8B | Strong reasoning ability, fits comfortably in a 4070's 12GB VRAM |
| Webpack | ES module bundling for renderer process - industry standard, enables future React adoption |
| marked.js | Markdown rendering for chat messages - lightweight, no dependencies |
| Scryfall API | Primary MTG data source - covers cards, legality, rulings, sets, pricing, images, MTGA availability |
| Scryfall catalog bulk download | ~26k card names fetched at startup for exact local matching. Eliminates heuristic extraction, handles all card names including short ones like "Opt" |

## Security

| Decision | Why |
|---|---|
| contextIsolation: true | Electron security best practice - renderer cannot access Node.js directly |
| nodeIntegration: false | Prevents renderer from requiring Node modules, reduces attack surface |
| preload.js bridge | Safe, explicit API surface between main and renderer processes |
| sandbox: false | Required for preload.js to function with contextIsolation on |

## Architecture

| Decision | Why |
|---|---|
| IpcHandlerRegistry | Keeps IPC concerns out of main.js, single responsibility principle |
| WindowManager | Keeps pop-out window concerns out of main.js and IpcHandlerRegistry - owns window lifecycle and state relay |
| Separate services/ controllers/ ipc/ directories | Separation of concerns, scalability, testability |
| OllamaService | Encapsulates all AI communication - easy to swap providers later (e.g. Claude API) |
| AppViewController | Top-level shell coordinator - owns tab switching, pop-out coordination, and card routing between views. Other controllers don't know about each other |
| ChatViewController | Takes an onCardsFound callback rather than a direct controller reference - decouples it from the Lookup view entirely |
| LookupViewController | Thin wrapper around CardPanelController that adds feed-from-chat routing |
| CardPanelController | Owns all card display: tab bar, 3-section rendering, card queue, selection state |
| DeckBuilderViewController | Placeholder - full implementation in Phase 3 |
| MCPOrchestrator + Provider pattern | New data sources added by extending BaseProvider - orchestrator routes and assembles, no changes to the rest of the stack |
| Custom middleware over Anthropic MCP | Anthropic MCP requires reliable tool calling. llama3.1 8B has inconsistent tool-call behavior. Custom middleware fetches context proactively - more predictable and reliable |
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
       -> if feedEnabled + lookup docked: LookupViewController.receiveCards()
       -> if feedEnabled + lookup popped out: relayCardsToLookup IPC
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
