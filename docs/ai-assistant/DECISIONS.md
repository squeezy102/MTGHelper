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
| Ollama (fallback LLM) | Free, no API costs, privacy - runs entirely on local hardware. Active when ANTHROPIC_API_KEY is not set. |
| qwen2.5:14b | Default Ollama model. Better instruction following than Llama 3.1 8B but still unreliable on complex rule interactions - ceiling of what free local models can deliver at 12GB VRAM. |
| claude-haiku-4-5-20251001 | Default Claude model. Fast, cheap, accurate - far better rules reasoning than any local model tested. |
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
| Write to Lookup feeds user-mentioned cards only | The "Write to Lookup" toggle in MTG Wizard carries cards the user mentioned - not the LLM's output. The LLM's card suggestions are the Workshop's domain. |
| REQ-009 scoped to Workshop only | LLM response card matching is only meaningful where both sides of the conversation have dedicated card areas. The Workshop split-pane provides that; MTG Wizard and Card Lookup do not. |
| Workshop AI has its own working deck area | The Workshop is designed as a side-by-side collaboration, not a chat window with a card panel. The AI maintains its own proposed deck that the user can inspect, approve from, or copy wholesale - like sitting across from a deckbuilder who is also building in real time. |
