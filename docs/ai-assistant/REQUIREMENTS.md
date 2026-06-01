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

### Alternate Printings Browser
Many cards have been printed dozens of times with different art. Card Lookup
supports browsing alternate printings, but lazily - the full printing list is
never fetched until the user requests it.

- On card load, fetch only the total printing count (`total_cards` from Scryfall)
  and display a subtle label: e.g. "14 printings available"
- Browsing is opt-in - the user clicks the label to trigger the full fetch
- Navigation: previous/next control with a count indicator (e.g. "Print 3 of 14")
- Cycling a printing changes: card art, set name, and collector info only
- Oracle text, legality, and rulings stay locked to the canonical printing - these
  are card properties, not printing properties
- The Workshop tab shows the first Scryfall result only; printing browsing is a
  Lookup feature

---

## REQ-005: Workshop Tab

A two-panel collaborative workspace for deck building with Claude as an active
partner. The Workshop is a fluid, continuous process - there are no distinct
modes, no handoffs between "build mode" and "iterate mode." The deck list is
always the source of truth. The conversation is always the tool.

### Layout

```
+----------------------------------------------------------+
|  [Deck Name]   Format ▾   Strategy ▾   [Save]  [Export] |
+-------------------------+--------------------------------+
|                         |                               |
|   CONVERSATION          |   DECK LIST                   |
|                         |                               |
|   Chat with Claude.     |   4x Death Baron        [-][+]|
|   Claude reads the      |   4x Gravecrawler       [-][+]|
|   deck list and         |   3x Liliana, Dreadhorde[-][+]|
|   adjusts suggestions   |   ─────────────────────────   |
|   based on the          |   ▓▓▓▒  Curve                 |
|   contract at all       |   ██  Colors                  |
|   times.                |   42/60 · 18 lands            |
|                         |   22 creatures · 20 spells    |
+-------------------------+--------------------------------+
```

Two panels - conversation on the left, deck list on the right. No card staging
area (considered and rejected - hover and double-click handle card inspection
more elegantly).

- **Hover** any card name for a quick image preview (REQ-014)
- **Double-click** any card for a full detail view (opens Card Lookup or an
  inline overlay - TBD during implementation)
- **Star** any card to favorite it (REQ-017)

### Deck List Panel

Always visible, always current, never hidden. Displays at all times:
- Full card list with counts and +/- controls
- Card count, land count
- Mana curve (bar chart)
- Color distribution
- Creature/spell ratio

The deck list updates immediately on every change - add, remove, swap, or
count adjustment.

### The Deck Contract

The contract lives in the toolbar - always visible, always editable. The user
can change it at any time. Claude re-evaluates suggestions against it
continuously, not just at session start.

**Contract contents:**
- Format (Standard, Commander, Historic, Brawl, etc.) and associated rules
- Intended strategy/archetype
- Win condition(s)
- Mana curve targets
- Color identity
- Wildcard budget mode (Optimal or Budget - see Wildcard Budget below)
- Card preferences and favorites as a soft preference layer (REQ-017)

Format is injected into the Workshop system prompt once at session start.
The user can change format mid-session; Claude re-evaluates on the next turn.

### Session Start - Contract Gathering

When a session starts with no contract established, Claude gathers it through
natural conversation before surfacing any cards. Maximum three focused questions:
1. What format?
2. Any playstyle preference, or completely open?
3. Optimal build or wildcard budget constraints?

Claude synthesizes the answers, confirms the contract briefly, then begins.
The deck list stays empty during this exchange. No cards surface until there
is a contract to evaluate them against.

### Anti-Sycophancy

Claude acts as a deck consistency evaluator, not just a helpful assistant.
Every card suggestion - from the user or from Claude - is evaluated against
the contract before acceptance. If a suggestion conflicts with the established
strategy, Claude says so clearly and respectfully, then asks if the user wants
to proceed anyway.

The player always has final say - but they must consciously override, not
passively drift.

### Wildcard Budget

Two modes, selectable in the toolbar and stored in the contract:
- **Optimal** - no wildcard constraints; pure strategy
- **Budget** - wildcard sliders active; suggestions filtered and ranked by
  rarity cost

Sliders per Arena wildcard tier: Common (0-30), Uncommon (0-30), Rare (0-20),
Mythic Rare (0-8).

When a card is a strategic fit but exceeds the budget, Claude says so and
suggests a lower-rarity alternative. Rarity data comes from Scryfall - no new
API required.

### Card Suggestion UI

**Mentioned vs. suggested cards are visually distinct:**

- **Mentioned** (referenced in discussion only) - bolded, hoverable,
  double-click for full view. No action buttons.
- **Suggested** (Claude is actively recommending for the deck) - rendered as
  inline pills with a direct add button embedded in the prose.

Inline pill example:
```
I recommend running four copies of [★★ Death Baron +] as your lord package.
```

The `+` adds the card directly to the deck list. One click. No modal. No
staging area.

### Structured Output Contract

The Workshop system prompt instructs Claude to respond in two parts:
1. **Prose** - conversation, explanation, reasoning (rendered to the user as-is)
2. **Suggestion block** - parsed by the app, stripped before rendering to the user

```
SUGGESTIONS:
4x Death Baron
4x Gravecrawler
3x Liliana, Dreadhorde General
```

Cards in the suggestion block render as pills in the prose. Cards mentioned
only in prose render as bolded text. The distinction is unambiguous and
machine-driven.

**Bulk suggestions (full deck or large batch):**
```
Claude is suggesting 60 cards for a mono-black zombies deck.
[Review & Add All]   [Review Card by Card]   [Dismiss]
```
- Review & Add All - populates the deck list immediately; user iterates from there
- Review Card by Card - steps through with hover preview; accept or skip each
- Dismiss - rejects the batch

**Swap suggestions:**
```
[-1 Sheoldred's Edict  →  +1 Invoke Despair]   [Apply]   [Ignore]
```
One click applies the swap. Claude must always name specific cards in swap
suggestions - vague direction ("smooth the curve") is not acceptable.

**User delegation** - when the user says "your call" or similar, Claude treats
it as a commit instruction. Claude acts specifically, narrates what it did and
why, and the deck list updates immediately via the swap pattern above.

### Workshop Token Strategy

The Workshop is the highest token-pressure surface in the app.

**Prompt structure:**
- System prompt: role + behavioral guidelines (static, small)
- Contract block: format, strategy, constraints (small, structured JSON)
- Deck state: current list as compact notation (~200-300 tokens)
- Conversation: pruned sliding window only (see REQ-019)
- Injected context: only what this specific turn needs

**Deck state format - compact notation, never prose:**
```
DECK (42/60): 4x Death Baron 4x Gravecrawler 3x Liliana...
LANDS (18/60): 4x Swamp 4x Hive of the Eye Tyrant...
```

**What never goes in the prompt:**
- Full Scryfall card objects (oracle text, rulings, images are UI state only)
- Cards mentioned in conversation but not in the deck
- Full conversation history beyond the sliding window

Claude receives card names and basic stats only. Full card data stays in the
UI layer.

### Import / Export

- Export user's deck as MTGA-compatible plain text deck list (`4 Lightning Bolt`)
- Import a deck list from MTGA plain text format into the deck list
- Claude can generate and output an MTGA-compatible import string at any time

### Deck Stats

Displayed in the deck list panel at all times:
- Total card count and land count
- Mana curve (bar chart by converted mana cost)
- Creature vs. non-creature spell breakdown
- Color distribution
- Land ratio

### Deck Storage (Phase 3b)

- User can save and load named custom decks locally
- Deck data persists between sessions via `UserDataService` (REQ-018)

### Collection Integration (REQ-015 - separate tab)

Personal card collection management is handled in a dedicated Collection
Manager tab, not the Workshop. See REQ-015. The Workshop will integrate with
collection data once REQ-015 is built (owned card indicators, "suggest owned
cards only" toggle).

> **Note:** The original three-area layout (left player / center chat / right
> LLM) described in earlier design sessions has been superseded by this
> two-panel design. See DECISIONS.md for rationale.

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
- Provider selection is managed in the Settings dialogue (REQ-006)
- Switching providers does not require an app restart
- API keys live in OS environment variables only - never stored by the application
  in any settings panel, config file, or database field

### Notes
- An Anthropic API key is separate from a Claude.ai Pro subscription - users
  obtain it from console.anthropic.com. The settings UI should make this clear
  with a brief explainer and a link.
- OllamaService should be refactored into a provider pattern consistent with
  the MCP provider architecture so new LLM backends can be added by extension,
  not modification

---

## REQ-009: Card Routing in Workshop

Cards surface in the Workshop deck list through two distinct mechanisms.

### User Side
- CatalogService runs `findInMessage()` against the user's message text
- Matched cards are candidates - the user explicitly adds them to the deck list
  via the suggestion UI; they are never auto-added
- Cards mentioned by the user but not added are bolded in the conversation prose

### Claude Side
- Claude self-declares suggested cards via the structured SUGGESTIONS block
  returned in each response (see REQ-005 Structured Output Contract)
- Suggested cards render as inline pills with a direct add button
- CatalogService is **not** run against Claude's response text - the
  SUGGESTIONS block is the authoritative source for Claude-side card routing

### Scope
- Card routing applies to the Workshop tab only
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
- Stored as a JSON file in the OS user data directory via Electron's
  `app.getPath('userData')` - managed by `UserPreferencesService` (REQ-018)
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

---

## REQ-016: Local Data Layer

Replace startup network fetches with a local bulk data layer backed by the
Scryfall `oracle-cards` daily snapshot. The app must be available for use
immediately on launch using locally cached data.

### Core Principle
Local first, network as fallback. Static data - card data, rules, mana symbols -
must be available without a network call. LLM features require network by
definition and are exempt.

### Scryfall Bulk Data
The `oracle-cards` snapshot (~20MB compressed, ~120MB uncompressed) is
downloaded from the Scryfall `/bulk-data` endpoint and cached locally.

**What the local cache eliminates:**
- Startup catalog name fetch (CatalogService)
- Per-card `/cards/named?exact=` calls (ScryfallProvider)
- Legality lookups
- Pricing lookups
- Rarity lookups (required for wildcard budget in REQ-005)

**What still hits Scryfall live (on demand only):**
- Alternate printing counts and printing list (Card Lookup - REQ-004)
- Card image URLs (never hosted locally)
- Rulings (fetched per card on demand)

### LocalDataService
A new service that sits in front of all card data access:
- Checks local bulk data first; falls back to live Scryfall on cache miss
- `ScryfallProvider` talks to `LocalDataService`, not directly to the API
- App starts immediately using existing local data; bulk refresh runs in
  the background if the snapshot is stale

### Mana Symbols
Bundle all MTG symbol SVGs into `resources/data/symbols/` at build time.
MTG symbols never change between app versions - the startup network call to
Scryfall is eliminated entirely. Completes and closes REQ-007.

### Local Data Directory Structure
```
resources/data/
  scryfall-bulk/
    oracle-cards.json     Daily snapshot (gitignored - never committed)
    metadata.json         Download date, card count, checksum
  symbols/
    W.svg, U.svg, B.svg   Bundled at build time (committed to repo)
```

### Startup Sequence (after optimization)
- Before: fetch catalog (network) → fetch symbols (network) → ready
- After: check bulk freshness → background refresh if stale → ready immediately

---

## REQ-017: Card Favorites

A star icon appears on cards wherever they are displayed - Card Lookup,
Workshop deck list, anywhere in the app. Favorites persist across sessions.

### Storage
Stored in `UserDataService` (REQ-018) against the card's Scryfall ID.

### Optional Preference Note
An optional short note can be attached to each favorite (e.g. "prefer instants
over sorceries," "like the art on the Dominaria printing"). This note feeds
into the Workshop deck contract as a soft preference layer.

### Workshop Behavior
- **Passive bias** - when Claude chooses between two cards fulfilling the same
  role equally well, the favorited card is preferred silently with no comment
- **Active surfacing** - when a favorited card is a strong fit for the current
  deck contract, Claude proactively mentions it with a one-sentence explanation
- When Claude prioritizes a favorited card, it says so briefly - the user
  always knows why

Favorites are a soft preference layer, sitting below hard constraints like
format legality and wildcard budget. They never override correctness.

---

## REQ-018: User Data Layer

Four categories of persistent user data require structured storage. Two
services handle them, chosen to match the nature of the data.

### UserDataService - SQLite via `better-sqlite3`
Handles structured, relational, or high-volume data:
- **Decks and deck_cards** - a deck has many cards, each with a count
- **Card collection** - a full MTGA collection is thousands of cards
- **Card favorites** - stored against Scryfall card ID (REQ-017)
- **LLM usage log** - one row per API call (REQ-020)

SQLite lives entirely inside the application as a single `.db` file. There is
no server, no network, no separate process. The database file lives in the OS
user data directory via Electron's `app.getPath('userData')`.

`better-sqlite3` runs synchronously in the main process, which fits the
existing IPC architecture cleanly.

```
UserDataService   → SQLite  (decks, collection, favorites, usage log)
```

### UserPreferencesService - JSON files
Handles flat preference data where human-readability is a feature:
- App settings and feature toggles
- User profile (play style, preferred formats, skill level - REQ-012)
- Wildcard budget per rarity tier (REQ-005)

```
UserPreferencesService → JSON  (settings, profile, wildcard budgets)
```

### Schema Reference

```sql
-- Decks
CREATE TABLE decks (
  id        INTEGER PRIMARY KEY,
  name      TEXT,
  format    TEXT,
  modified  TEXT
);

CREATE TABLE deck_cards (
  deck_id   INTEGER REFERENCES decks(id),
  card_name TEXT,
  count     INTEGER
);

-- Favorites
CREATE TABLE favorites (
  scryfall_id TEXT PRIMARY KEY,
  card_name   TEXT,
  note        TEXT
);

-- Collection
CREATE TABLE collection (
  scryfall_id TEXT PRIMARY KEY,
  card_name   TEXT,
  count       INTEGER
);
```

---

## REQ-019: Token Cost Management

Every Claude API call must inject the minimum context needed to ground that
specific message. The goal is precision, not completeness.

### Required Changes

- **Chunk KB topics** - `KnowledgeBaseService.getRelevantContext()` must
  return matched sections, not full topic files
- **Prune conversation history** - sliding window of last N turns (starting
  point: 6-10 turns); older turns are dropped before sending. Exact window
  size to be tuned from baseline data (REQ-020)
- **Cap Scryfall context** - inject oracle text only by default; rulings and
  pricing are injected only when the message explicitly requests them
- **Hard token budget** - `MCPOrchestrator` enforces a ceiling before every
  API call; trims context to fit; never silently exceeds budget

### Known Bug - Sticky Context

When a follow-up message contains no MTG vocabulary, `MessageIntentService`
finds no keyword matches and `MCPOrchestrator` injects no context. The LLM
is then flying blind on a message that is clearly a continuation of the
previous turn.

Fix: `MCPOrchestrator` must cache the last injected context and re-use it on
turns that generate no new context of their own.

### History Summarization (future)

Whether history summarization is done client-side (cheaper) or via a secondary
Claude call (more accurate) is an open question. Decide after baseline token
data is available from REQ-020.

---

## REQ-020: Token Usage Telemetry

Every Claude API call is logged. Users paying for API access deserve full
visibility into where their tokens go.

### What to Record
The Anthropic API returns exact token counts in every response via
`usage.input_tokens` and `usage.output_tokens` - no estimation required.
Capture in `ClaudeService.js` on every call.

Fields per turn:
- Timestamp
- Tab (wizard, workshop)
- Conversation turn number
- Prompt tokens
- Completion tokens
- Total tokens
- Context sources injected (e.g. "kb:rules-mechanics", "scryfall:3cards")
- History turns included
- Deck size at time of call (Workshop only)
- Contract present (Workshop only)

### Storage
A dedicated `llm_usage` table in `UserDataService` (REQ-018).

```sql
CREATE TABLE llm_usage (
  id                INTEGER PRIMARY KEY,
  timestamp         TEXT,
  tab               TEXT,
  turn              INTEGER,
  prompt_tokens     INTEGER,
  completion_tokens INTEGER,
  total_tokens      INTEGER,
  context_sources   TEXT,
  history_turns     INTEGER,
  deck_size         INTEGER,
  contract_present  INTEGER
);
```

Log every call as a raw row - do not pre-aggregate. Raw data can be sliced
any way later; aggregations can always be computed on read.

### Start Logging Now
The table and logging call in `ClaudeService.js` should be added as soon as
`UserDataService` exists - before the usage panel is built. Every session from
that point forward will have baseline data for optimization work.

### Usage Panel
A full usage panel is a planned feature for users to explore their own data.
Planned location: Settings or a standalone toolbar panel.

**Summary view:**
- Average tokens per turn by tab (last 7 days / all time)
- Prompt vs. completion token ratio (high ratio signals over-injection)
- Most expensive single turn on record
- Estimated API cost at current usage rate (Anthropic per-token pricing is public)
- Total spend since logging began

**Query view:**
- Filter by date range, tab, token count thresholds
- Sort by any column
- Individual turn breakdowns (context sources injected, history length, deck size)

**Export:**
One-click CSV export of the full usage history or the current filtered view.

---

## REQ-021: CSS Theme System

All colors, fonts, spacing, and visual properties must be expressed as CSS
custom properties (variables) from day one - not hardcoded anywhere in the
stylesheet.

### Requirement
Even the current minimal theme must be expressed as tokens:
```css
:root {
  --color-background: #1a1a1a;
  --color-surface:    #242424;
  --color-accent:     #a084e8;
  --font-primary:     'Inter', sans-serif;
}
```

When the visual overhaul comes, the entire app's appearance changes by updating
token definitions. Scattered hardcoded values make that work a painful rewrite.

### Planned Themes
- **Default** - dark base (correct default for card art, late-night use, and
  alignment with every serious MTG tool)
- **MTG Color Themes** - one per Magic color identity: five mono-colors, ten
  guilds, and shards/wedges over time. Each should feel authentically
  representative of that color's personality, not just a color swap.
- **Custom** - power-user feature; user sets token values directly. Can come
  later as long as the token architecture supports it from the start.

### Scope
This requirement governs how CSS is written throughout the app. It is not a
feature milestone - it is an ongoing code standard that applies to every
stylesheet change from this point forward.
