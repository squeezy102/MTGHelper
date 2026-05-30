# MTG Glossary
> Focused on MTG Arena (MTGA). Tabletop differences noted where relevant.
> Source: Wizards of the Coast Official Comprehensive Rules & Keyword Glossary

---

## Game Zones

- **Hand** - Cards you're holding, not visible to opponents in tabletop (MTGA hides them automatically).
- **Library** - Your deck. You draw from the top.
- **Battlefield** - Where permanents (creatures, lands, artifacts, enchantments, planeswalkers, battles) live while in play.
- **Graveyard** - Discard pile. Cards go here when destroyed, discarded, or sacrificed. Both players can look at any graveyard.
- **Stack** - Where spells and abilities wait to resolve. Think of it like a to-do list that resolves bottom-up (last in, first out).
- **Exile** - A "removed from game" zone. Exiled cards generally can't be interacted with unless a card specifically says so.
- **Command Zone** - Used in Commander format only. Where your Commander lives when not on the battlefield.

---

## Core Concepts

- **Mana** - The resource used to cast spells. Generated mainly by tapping lands. Like currency in the game.
- **Mana Cost** - The cost printed in the top-right corner of a card. Shown as colored symbols and/or numbers.
- **Converted Mana Cost (CMC) / Mana Value** - The total numeric value of a card's mana cost. A card costing {2}{R}{R} has a mana value of 4. MTGA uses "Mana Value" in its UI.
- **Color** - Cards have one or more of five colors: White (W), Blue (U), Black (B), Red (R), Green (G). Determined by mana cost.
- **Colorless** - Cards with no color identity. Most artifacts and some spells. Not a fifth color - you cannot "choose colorless" when asked to pick a color.
- **Tap / Untap** - Tapping a card turns it sideways, indicating it's been used. Untapping restores it to upright. Most permanents untap at the start of your turn. In MTGA this is animated automatically.
- **Permanent** - Any card that stays on the battlefield: creatures, lands, artifacts, enchantments, planeswalkers, battles.
- **Spell** - A card while it's on the stack (being cast). Lands are NOT spells.
- **Resolve** - When a spell or ability finishes executing its effects.
- **Target** - A specific object or player that a spell or ability is aimed at. Must be chosen when the spell is cast.
- **Control** - You control what's on your side of the battlefield. Only you make decisions for things you control.
- **Owner** - The player whose deck a card came from. Relevant when cards change control.
- **Token** - A permanent created by a spell or ability, not from your deck. Disappears if it would go to any zone other than the battlefield.

---

## Card Anatomy

- **Type Line** - The middle of a card. Lists supertype, card type, and subtype. Example: "Legendary Creature - Elf Warrior"
- **Power / Toughness** - Bottom-right of creature cards. Written as P/T (e.g. 3/2). Power = damage dealt in combat. Toughness = damage needed to destroy it.
- **Loyalty** - Bottom-right of planeswalker cards. Starting loyalty shown when it enters. Increases/decreases as abilities are used.
- **Flavor Text** - Italicized lore text. Has no rules meaning.
- **Reminder Text** - Italicized rules text in parentheses explaining a keyword. Has no additional rules meaning beyond the keyword itself.

---

## Keyword Abilities (Creature)

- **Flying** - Can only be blocked by creatures with Flying or Reach. Like air superiority.
- **Reach** - Can block creatures with Flying, even without Flying itself. Think of a spider catching a bird.
- **Trample** - Excess combat damage carries over to the opponent. A 10/10 trampler blocked by a 1/1 deals 9 to the opponent.
- **Haste** - Can attack or use tap abilities the turn it enters. Most creatures have "summoning sickness" and must wait a turn - Haste bypasses this.
- **Deathtouch** - Any amount of damage this creature deals destroys the creature it damaged. Even 1 damage is lethal.
- **Lifelink** - Damage this creature deals also heals you for the same amount.
- **First Strike** - Deals combat damage before creatures without First Strike or Double Strike. Can kill a blocker before it fights back.
- **Double Strike** - Deals damage in both the First Strike step AND the normal combat step. Gets two swings.
- **Vigilance** - Does not tap when attacking. Can attack and still block on your opponent's turn.
- **Menace** - Must be blocked by two or more creatures, or not blocked at all.
- **Hexproof** - Cannot be targeted by spells or abilities your opponents control. Still vulnerable to board wipes that don't target.
- **Indestructible** - Cannot be destroyed by damage or "destroy" effects. Can still be exiled, bounced, or have toughness reduced to 0.
- **Defender** - Cannot attack.
- **Ward [cost]** - When this permanent becomes the target of a spell or ability an opponent controls, that opponent must pay the Ward cost or the spell/ability is countered.

---

## Keyword Abilities (Spell / General)

- **Flash** - Can be cast any time you could cast an instant (including on your opponent's turn or in response to something).
- **Flashback [cost]** - Can be cast from the graveyard by paying the Flashback cost instead of its mana cost. Exiled afterward.
- **Kicker [cost]** - Optional extra cost when casting. Grants additional effects if paid.
- **Cycling [cost]** - Pay the cost and discard this card to draw a new card. Never gets stuck in hand.
- **Equip [cost]** - Activated ability on Equipment artifacts. Attach to a creature you control. Can only be activated at sorcery speed (your main phase, nothing on stack).
- **Enchant [type]** - Found on Aura enchantments. Specifies what the Aura attaches to (e.g. "Enchant Creature").

---

## Actions

- **Cast** - Play a spell by paying its cost. Goes on the stack.
- **Activate** - Use an activated ability (format: [cost]: [effect]).
- **Attack** - Declare a creature as an attacker during your combat phase.
- **Block** - Declare a creature to intercept an attacking creature.
- **Sacrifice** - Move a permanent you control to the graveyard as a cost or effect.
- **Destroy** - Move a permanent to the graveyard. Indestructible prevents this.
- **Exile** - Remove a card from the game entirely (to the exile zone).
- **Bounce** - Return a permanent to its owner's hand. Informal term, not official.
- **Counter** - Cancel a spell or ability on the stack, sending it to the graveyard without effect. Cannot counter a land.
- **Draw** - Take the top card of your library and add it to your hand.
- **Discard** - Move a card from your hand to your graveyard.
- **Search** - Look through a zone (usually your library) for a card meeting criteria. You must shuffle your library after searching it.
- **Scry [N]** - Look at the top N cards of your library, then put any number on the bottom and the rest back on top in any order.
- **Surveil [N]** - Like Scry, but cards go to the graveyard instead of the bottom of your library.
- **Mill [N]** - Put the top N cards of a library into the graveyard.

---

## Turn Structure Terms

- **Upkeep** - Early part of your turn before drawing. Many triggered abilities fire here.
- **Draw Step** - You draw one card. Skipped on your very first turn if you go first (in MTGA this is handled automatically).
- **Main Phase** - When you can play lands and cast most spells (sorceries, creatures, artifacts, enchantments, planeswalkers).
- **Combat Phase** - Attack with creatures. Broken into: Beginning of Combat, Declare Attackers, Declare Blockers, Combat Damage, End of Combat.
- **Second Main Phase** - Another main phase after combat. Good for playing cards you wanted to save until after attacking.
- **End Step** - End of your turn. Triggers fire, then you discard down to 7 cards if you have more (hand size limit).
- **Priority** - The right to cast spells or activate abilities. Active player gets priority first. Both players must pass for anything to resolve.

---

## Counters (The Other Kind)

> "Counter" has two meanings in MTG - don't confuse them.

- **Spell Counter** - To "counter a spell" means to cancel it.
- **+1/+1 Counter** - A marker placed on a creature increasing its power and toughness by 1 each.
- **-1/-1 Counter** - Reduces power and toughness. A 2/2 with a -1/-1 counter is a 1/1.
- **Loyalty Counter** - Tracks a planeswalker's loyalty. Hits 0 = planeswalker dies.
- **Other Counters** - Cards may use named counters (poison counters, time counters, etc.) with specific rules.

---

## Supertypes

- **Legendary** - Only one copy of each legendary permanent with the same name can be controlled by the same player at once. If you have two, you must immediately put one in the graveyard (your choice). In MTGA this is enforced automatically.
- **Basic** - Applied to the five basic land types: Plains, Island, Swamp, Mountain, Forest. No limit on copies in a deck (unlike the normal 4-copy rule).
- **Snow** - A supertype for cards that interact with snow mechanics.

---

## MTGA-Specific Terms

- **Wildcard** - MTGA currency used to craft any card of the matching rarity (Common, Uncommon, Rare, Mythic Rare).
- **Mastery Pass** - Seasonal battle pass in MTGA granting cosmetic and card rewards.
- **Alchemy** - MTGA-exclusive format with digital-only card rebalancing. Cards marked "A-" are Alchemy versions.
- **Draft Token** - MTGA item allowing entry into a Draft event.
- **Bo1 / Bo3** - Best of 1 or Best of 3. Bo3 allows sideboards. Most ranked play is Bo1 by default in MTGA.
- **Sideboard** - Up to 15 cards outside your main deck. Swapped in between games in Bo3.

---

## Common Shorthand (Community Terms)

- **ETB** - "Enters the Battlefield." Used to describe triggered abilities that fire when a permanent comes into play.
- **LTB** - "Leaves the Battlefield."
- **CMC** - Converted Mana Cost (now officially called Mana Value, but CMC is still widely used).
- **Cantrip** - A spell that replaces itself by drawing a card. Example: a 1-mana spell that also says "draw a card."
- **Removal** - Any spell or ability that destroys, exiles, bounces, or otherwise eliminates an opponent's permanent.
- **Boardwipe / Wrath** - A spell that destroys or exiles all (or most) creatures. Named after the classic card *Wrath of God*.
- **Ramp** - Cards or strategies that accelerate mana production beyond one land per turn.
- **Value** - Getting more out of a card or play than expected. A creature that draws a card when it dies is "value."
- **Tempo** - Gaining an advantage in time/initiative. Bouncing an opponent's creature to slow them down is a tempo play.
- **Go Wide** - Strategy of creating many small creatures to overwhelm through quantity.
- **Go Tall** - Strategy of making one or few creatures very large.
- **Curve** - Short for "mana curve." The distribution of mana costs in your deck. "Curving out" means playing a card each turn efficiently (1-drop turn 1, 2-drop turn 2, etc.).
