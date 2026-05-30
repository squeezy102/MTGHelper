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

The app is restructured around three top-level tabs, each representing a distinct
area of functionality.

### Tabs
1. **Assistant** - the AI chat interface
2. **Lookup** - card search and reference panel
3. **Deck Builder** - deck management and analysis tools

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

A dedicated card reference view, replacing the right-panel card display from REQ-001.

### Layout
- Card display retains the three-section format (image, card info, card meta) from REQ-001
- Card tabs at the top allow browsing multiple cards
- No hard cap on number of cards - user browses as many as they want
- Large batch imports (e.g. a full deck list) are fetched with rate limiting to
  respect the Scryfall API

### Write to Lookup (Feed Toggle)
- A **"Write to Lookup"** checkbox lives in the Assistant tab toolbar
- Default: **off**
- When on, cards identified in the Assistant conversation are automatically sent
  to the Lookup tab (whether docked or popped out)
- When off, the Lookup tab is idle and no Scryfall lookups are triggered from chat
- Tooltip explains what the toggle does

### Card Deduplication and Disambiguation
- The Lookup tab never displays two cards for the same keyword/mention
- When a message contains a name that matches multiple cards of varying specificity
  (e.g. "Meathook Massacre II" also contains "Meathook Massacre"), only the most
  specific (longest) match is shown - **longest match wins**
- A card already loaded in the Lookup tab is not added again if mentioned again
  in a subsequent message

---

## REQ-005: Deck Builder Tab

A full deck management and analysis tool.

### Deck List
- Displays all cards in the deck with individual card counts
- Shows total card count for the deck
- Cards can be added, removed, and quantity-adjusted

### Import / Export
- Import a deck list from standard text formats (MTGA export format, plain text)
- Export a deck list in MTGA-compatible format

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
