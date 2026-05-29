# MTG Helper - Requirements

## REQ-001: Card Panel - Contextual Card Display

When one or more cards are mentioned during a conversation, the right panel displays
a detailed card entry for each card identified.

### Display Contents (per card)
- Card image
- Card info (name, mana cost, type, oracle text, power/toughness where applicable)
- Legality across relevant formats
- Official rulings
- Any other pertinent data returned by the MCP layer (e.g. pricing)

### Behavior
- Cards stack in the right panel and are browsable individually
- Each card entry is dismissable independently
- Maximum of 10 cards held in memory and displayed at once
- When the cap is reached, the oldest card in the conversation is evicted to make
  room for the newest (FIFO eviction)
- Cards persist in the panel across multiple conversation turns until dismissed
