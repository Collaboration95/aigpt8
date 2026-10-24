# Surprise-me mini-games: ideas

> Update 25 Oct: Blind box (gacha) was removed from games.html at the user's request. The favourites are Price guess and Rapid fire. Rewards plan: REWARDS.md.

Goal: no-intent discovery that is fun, fills the cold start, and ends in personalised picks plus one-tap "Ship it".
Effort: S = under 1h, M = 1-3h, L = 3h+. Prototypes in `games.html` are marked **[built]**.

| # | Game | Mechanic | Signal captured | Why it's fun | Demo wow | Effort |
|---|------|----------|-----------------|--------------|----------|--------|
| 1 | **Swipe deck [built]** | Tinder-style cards, fling right to love, left to pass | Taste by tag, price band, novelty | Muscle-memory, zero thinking | Fling physics, LOVE/NOPE stamps | M |
| 2 | **Blind box [built]** | Spin wheel picks a category, shake and open a gift box, keep or skip | Category interest, novelty (Rare keeps), price | Gacha reveal dopamine | Wheel plus lid-pop plus rarity | M |
| 3 | **Price guess [built]** | Slide to guess the price, see the real one, then "Worth it" or "Pass" | Price sensitivity, value perception | Mini quiz, "I knew it!" | Count-up reveal, verdict badge | M |
| 4 | **Budget basket [built]** | Fill a basket with a ₩30,000 cap | Planner vs impulse, category mix, price band | Constraint puzzle | Live meter, blocked overspend shake | M |
| 5 | **Bracket [built]** | 8 items in 7 head-to-heads, crown a champion | Strong taste ranking, aesthetic | Sports-bracket tension | Champion confetti | M |
| 6 | **Rapid fire [built]** | 2.6s per product, react Nope/Meh/Want | Impulse vs planner (reaction time), gut taste | Pressure, speed | Timer bar | S |
| 7 | Scratch card | Scratch 3 foil cards to reveal items | Novelty, category interest | Tactile | Foil particles | M (needs touch capture) |
| 8 | Would-you-rather bundles | Pick between two bundles ("Coffee + snack" vs "Candle + plant") | Lifestyle, bundle affinity | Debate-able | Bundle art | S |
| 9 | Hot-or-cold sliders | Tune sliders (spicy, cute, premium, trendy) with a live product preview | Explicit attribute weights | Feels like a character creator | Live product morph | M |
| 10 | Daily drop streak | One surprise drop a day, keep a streak | Retention, compounding context | Habit loop | Streak flame | S UI, L for real use |
| 11 | Habit bingo | 3x3 grid, tap what you did this week | Routines (replenishment, pets, fitness) | Quick self-expression | Bingo line burst | S |
| 12 | Stack the cart | Physics toy, stack items to a line | Item sizes, household shape | Toy-like | Falling bodies | L |
| 13 | Brand duels | Logo vs logo, 6 rounds | Brand loyalty, private label openness | Fast | Low (logos) | S |
| 14 | Shopper-type quiz | 5 questions, output a persona card | Segment, shareable identity | Personality-test hook | Shareable card | S |
| 15 | Gift for a friend | Persona card ("gym-bro cousin"), pick a gift | Proxy tastes, gifting occasions | Playful roleplay | Gift wrap animation | M |

## Ranking

Score = signal richness x demo wow / effort.

1. **Swipe deck**: the richest signal per second, instantly understood by judges, and the fling physics sells polish.
2. **Blind box**: the strongest "surprise me" fit, it exposes the long tail (Rare / Hidden gem) and measures novelty-seeking.
3. **Budget basket**: the only game that shows planner vs impulse and price band with a real constraint, and it maps directly to the checkout total.
4. **Price guess**: a distinct signal (price sensitivity) that the swipe deck can't capture, and the "Worth it" tap gives a true willingness-to-pay data point.
5. Bracket: strong taste ranking, but similar in feel to this-or-that.
6. Rapid fire: cheap, adds reaction-time impulse signal.

## Recommended demo lineup

Lead with **Swipe** (cold start in 20s), then **Blind box** (long-tail discovery), then **Budget** (customer control), and use **Price guess** as the alternate. Keep Bracket and Rapid fire as extras.

Every game ends in the same result: Learned chips, 3 picks (at least one Hidden gem) and a "Ship it · ₩total" button.

## Notes

- Compounding: chips from each game add to one profile, so a second game starts with picks already tuned. The prototype keeps the profile per game, so the integration owner would merge weights.
- `?game=<id>` deep-links (swipe, gacha, price, basket, bracket, rapid). `window.demoPlay(id)` auto-plays to the result in about 3s.
