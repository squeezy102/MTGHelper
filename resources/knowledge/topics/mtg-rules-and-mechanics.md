# MTG Rules & Mechanics
> Focused on MTG Arena (MTGA). Tabletop differences noted where relevant.
> Source: Wizards of the Coast Official Rules (magic.wizards.com/en/rules)

---

## Starting the Game

- Each player starts at **20 life**.
- Each player draws **7 cards** to form their opening hand.
- If unhappy with your hand, you may take a **mulligan** - shuffle it back, draw one fewer card, then put that many cards from your new hand on the bottom of your library. You may mulligan as many times as you like. MTGA automates this process.
- A coin flip or die roll determines who goes first. The first player **skips their draw step on turn 1**.
- **Winning:** Reduce your opponent's life to 0, make them draw from an empty library, or meet a card-specific win condition (e.g. *Thassa's Oracle*).

---

## Turn Structure (In Order)

### 1. Beginning Phase
- **Untap Step** - All your tapped permanents untap. No player can cast spells here.
- **Upkeep Step** - Triggered abilities that say "at the beginning of your upkeep" fire here. Players can respond.
- **Draw Step** - You draw one card. Players can respond after the draw.

### 2. First Main Phase
- Cast spells, play a land (one per turn), activate abilities.
- Sorceries, creatures, artifacts, enchantments, and planeswalkers can all be played here.
- Instants and activated abilities can be used at any time either player has priority.

### 3. Combat Phase
*(See Combat section below)*

### 4. Second Main Phase
- Same as First Main Phase.
- You cannot play a second land if you already played one this turn.
- Good for playing cards after seeing what your opponent did during combat.

### 5. Ending Phase
- **End Step** - "At the beginning of the end step" triggers fire. Both players can cast instants.
- **Cleanup Step** - Discard down to 7 cards if you have more. Damage is removed from creatures. Most "until end of turn" effects wear off. Players generally cannot cast spells here unless a trigger fires.

---

## The Stack

The stack is how MTG handles multiple spells and abilities happening at once. Think of it like a stack of plates - the last thing added resolves first.

**How it works:**
1. A player casts a spell or activates an ability - it goes on the stack.
2. Both players get a chance to respond (add more spells/abilities to the stack).
3. When both players pass priority without adding anything, the top item resolves.
4. Repeat until the stack is empty.

**Key rules:**
- Spells resolve one at a time, last-in first-out.
- You can respond to your own spells.
- Mana abilities (like tapping a land) don't use the stack - they're instant.
- Once a spell starts resolving, it's too late to counter it.

> **MTGA note:** MTGA manages the stack automatically. The "Priority" system in MTGA settings controls when the game pauses to let you respond. Adjust these settings to gain more control over when you can interact.

---

## Combat (Detailed)

### Step 1 - Beginning of Combat
- Triggered abilities that say "at the beginning of combat" fire here.
- Last chance to tap or remove opponent's creatures before attackers are declared.

### Step 2 - Declare Attackers
- Active player chooses which creatures attack (and who/what they attack in multiplayer).
- Attacking taps the creature unless it has Vigilance.
- Creatures with Summoning Sickness (entered this turn without Haste) cannot attack.

### Step 3 - Declare Blockers
- Defending player assigns blockers. Any untapped creature can block.
- One attacker can be blocked by multiple creatures.
- One creature can only block one attacker (unless it has an ability saying otherwise).
- If multiple creatures block one attacker, the attacking player assigns damage order among blockers.

### Step 4 - Combat Damage
- Creatures deal damage equal to their power simultaneously.
- A creature with damage equal to or greater than its toughness is destroyed (goes to graveyard).
- Unblocked attackers deal their damage directly to the opponent (or planeswalker being attacked).
- **First Strike / Double Strike** create an extra damage step before normal combat damage.

### Step 5 - End of Combat
- "At end of combat" triggers fire. Combat is over.

**Key combat rules:**
- You must attack with a creature if it's forced to (e.g. Goad).
- You don't have to block - taking damage is a valid choice.
- Once blockers are declared, killing the blocker doesn't make damage go to the player (unless the attacker has Trample).

---

## Mana & Costs

- **Basic mana types:** White (W), Blue (U), Black (B), Red (R), Green (G), Colorless (C).
- **Generic mana ({1}, {2}, etc.)** can be paid with any color of mana.
- **Mana pool** is the temporary pool of mana you've produced this turn. Unused mana empties at the end of each step and phase.
- **Tapping a land** is the primary way to add mana. Most lands produce one mana per tap.

### Paying Costs
- You must pay the full cost of a spell to cast it.
- **Additional costs** (like sacrificing a creature) must also be paid.
- **Alternative costs** replace the normal mana cost (e.g. Flashback, Foretell).
- **Reduction effects** lower the cost (e.g. "This spell costs {1} less to cast").

---

## Triggered, Activated, and Static Abilities

### Triggered Abilities
- Begin with "When," "Whenever," or "At."
- Fire automatically when their condition is met and go on the stack.
- Example: "When this creature enters the battlefield, draw a card."

### Activated Abilities
- Written as [Cost]: [Effect].
- You choose to activate them. Go on the stack.
- Example: "{T}: Add {G}" (tap this land to add one green mana).
- Most can be activated any time you have priority. Some are restricted (e.g. "only as a sorcery").

### Static Abilities
- Always "on." Don't use the stack, don't trigger.
- Example: "Creatures you control get +1/+1." That buff is always there as long as the card is in play.

---

## State-Based Actions

These are automatic rules checks the game performs constantly, without using the stack. MTGA handles all of these automatically.

- A creature with 0 or less toughness dies.
- A creature with damage equal to or greater than its toughness dies.
- A planeswalker with 0 loyalty dies.
- A player with 0 or less life loses.
- A player who must draw from an empty library loses.
- The Legendary rule (two of the same legendary = one must go).
- Auras/Equipment fall off if the permanent they're attached to leaves the battlefield.

---

## Replacement Effects

Some effects replace how something happens rather than responding to it. They use the word "instead."

- Example: "If a creature would die, exile it instead." (The creature never goes to the graveyard.)
- Replacement effects are not triggered abilities - they don't use the stack and can't be responded to.
- Multiple replacement effects can apply to the same event; the affected player or controller chooses the order.

---

## Special Rules: Instants vs. Sorceries

| | Instant | Sorcery |
|---|---|---|
| When can you cast it? | Anytime you have priority | Your main phase only, stack empty |
| Stays on battlefield? | No - goes to graveyard | No - goes to graveyard |
| Can respond to opponent? | Yes | No |

> **Tip:** Cards with Flash can be cast like instants even if they're creatures or other card types.

---

## Special Rules: Lands

- Lands are **played**, not cast. They don't go on the stack and can't be countered.
- You may play **one land per turn** during your main phase.
- Lands don't cost mana to play.
- Basic lands (Plains, Island, Swamp, Mountain, Forest) produce one mana of their color.
- Nonbasic lands may produce multiple colors, enter tapped, or have other abilities.

---

## MTGA-Specific Mechanics (Digital Only)

These keywords only exist in MTGA's Alchemy and Historic Alchemy formats:

- **Seek** - Randomly find a card from your deck meeting certain criteria. No player choice involved.
- **Conjure** - Create a card (that may not be in your deck) and put it into your hand, library, or battlefield.
- **Perpetually** - Permanently changes a card's characteristics even if it changes zones (e.g. "This card perpetually gets +1/+1").
- **Spellbook** - A curated list of cards. A spell may let you "discover" or select from its Spellbook.

> These mechanics do not exist in tabletop Magic.

---

## Priority: When Can You Act?

Priority is the right to cast spells or activate abilities. You must have priority to do anything.

- The active player (whose turn it is) gets priority first at the start of each step/phase.
- After each spell or ability is added to the stack, the active player gets priority again.
- When both players pass priority in succession, the top of the stack resolves (or the phase advances if the stack is empty).

> **MTGA tip:** Use the "Stop" settings (the gear icon during a match) to control when MTGA automatically passes priority for you. Turning on stops at key phases lets you hold up interaction (like a counterspell) on your opponent's turn.
