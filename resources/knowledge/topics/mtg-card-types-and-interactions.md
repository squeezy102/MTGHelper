# MTG Card Types & Interactions
> Focused on MTG Arena (MTGA). Tabletop differences noted where relevant.
> Source: Wizards of the Coast Comprehensive Rules (February 2026)

---

## Overview: Permanent vs. Non-Permanent

Cards fall into two categories:

| Type | Stays on Battlefield? | Examples |
|---|---|---|
| **Permanent** | Yes | Creature, Land, Artifact, Enchantment, Planeswalker, Battle |
| **Non-Permanent** | No (goes to graveyard) | Instant, Sorcery |

A card's type line reads: `[Supertype] [Type] - [Subtype]`
Example: `Legendary Creature - Elf Druid`

---

## Permanent Types

### Creature
- Has **Power / Toughness** (e.g. 3/2 - deals 3 damage, dies at 2 damage taken).
- Can attack and block.
- Subject to **summoning sickness** - cannot attack or use tap abilities the turn it enters unless it has Haste.
- Has **creature types** (subtypes) like Human, Elf, Dragon, Goblin, Wizard. Over 250 exist. Many cards care about specific types (e.g. "target Goblin creature").
- Dies when it takes damage equal to or greater than its toughness in one turn, or when a "destroy" effect targets it.

### Land
- **Played**, not cast. Doesn't go on the stack, can't be countered.
- You may play **one land per turn** during your main phase.
- Produces mana when tapped.
- **Basic Lands:** Plains (White), Island (Blue), Swamp (Black), Mountain (Red), Forest (Green). Unlimited copies allowed in a deck.
- **Nonbasic Lands:** Everything else. Subject to the 4-copy limit. May enter tapped, produce multiple colors, or have additional abilities.

### Artifact
- Usually colorless, but not always.
- Represents objects and constructs.
- Stays on the battlefield as a permanent.
- **Subtypes:**
  - **Equipment** - Attaches to creatures. Grants abilities/stats. Moves between creatures via the Equip ability (sorcery speed). Stays on the battlefield if the creature dies.
  - **Vehicle** - An artifact that can become a creature by "crewing" it (tapping creatures with total power equal to or greater than the crew cost).
  - **Token Artifacts** - Clue (draw a card for {2}), Food (gain 3 life for {2}), Treasure (tap + sacrifice for one mana of any color), Blood (discard a card, draw a card for {1}).

### Enchantment
- Represents ongoing magical effects.
- Stays on the battlefield.
- **Subtypes:**
  - **Aura** - Attaches to a specific permanent (or player). Has "Enchant [type]." If the thing it's attached to leaves the battlefield, the Aura goes to the graveyard. Targeting is chosen on cast.
  - **Saga** - A multi-chapter enchantment. Gets a lore counter each upkeep. Each chapter's ability triggers at the right count. Goes to the graveyard after the final chapter resolves (unless it says otherwise).
  - **Class** - A multi-level enchantment. Each level is activated (like a sorcery-speed ability) to unlock new text. Levels persist.

### Planeswalker
- Represents powerful allies fighting alongside you.
- Has **Loyalty** (bottom-right corner). Enters with that many loyalty counters.
- Has **Loyalty Abilities** - activated abilities that either add or subtract loyalty counters. Only one loyalty ability per planeswalker per turn, at sorcery speed.
- Takes damage like a player when attacked or targeted by damage spells. Damage reduces loyalty. Hits 0 loyalty - dies.
- Can be attacked directly (opponent chooses to attack your planeswalker instead of you).
- All planeswalkers are Legendary.

### Battle (Siege)
- Newest permanent type, introduced in *March of the Machine* (2023).
- Currently only one subtype exists: **Siege**.
- Cast during your main phase. You choose an opponent to be its "protector."
- Has **Defense Counters** instead of loyalty. Opponents (other than the protector) can attack it.
- When its defense counters reach 0, exile it - then cast its back face for free.

---

## Non-Permanent Types

### Instant
- Cast any time you have priority - including during opponent's turn, in response to spells, during combat.
- Resolves and goes to the graveyard.
- Most interactive cards (counterspells, combat tricks, removal) are instants.

### Sorcery
- Cast only during **your main phase** when the stack is empty.
- Resolves and goes to the graveyard.
- Usually more powerful than instants for the same cost due to timing restriction.

---

## Supertypes

- **Legendary** - Only one permanent with the same name per player at a time. If you have two, you must immediately put one in the graveyard. MTGA enforces this automatically.
- **Basic** - The five basic land types. No copy limit in decks.
- **Snow** - Matters for snow-specific cards and mechanics.
- **World** - Rare supertype. Only one World permanent can exist at a time across all players.

---

## Common Interaction Patterns

### Removal
Spells or abilities that deal with opponent's permanents. Key categories:

| Type | Example | Notes |
|---|---|---|
| Destroy | *Destroy target creature* | Stopped by Indestructible |
| Exile | *Exile target creature* | Bypasses Indestructible and graveyard triggers |
| Bounce | *Return target permanent to owner's hand* | Temporary but bypasses everything |
| -X/-X | *Target creature gets -3/-3* | Bypasses Indestructible; kills by reducing toughness to 0 |
| Sacrifice | *Target player sacrifices a creature* | Bypasses Hexproof; opponent chooses what to sacrifice |
| Counter | *Counter target spell* | Stops the spell before it ever resolves |

### ETB (Enters the Battlefield) Triggers
Many powerful cards have effects when they enter the battlefield. These are "triggered abilities" that go on the stack.
- ETB triggers still fire even if the creature is immediately removed - it already entered.
- ETB triggers can be exploited by "blinking" a creature (exiling it and returning it immediately).

### Death Triggers
Abilities that fire when a creature dies (goes from battlefield to graveyard).
- Death triggers do NOT fire when a creature is exiled instead of going to the graveyard.

### Sacrifice Synergies
- You sacrifice as a cost (can't be responded to) or as an effect.
- Works around Hexproof and Indestructible since the creature isn't being targeted or destroyed.

### Keyword Stacking
Multiple keywords on one creature stack independently.
- A creature with both **Deathtouch** and **Trample** - the 1 damage assigned to each blocker kills them (Deathtouch), so all remaining damage tramples through.
- A creature with **Lifelink** and **Double Strike** gains life from both damage steps.

### Aura Interaction Rules
- When you cast an Aura, it targets the permanent it will attach to.
- If that permanent becomes invalid (e.g. gains Hexproof after the Aura is cast but before it resolves), the Aura goes to the graveyard.
- If the enchanted permanent leaves the battlefield, the Aura goes to the graveyard (not back to hand).

### Equipment vs. Aura
| | Equipment | Aura |
|---|---|---|
| Card type | Artifact | Enchantment |
| Attaches via | Equip ability (sorcery speed, costs mana each time) | Cast as a spell (targets on cast) |
| If creature dies | Equipment stays on battlefield | Aura goes to graveyard |
| Can be moved? | Yes, for the equip cost | No - recast required |

---

## Tokens

- Tokens are permanents created by spells and abilities, not from your deck.
- They have all the characteristics defined by the effect that created them.
- If a token would leave the battlefield for any reason, it ceases to exist (doesn't go to graveyard, hand, library, etc.).
- Death triggers still fire when tokens die - they do hit the graveyard briefly before disappearing.
- Common tokens: Creature tokens (Soldiers, Insects, Spirits), Treasure, Food, Clue, Blood.

---

## Double-Faced Cards (DFCs)

- Cards with two faces. Transform between them based on conditions.
- The front face is the default. The back face is revealed when a transform condition is met.
- **Modal Double-Faced Cards (MDFCs):** You choose which face to play. Unlike transforming DFCs, MDFCs don't transform - you simply cast one side or the other.

> **MTGA note:** MTGA displays both faces. Click the card to see the back face. MDFCs show a toggle in the hand UI.

---

## Kindred (Formerly "Tribal")

- A card type that gives non-creature cards a creature subtype.
- Allows instants and sorceries to share a creature type for synergy purposes.
- Rare in practice but relevant for certain tribal decks.
