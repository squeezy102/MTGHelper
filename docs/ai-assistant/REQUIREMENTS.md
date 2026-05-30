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
1. **Assistant** - general MTG conversation with an AI companion; cards surface
   as a natural side effect of discussion but the experience is conversational
2. **Lookup** - pure manual card reference; search and browse cards with full
   detail; no AI involvement in this tab
3. **Deck Builder** - AI-assisted, intent-driven deck building; conversational
   experience purpose-built for discovering, discussing, and assembling a deck

### Tab Behavior
- Only one tab is active/visible at a time within a window
- Each tab has a pop-out button (↗) that opens it in its own independent window
- A popped-out tab is grayed out in the main window's nav bar
- When a pop-out window is closed, the tab returns to the main window
- Any tab can be popped out independently - the user could have all three in
  separate windows simultaneously
- Pop-out windows show only their assigned view with no nav bar

---

## REQ-004: Lookup Tab

A standalone card reference tool. No AI or conversational elements - the user
searches for cards directly and browses their data.

### Layout
- Card display retains the three-section format (image, card info, card meta)
- Card tabs at the top allow browsing multiple cards simultaneously
- No hard cap on card count - user browses as many as they want
- Large batch imports (e.g. a full deck list) are fetched with rate limiting to
  respect the Scryfall API

### Write to Lookup (Feed Toggle)
- A **"Write to Lookup"** checkbox lives in the Assistant tab toolbar
- Default: **off**
- When on, cards identified in the Assistant conversation (both from user
  messages and LLM responses, per REQ-009) are automatically sent to the
  Lookup tab
- When off, the Lookup tab receives no cards from the Assistant
- Tooltip explains what the toggle does

### Card Deduplication and Disambiguation
- The Lookup tab never displays two tabs for the same card
- When a message contains names of varying specificity (e.g. "Meathook Massacre"
  and "Meathook Massacre II"), only the longest match is kept - **longest match wins**
- A card already loaded is not added again if mentioned in a subsequent message

---

## REQ-005: Deck Builder Tab

An AI-assisted, intent-driven deck building experience combined with full deck
management tools. This tab is purpose-built for the focused task of assembling
and analyzing a deck with an AI companion.

### Conversational Layout
The tab uses a split-pane design:
- **Left pane** - user input and the cards surfaced from user messages
- **Right pane** - LLM responses and the cards surfaced from those responses

This makes both sides of the conversation actionable simultaneously: the user
can see what cards their own queries triggered alongside what cards the AI is
suggesting, without switching context.

### Card Surfacing
- Card matching runs on both sides of the conversation (user input and LLM
  response) per REQ-009
- Cards found in the user's message populate the left card area
- Cards found in the LLM's response populate the right card area
- Both use the full card detail panel (image, info, meta)

### Deck List
- A persistent deck list panel tracks cards added to the deck
- Cards can be added from either the left or right card area
- Displays individual card counts and total deck count
- Cards can be removed and quantities adjusted

### Import / Export
- Import a deck list from standard text formats (MTGA export format, plain text)
- Export in MTGA-compatible format

### Analysis Panel
- Mana curve visualization (bar chart by converted mana cost)
- Creature vs. non-creature spell breakdown
- Color distribution / pip count
- Additional breakdowns TBD

### MTGA Library
- User can store their personal MTGA card collection (owned cards)
- Owned cards are indicated in the deck list view
- Library can be imported via MTGA export

### Deck Storage
- User can save and load named custom decks locally
- Deck data persists between sessions

> **Note:** Due to the expanded scope of this tab, Phase 3 in the roadmap
> may be split into two sub-phases: the conversational layer first, then
> deck management tools. See ROADMAP.md.

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

Card name detection must run on LLM responses in addition to user input.
Currently card matching only runs on the user's message before the LLM is
called; this extends it to the return trip.

### Behavior
- After the LLM response is received, CatalogService runs the same
  findInMessage() pass against the response text
- Cards found in the LLM response are returned alongside any cards found in
  the user's message, but tagged by source (user vs. LLM)
- The source tag drives routing in REQ-005's split-pane Deck Builder layout
- In the Assistant tab, both sets of cards are treated the same for the
  purpose of "Write to Lookup"

### Toggle
- A **"Match cards in responses"** toggle in Settings (REQ-006) controls this
  behavior; default **on**
- When off, card matching only runs on user input - reduces Scryfall API calls
  for users who don't need the LLM response side populated
- Tooltip notes the API call and token implications
