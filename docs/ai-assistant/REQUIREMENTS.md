# MTG Helper - Requirements

---

## REQ-001: Card Panel - Contextual Card Display

When one or more cards are mentioned during a conversation, the right panel
displays detailed information for each identified card.

### Layout
The right panel is divided into three fixed sections stacked vertically:
1. **Image** (top) - card artwork
2. **Card Info** (middle) - all text printed on the physical card: name, mana cost,
   type line, oracle text, flavor text, power/toughness, artist, set
3. **Card Meta** (bottom) - external/contextual data: legality across formats,
   MTGA availability, pricing (USD only), and official rulings

A **tab bar** sits at the top of the right panel. Each tab represents one card
currently in the panel. Clicking a tab switches all three sections to show that
card's data. Each tab has an individual dismiss (x) button.

### Behavior
- When a new card is identified from the conversation, it is added to the tab bar
  and automatically selected (all three sections update to show it)
- All previously loaded cards remain accessible via their tabs
- Maximum of 10 cards held at once; when the cap is reached the oldest card is
  evicted (FIFO) to make room for the newest
- Cards persist across conversation turns until dismissed by the user
- Dismissing the active card auto-selects the next most recent card; if no cards
  remain, the panel returns to its empty placeholder state

> **Note:** This requirement will be superseded by REQ-003 and REQ-004 when the
> tabbed layout is implemented. The card display behavior carries forward; the
> layout and real estate change.

---

## REQ-002: Chat Message Formatting

Assistant responses must be rendered as formatted, human-readable text rather
than a raw string dump.

- Assistant responses are rendered as markdown (bold, italics, headings, bullet
  points, numbered lists, code blocks)
- Card names appear in bold
- User messages are displayed as plain text (right-aligned)
- Error messages are visually distinct
- The LLM is instructed via system prompt to use markdown formatting in all responses

---

## REQ-003: Tabbed Application Layout

The app is structured around three top-level tabs, each with a distinct purpose.

### Tab Purposes
1. **MTG Wizard** - conversational MTG companion; ask questions, discuss rules,
   explore strategy and meta; the experience is discussion-first with no card
   panel or deck management
2. **Card Lookup** - pure manual card reference; search and browse cards with
   full detail; no AI involvement in this tab
3. **Workshop** - split-pane collaborative workspace; card exploration and
   deck building with an AI partner; both sides are actionable simultaneously

### Tab Behavior
- Only one tab is active/visible at a time within a window
- Each tab has a pop-out button (↗) that opens it in its own independent window
- A popped-out tab is grayed out in the main window's nav bar
- When a pop-out window is closed, the tab returns to the main window
- Any tab can be popped out independently - the user could have all three in
  separate windows simultaneously
- Pop-out windows show only their assigned view with no nav bar

---

## REQ-004: Card Lookup Tab

A standalone card reference tool. No AI or conversational elements - the user
searches for cards directly and browses their data.

### Layout
- Card tabs at the top allow browsing multiple cards simultaneously
- Maximum of 10 cards at a time; when the cap is reached the oldest card is
  evicted (FIFO) to make room for the newest
- Card Lookup is a quick reference tool - deep card work and large card sets
  belong in the Workshop tab

### Card Display Layout (pending redesign)
The current three-section vertical stack (image → info → meta) wastes horizontal
space and creates alignment problems at full window width. The intended layout is:

- **Top half - split horizontally:**
  - Left side: all card text (name, mana cost, type line, oracle text, flavor
    text, power/toughness, artist, set)
  - Right side: card image - larger display area than the current top slot
- **Bottom half:** meta section unchanged (legality, pricing, rulings)

This gives the card image more vertical real estate, constrains the text area
to a natural reading width, and eliminates the horizontal space waste of
full-width text fields.

### Write to Lookup (Feed Toggle)
- A **"Write to Lookup"** toggle lives in the MTG Wizard tab toolbar
- Default: **off**
- When on, cards identified in the user's messages in MTG Wizard are
  automatically sent to the Card Lookup tab
- LLM response cards are never fed to Card Lookup - that functionality
  belongs in the Workshop tab
- When off, Card Lookup receives no cards from MTG Wizard
- Tooltip explains what the toggle does

### Card Deduplication and Disambiguation
- Card Lookup never displays two tabs for the same card
- When a message contains names of varying specificity (e.g. "Meathook Massacre"
  and "Meathook Massacre II"), only the longest match is kept - **longest match wins**
- A card already loaded is not added again if mentioned in a subsequent message

---

## REQ-005: Workshop Tab

A collaborative, three-area workspace for card exploration and deck building
with an AI partner. The experience is modeled after sitting across a table from
a master deckbuilder - both sides are visible and actionable simultaneously,
with the AI conversation in the center.

### Layout

Three resizable areas side by side:

- **Left - Player Area** - two sections stacked vertically:
  - *In Discussion* - cards the user has mentioned in conversation that have
    not yet been added to their deck (compact scrollable list)
  - *My Deck* - cards committed to the user's working deck (compact scrollable
    list with counts and +/- controls)
- **Center - Chat** - full conversation interface: message input, AI responses
  with markdown rendering, conversation history. Same chat experience as MTG
  Wizard but with a Workshop-specific system prompt (see Format and Rules below)
- **Right - LLM Area** - two sections stacked vertically:
  - *In Discussion* - cards the LLM is currently referencing in conversation
    (compact scrollable list)
  - *LLM's Deck* - cards committed to the LLM's working deck proposal (compact
    scrollable list with counts)
  - *Deck Intent* - a small text area displaying the LLM's current notes on
    the deck being built (theme, win condition, strategy summary)

Card rows in all four list areas are compact (name + count only). Hovering
over any card row displays a card image tooltip (REQ-014). No full card detail
panels are used in the Workshop - Card Lookup serves that need.

### Workshop State - JSON Contract

The Workshop maintains a shared state document in JSON format. This document
is injected into every message sent to the LLM so it always has full context
of both sides of the build session.

```json
{
  "workshop": {
    "user_deck": [
      { "name": "Sol Ring", "count": 1 }
    ],
    "user_referenced": [
      { "name": "Lightning Bolt", "count": 1 }
    ],
    "llm_deck": [
      { "name": "Doubling Season", "count": 1 }
    ],
    "llm_referenced": [
      { "name": "Arcane Signet", "count": 1 }
    ],
    "llm_notes": "Building toward a proliferate/counters theme. Win condition is Atraxa ticking up planeswalkers."
  }
}
```

**Ownership model:**
- The app owns and updates `user_deck` and `user_referenced` based on user
  actions in the UI
- The LLM owns and updates `llm_deck`, `llm_referenced`, and `llm_notes` in
  each response
- The complete document is injected as context on every turn - both sides
  always see the full current state
- The LLM's JSON output is parsed by MCPOrchestrator before reaching the
  renderer; the structured data routes to the Workshop panel, the readable
  response text routes to the chat

The JSON schema is included in the Workshop system prompt as a spec. The LLM
is instructed to always output its updated state block alongside its response.
This approach is provider-agnostic - any LLM that can follow output format
instructions can participate.

### Format and Rules

- User selects a format at the start of each Workshop session (e.g. Standard,
  Commander, Historic, Brawl)
- Selected format is injected into the Workshop system prompt and held for the
  session; user can change it mid-session
- The Workshop system prompt includes comprehensive format rules sourced from
  the knowledge base: deck size limits, singleton rules, commander color
  identity, ban lists, restricted lists, and legality rules per format
- The LLM operates as a deckbuilding expert that knows and enforces format
  rules. It must never suggest illegal cards, incorrect quantities, or decks
  that violate format constraints. Accuracy here is non-negotiable - incorrect
  legality information has real consequences for the user.

### Card Routing

- Cards the user mentions in the chat are matched via CatalogService and
  populate `user_referenced`
- The LLM populates `llm_referenced` with cards it is currently discussing
  and `llm_deck` with cards it has committed to its proposed deck
- The user explicitly moves cards from `user_referenced` into `user_deck`
  (not automatic)

### User Interactions - Left Panel

- Add a card to *My Deck* from *In Discussion* with a single action
- Adjust card counts in *My Deck* with +/- controls
- Remove cards from *My Deck*
- No cap on deck size (Commander goes to 100, collection use cases may be
  larger)
- Hover any card row for image tooltip (REQ-014)

### User Interactions - Right Panel

- View LLM's current deck proposal and referenced cards
- Copy an individual card from LLM's Deck into My Deck
- Copy the LLM's entire deck into My Deck (replaces current deck with
  confirmation)
- Hover any card row for image tooltip (REQ-014)

### Deck Stats (Phase 3b)

Displayed for the user's committed deck:
- Total card count
- Mana curve (bar chart by converted mana cost)
- Creature vs. non-creature spell breakdown
- Color distribution and pip count
- Land ratio
- Power spike (where the curve peaks)

### Import / Export

- Export user's deck as MTGA-compatible plain text deck list (one card per
  line: `4 Lightning Bolt`)
- Import a deck list from MTGA plain text format into My Deck
- LLM can generate and output an MTGA-compatible import string for its deck
  at any time during conversation

### Deck Storage (Phase 3b)

- User can save and load named custom decks locally
- Deck data persists between sessions

### Collection Integration (REQ-015 - separate tab)

Personal card collection management is handled in a dedicated Collection
Manager tab, not the Workshop. See REQ-015. The Workshop will integrate with
collection data once REQ-015 is built (e.g. owned card indicators, "suggest
owned cards only" toggle).

> **Note:** Phase 3 is split into two sub-phases: the conversational and card
> layer first (3a), then deck management tools including stats and storage (3b).
> See ROADMAP.md.

---

## REQ-006: Settings and Configuration

A settings/config dialogue accessible from the app.

### Planned Settings (to be detailed when built)
- **Write to Lookup** - same toggle as in the Assistant toolbar, surfaced here
  for discoverability
- **Inject card context into prompts** - controls whether Scryfall card data is
  injected into LLM prompts when cards are mentioned; when off the Assistant relies
  on its training knowledge only. Tooltip notes this affects token/API usage.
- Additional settings TBD

---

## REQ-007: Mana Symbol Rendering

Mana cost and ability symbols throughout the application must render as the
official WotC graphical icons rather than the shorthand text notation (e.g.
`{B}`, `{U}`, `{T}`).

### Scope
All locations where mana symbols appear must be covered:
- **Card Info section** - mana cost in the card header
- **Oracle text** - inline symbols within ability text (e.g. "Add {G}{G}" or
  "{T}: Add {W}")
- **Assistant chat** - card names are bolded in responses; if card data is
  ever rendered inline in chat, symbols must use icons there too

### Symbol Set
At minimum: colored mana {W} {U} {B} {R} {G}, generic/colorless {1}-{20}
{X} {C}, tap {T}, untap {Q}, energy {E}, Phyrexian mana ({W/P} etc.), and
split hybrid pips ({W/U} etc.).

### Source
Scryfall provides SVG icons for all official card symbols via a public
endpoint. These should be fetched or bundled locally - do not hotlink from
Scryfall in production.

### Display
- Icons must be inline with surrounding text, vertically centered on the
  text baseline
- Size should match surrounding font size (1em equivalent)
- No border or background on the icon itself

---

## REQ-008: Multi-LLM Provider Support

The application must support multiple LLM backends, selectable by the user.

### Providers (initial target)
- **Ollama (local)** - current default; free, private, no API key required
- **Claude (Anthropic API)** - user supplies their own Anthropic API key;
  billed per token against their Anthropic account

### Configuration
- Provider selection and API keys are managed in the Settings dialogue (REQ-006)
- Switching providers does not require an app restart
- API keys are stored locally and never transmitted anywhere except the
  relevant provider's API endpoint

### Notes
- An Anthropic API key is separate from a Claude.ai Pro subscription - users
  obtain it from console.anthropic.com. The settings UI should make this clear
  with a brief explainer and a link.
- OllamaService should be refactored into a provider pattern consistent with
  the MCP provider architecture so new LLM backends can be added by extension,
  not modification

---

## REQ-009: Bidirectional Card Routing in Workshop

Both sides of the Workshop conversation surface cards to their respective
areas. The mechanism differs by side.

### User Side
- CatalogService runs `findInMessage()` against the user's message text
- Matched cards are added to `user_referenced` in the Workshop state document
- They appear in the *In Discussion* section of the left player area
- The user explicitly promotes cards from *In Discussion* to *My Deck*

### LLM Side
- The LLM self-declares its referenced and committed cards via the Workshop
  JSON state block returned in each response (see REQ-005 Workshop State)
- `llm_referenced` populates the *In Discussion* section of the right LLM area
- `llm_deck` populates the *LLM's Deck* section of the right LLM area
- CatalogService is **not** run against LLM response text for Workshop - the
  JSON contract is the authoritative source for LLM-side card routing

### Scope
- Bidirectional card routing applies to the Workshop tab only
- The MTG Wizard tab does not surface cards from LLM responses
- Card Lookup receives cards only from user-initiated searches or from the
  "Write to Lookup" feed in MTG Wizard (user-mentioned cards only, never LLM output)

---

## REQ-010: Knowledge Base Service

A service that loads foundational MTG knowledge files and injects relevant
content into the LLM context before each message is sent.

### Directory Structure
```
resources/knowledge/
  sources/        Raw official documents fetched from external sources
                  (gitignored - populated at runtime)
  topics/         Processed MD files injected into LLM context
                  (committed - seeded with official content)
  manifest.json   Topic index: keywords, source mappings, injection rules,
                  timestamps, and source type (official vs. user)
```

### Manifest Format
Each topic entry in manifest.json contains:
- `id` - unique identifier
- `file` - filename in topics/
- `description` - what the file covers
- `keywords` - message keywords that trigger this topic's injection
- `alwaysInject` - if true, injected into every message regardless of keywords
- `source` - `"official"` (app-maintained) or `"user"` (user-maintained)
- `sourceDocs` - which source files in sources/ this topic is built from
- `lastBuilt` - ISO timestamp of last content rebuild

### KnowledgeBaseService Behavior
- Loads all topic files at startup alongside CatalogService
- `getRelevantContext(message)` returns at most 2 keyword-matched topic files
- Topics flagged `alwaysInject: true` are always included (counts toward the cap
  only if the same topic would also be keyword-matched)
- Wired into MCPOrchestrator; injected into LLM context alongside Scryfall data
- Adding a new topic requires only a new MD file + a manifest entry - no code change

### Official vs. User Content
- `"source": "official"` topics are built and maintained by the app's
  ContentManagerService (REQ-011). The app stands behind their accuracy.
- `"source": "user"` topics are created and maintained entirely by the user.
  The app makes no claims about their accuracy. Errors, outdated information,
  or hallucination-adjacent content in user files are the user's responsibility.
- The distinction is visible in any KB status UI so the user always knows
  which content is app-verified.

---

## REQ-011: Knowledge Base Content Manager

A service that fetches authoritative source documents and rebuilds official
knowledge base topic files from them. The app ships with a pre-populated
knowledge base; updates are always optional and user-controlled.

### Authoritative Sources
- **WotC Comprehensive Rules** - Full plain-text rules document published by
  Wizards of the Coast. Fetched and stored as `sources/comprehensive-rules.txt`.
  Contains official definitions for all keywords, turn structure, combat rules,
  the stack, and the official glossary.
- **Scryfall Catalog API** - Provides structured lists: keyword abilities,
  keyword actions, ability words, creature types, artifact types, enchantment
  types, land types, spell types, and card symbology.
- **MTGJson** - Machine-readable MTG data including keyword categorization
  and structured type data. Version endpoint used to detect when data has changed.

### What Gets Built
The ContentManagerService processes source documents into topic MD files using
**light formatting only** - presenting official source text cleanly without
inventing, interpolating, or interpreting meaning. Every claim in an official
topic file must be directly traceable to a source document.

### Shipping Policy
- The app ships with a pre-populated `topics/` directory built using the
  ContentManagerService before release. Users have a working knowledge base
  from first launch with no update required.
- The release date of the shipped content is recorded in the manifest so the
  user can see exactly how old it is.

### Update Policy - User Always in Control
- **Auto-update is off by default.** The app never updates the knowledge base
  without the user's knowledge or approval.
- Auto-update can be enabled in Settings (REQ-006) by the user. When enabled,
  the update runs silently in the background without interrupting the app.
- **The app never locks the user out or blocks usage to perform an update.**
  Updates always happen in the background.
- Manual updates are always triggerable from Settings regardless of auto-update
  setting.

### Staleness Notifications
The app notifies the user passively when the knowledge base is aging. These
are non-blocking notifications - the app remains fully usable.
- **30+ days since last update:** Yellow toast notification at startup.
  Dismissible. Includes a direct link to trigger an update.
- **90+ days since last update:** Red toast notification at startup.
  Same behavior, stronger visual weight.
- Toasts auto-dismiss after a short duration. The last-update date is always
  visible in Settings regardless of notification state.

### Update Progress UI
When the user triggers a manual update:
- A progress panel displays with an approximate completion time estimate
- A progress bar advances as each task completes
- Task labels update in real time (e.g. "Fetching WotC Comprehensive Rules...",
  "Rebuilding glossary...", "Updating card types...")
- Completion time estimate recalculates as tasks finish

### Refresh Behavior
- Fetches all sources, stores raw copies in `sources/`
- Rebuilds only topics tagged `"source": "official"` in the manifest
- Never modifies files tagged `"source": "user"`
- Updates `lastRefreshed` and `lastBuilt` timestamps in the manifest on success
- App functions fully offline after first run (sources and topics cached locally)

### Failure Handling
- If a source fetch fails, the existing topic file is kept unchanged
- Partial failures do not block the rest of the refresh
- All errors are logged with timestamp, source URL, and error detail
- The progress UI surfaces errors inline so the user knows which tasks failed
- A failed update does not alter the `lastRefreshed` timestamp

---

## REQ-012: User Profile and Persistent Context

A persistent user profile that gives the LLM continuity across sessions.
Without this, the LLM starts every session with no knowledge of the user.

### Storage
- Stored in the OS user data directory via Electron's `app.getPath('userData')`
- Not part of the app bundle - never committed to the repo

### Content
User-editable fields that persist across sessions and are injected into the
LLM system prompt at startup:
- Preferred formats (e.g. Standard, Brawl, Draft)
- Play style notes (e.g. "I prefer aggressive strategies")
- Skill level / familiarity
- Any other context the user wants the LLM to carry forward

### Behavior
- Empty by default - the user builds it over time
- Injected into the system prompt at session start, before any conversation
- Manageable from Settings (REQ-006)
- The LLM may surface suggestions to update the profile during conversation
  (e.g. "Want me to remember that you play Commander?") - but the user
  controls what actually gets saved

---

## REQ-013: Diagnostics Bar

A persistent, real-time status display that keeps the user informed of what
the application is doing at all times. The user should never be left staring
at a loading state wondering whether the app is working or has locked up.

### Display

- A single-line bar fixed to the bottom of the app window, visible across
  all tabs regardless of which tab is active
- Displays a short, plain-language description of the current operation as
  it happens (e.g. "Loading card catalog...", "Fetching card data from
  Scryfall...", "Waiting for LLM response...")
- Updates in real time on every new event; each new event replaces the
  previous message
- After a short idle period with no new events, the message resets to
  "Ready."

### Toggle

- **On by default**
- A toggle button lives inside the diagnostics bar itself at the right edge
- The button displays an eye icon with a label reflecting current state:
  **"Diagnostics on"** when active, **"Diagnostics off"** when hidden
- When toggled off, the bar collapses to show only the toggle button (a thin
  strip) so the toggle is always accessible regardless of state
- Toggle preference is stored for the session; future Settings integration
  will make it persistent (REQ-006)

### Events Covered

At minimum, the diagnostics bar must report on:

**Startup**
- Loading Scryfall card catalog
- Loading MTG symbol map
- Loading knowledge base topics
- LLM provider detection and connection

**MTG Wizard (per message)**
- Analyzing message intent
- Fetching card data from Scryfall (when cards are identified)
- Injecting knowledge base context
- Waiting for LLM response (including elapsed time)

**Card Lookup**
- Search in progress
- Card data fetch

**General**
- Any error states that would otherwise appear silent to the user

### Architecture

- `StatusService` (main process) - a thin event emitter; any service calls
  `StatusService.emit(message)` without needing to know about the UI
- `status-update` IPC push channel (main → renderer, no response)
- `StatusBarController` (renderer) - subscribes to status events, manages
  bar display, toggle state, and idle timer
- `window.mtgHelper.onStatusUpdate(cb)` added to preload.js IPC surface

### Non-goals

- No scrollable history panel in the UI - the log file (`logs/app.log`)
  already captures the full event history for any user who wants it
- No per-tab status areas - one global bar covers all tabs

---

## REQ-014: Card Image Tooltip Service

A shared hover tooltip that displays a card's image when the user hovers over
any card row in the application. Provides a lightweight visual reference
without requiring a full card detail panel.

### Behavior

- Hovering over a card row displays a floating tooltip containing the card's
  image
- Moving off the card row hides the tooltip
- The tooltip positions itself near the hovered element and clamps to the
  viewport so it never goes off screen
- Uses the Scryfall `small` image (`146×204px`) - compact enough for a
  tooltip, already available in card data

### Scope

Initially used in the Workshop tab card list areas. Designed as shared
infrastructure so it can be adopted by other views without rework:
- Card Lookup (future)
- MTG Wizard chat - bolded card names (future)

### Architecture

- `CardTooltipController` - a single shared controller instantiated once by
  `AppViewController`
- A single hidden `<div>` at the document level, absolutely positioned
- Any card row that opts in adds a `data-card-image` attribute; the controller
  wires hover listeners
- No external library dependency - implemented in plain JS (~30 lines)

---

## REQ-015: Collection Manager Tab (placeholder)

A dedicated fourth tab for managing the user's personal MTGA card collection.
Separated from Workshop to keep deck building focused and collection management
independent.

### Intent

- Import personal card collection exported from MTGA via a third-party export
  tool (supports CSV, JSON, and plain text formats)
- Track owned cards and quantities
- Provide collection data to the Workshop for owned card indicators and
  "suggest owned cards only" filtering

### Detailed Requirements

TBD when this tab is scoped for development. The Workshop (REQ-005) will
integrate with collection data once this feature is built.
