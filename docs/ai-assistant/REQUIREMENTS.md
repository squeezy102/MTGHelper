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
- Card display retains the three-section format (image, card info, card meta)
- Card tabs at the top allow browsing multiple cards simultaneously
- Maximum of 10 cards at a time; when the cap is reached the oldest card is
  evicted (FIFO) to make room for the newest
- Card Lookup is a quick reference tool - deep card work and large card sets
  belong in the Workshop tab

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

A collaborative, split-pane workspace for card exploration and deck building
with an AI partner. The experience is modeled after sitting across a table from
a master deckbuilder - both sides are visible and actionable simultaneously.

### Layout
The tab uses a split-pane design:
- **Left pane (Player side)** - user's input and conversation, cards the user
  is exploring or has proposed, and the user's active deck project (card list,
  counts, mana curve, creature/spell ratio, land ratios)
- **Right pane (AI side)** - LLM responses, cards the AI is suggesting, and
  the AI's working deck proposal

### Card Surfacing
- Card matching runs on both sides of the conversation per REQ-009
- Cards found in the user's message populate the left card area
- Cards found in the LLM's response populate the right card area
- Both use the full card detail panel (image, info, meta)

### AI Working Deck
The LLM maintains its own working deck proposal during the session. The user can:
- View the AI's working deck at any time
- Approve individual card suggestions from the AI's area into their own deck
- Dismiss suggestions they don't want
- Copy the AI's full working deck into their own deck area

### Import / Export
- The AI can generate MTGA-compatible import strings at any time for the user to copy
- User can import a deck list from standard text formats (MTGA export, plain text)
- User can export their deck in MTGA-compatible format

### User's Deck Area
Tracks the user's active deck project:
- Card list with individual counts and total deck count
- Mana curve visualization (bar chart by converted mana cost)
- Creature vs. non-creature spell breakdown
- Color distribution / pip count
- Land ratio

### MTGA Library
- User can store their personal MTGA card collection (owned cards)
- Owned cards are indicated in the deck list view
- Library can be imported via MTGA export

### Deck Storage
- User can save and load named custom decks locally
- Deck data persists between sessions

> **Note:** Phase 3 is split into two sub-phases: the conversational and card
> layer first (3a), then deck management tools (3b). See ROADMAP.md.

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

## REQ-009: LLM Response Card Matching

Card name detection runs on LLM responses in the Workshop tab in addition to
user input. This is where bidirectional card surfacing lives - both sides of
the split pane are populated from their respective sides of the conversation.

### Behavior
- After the LLM response is received in the Workshop tab, CatalogService runs
  the same findInMessage() pass against the response text
- Cards found in the LLM response populate the right (AI) side of the Workshop panel
- Cards found in the user's message populate the left (user) side of the Workshop panel
- Cards are tagged by source (user vs. LLM) to drive the split-pane routing

### Scope
- LLM response card matching applies to the Workshop tab only
- The MTG Wizard tab does not surface cards from LLM responses
- Card Lookup receives cards only from user-initiated searches or from the
  "Write to Lookup" feed in MTG Wizard (user-mentioned cards only, never LLM output)

### Toggle
- A **"Match cards in responses"** toggle in Settings (REQ-006) controls this
  behavior within the Workshop tab; default **on** (Workshop context makes the intent clear)
- When off, card matching only runs on user input in the Workshop tab
- Tooltip notes the Scryfall API call implications

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
