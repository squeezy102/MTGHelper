# MTG Helper - Roadmap

High-level build order. Each phase should be stable and committed before the next begins.

---

## Phase 1 - App Shell (current focus)

Restructure the application around the three-tab layout. No new features - just
getting the scaffolding right so everything that follows has a solid home.

- Replace the hardcoded left/right split with a tabbed app shell
- Implement pop-out window functionality
- Migrate the existing Assistant chat into the Assistant tab
- Migrate the existing card panel into the Lookup tab (as-is, no new Lookup features yet)
- Inter-tab/inter-window communication via IPC event bus
- Feed-from-chat toggle wired up (Lookup tab)

**Requirements covered:** REQ-003, REQ-004 (partial)

---

## Phase 2 - Lookup Tab

Enhance the Lookup tab as a standalone card research tool, no longer just a
reactive display from chat.

- Manual card search (search bar, results list)
- Full card detail view (image, info, meta - same three sections)
- Batch import from a deck list (paste a list, fetch all cards with rate limiting)
- No cap on card count

**Requirements covered:** REQ-004 (complete)

---

## Phase 3 - Deck Builder Tab

Build the deck management and analysis tool.

- Deck list with card counts and total count
- Import / export in MTGA format
- Mana curve, creature vs. spell, color breakdown
- MTGA personal library storage
- Custom deck save / load

**Requirements covered:** REQ-005

---

## Phase 4 - Settings and Configuration

- Settings dialogue accessible from the app
- Feed Lookup from Chat toggle
- Inject card context into prompts toggle (with token usage tooltip)
- Any additional settings surfaced by earlier phases

**Requirements covered:** REQ-006

---

## Future / Unscheduled

- Additional data providers beyond Scryfall (e.g. EDHRec, MTGGoldfish)
- Deck suggestions / AI-assisted deck building via the Assistant
- Format legality checker against a saved deck
- Price tracking over time
