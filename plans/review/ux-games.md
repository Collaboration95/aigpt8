# UX review: games flows (390x844, iPhone, touch)

**Verdict:** All 5 games play through to a result with real taps and zero JS errors, and the standalone games feel polished. The weak points are the Surprise-me embed (placeholder text, game appears dimmed and timed-out unplayed), recommendations that ignore the game just played, and a dashboard that is a 5,700px desktop-style scroll. Fix P0/P1 before the demo.

Method: Playwright 390x844 DPR3, touch, sid `ux-games-1/2/3` (not `demo`). 2 `/api/turn` calls used (Surprise me). Shots in `/tmp/t8shots/ux-games/`. Page errors: none; one console 404 on the home→live load (resource unidentified, harmless).

## Tap counts
- Surprise me: 1 tap (home) → auto game. Rapid fire 4 taps → "Game complete" → picks carousel → Pick this. ~6 taps to a product.
- /games.html: Rapid 10 taps, Swipe 8, Bracket 7, Price guess 5 x (slide + Lock in) = 10, Budget ~4-5 selections + Done. Then Ship it = 1 tap, shows "Order placed" + "Track order →". Intent → order: 9–16 taps.

## P0 — broken / demo-risky
1. **Recommendations are unrelated to the game just played.** Rapid fire (snacks/drinks) → picks: laundry detergent 3L, King bed frame ₩289,000, laundry 2L. Swipe (8 snacks/drinks) → detergent 1L, clothes pegs, detergent 2L. Price guess → Pocari, King bed frame, blackout curtain. A judge will see "you liked snacks, here's a bed frame". Cause: picks are the top of the demo buy-intent model (history prior from Guru's 4 orders), not game-weighted. `games.html:378` `learn()`. Screens: `13-rapid-result.png`, `21-swipe-result.png`, `13-price-result.png`. Fix: blend the model score with game-tag affinity (boost items sharing tags/category with items liked), or restrict picks to the played category plus at most one "from your history" slot, labelled. Cap the ₩289,000 bed frame out of game picks.
2. **Ship it total is absurd for a game.** "Ship it · ₩310,800" / "₩325,800" after a ₩1,500 snack game. One tap spends ₩300k. Fix: picks capped at a sane price (e.g. ≤₩30k), or total only counts the 1–2 items liked.

## P1 — hurts the demo
3. **Surprise-me embed shows placeholder text:** "This option is getting ready." above the game (`live.js:58`, `play_game` is not in `KIT.tools()`, so the fallback `status-card` renders and the iframe is appended beneath it). Hide the status card when the iframe path is taken (`node.remove()` or skip render). Shot: `02-surprise-2.png`.
4. **Embedded game renders dimmed (provisional + inert) and times out unplayed.** In my 20 s run with no taps the Rapid fire frame was ghosted (opacity ~.5) and ran out its timer to "Game complete" without anyone interacting. `wrapper.inert = true` at `live.js:56` stays until commit, and the timer keeps running while inert. Either don't start the game timer until the wrapper is committed/interactive, or lift inert for `play_game`. Check on a phone that the first tap actually registers.
5. **Embedded Rapid fire is only 4 rounds and the iframe leaves ~500px of empty gradient** below the buttons (`02-surprise-1.png`): card has `min-height:620px` (`games.html` `.card`) while content ends at ~y=1290/2000. Make the embedded card height auto.
6. **Result screen is long; Ship it is at the bottom edge** (`13-rapid-result.png`, button at y≈1915/2000, partly under the fold) and the page does not scroll to it. Result also stacks coins/streak, learned chip, a model table, 3 picks, then Ship it. Fix: put Ship it sticky at the bottom (safe-area aware), and shorten the model table to 1 line + "View engine ↗".
7. **Model table copy is debug-ish:** "Buy-intent · demo model", "synthetic prior · live game learning" (lowercase, no spacing, reads like a log line). Rename "Your picks · likelihood", drop the second line from the consumer result; keep it for the dashboard.
8. **Product art quality is uneven in the games** (the worst thing at a glance):
   - Cartoon placeholder bags/bottles next to real photos in one grid: Haitai chips, Dongwon, Maxim coffee, Pocari (`11-basket-start.png`, `12-price-mid.png`, `02-surprise-2.png`). Violates "real photos".
   - Blurry, dark, hand-held snapshots: Aloe vera, Vaseline, Pepero White Cookie with a girl-group photo card (a Pepero pack shot is rotated 90° in `11-rapid-start`). Pick the best photos for games or filter games to a vetted set.
   - Same detergent photo for 4+ different SKUs in Budget (1L, 2L, 3L, "refill"); Budget grid looks repetitive.
9. **Dashboard is a 5,758px page** with desktop styles (`dashboard.html`, `@media(min-width:1000px)` blocks; mobile gets a stacked version). Hero text wraps badly: "Preference engine / live demo" breaks to 2 lines in the nav; the summary card is 6 lines of 26px text (`30-dash-top.png`). The proof ("before 26.1% → 64.3%") only shows ~1700px down (`32-dash-1700.png`). Fix for mobile: put the before→after hero picks (`#hero-picks`) right under the title, collapse the summary text to 2 lines, and fold "What the model learned/coefficients/timeline" behind "Explain" toggles.
10. **The proof looks uniform, not preference-specific:** after 8 swipes, every home item gets about +38pp (64.5, 64.3, 63.9, 63.4). The story "you liked snacks → snacks went up" is not visible; the top is detergent and pegs. Same root cause as #1; the dashboard should show a snack-category lift beside a flat/decreasing non-snack item.

## P2 — polish
11. Tabs row clips on the right ("Price guess" half-hidden with a fade) — fine as a scroll affordance, but the 5th tab (Budget) is only reachable by scrolling; consider 2 rows or `scroll-snap`. (`games.html` `.tabs`, 48px tall, fine.)
12. `.logo` link in games header is 94x22 (<44px tap height); dashboard `.logo` is 100x36; dashboard "Explain this prediction"/rank buttons are OK, but 16x16 anchors `#3 #6 #8` (evidence links in the summary card) are far below 44px. Pad or hide on mobile.
13. "Guru · demo profile · choices saved" under the tabs is shown in every game and meaningless to a customer; show only on `?debug`.
14. Swipe uses ✕/♥ buttons (72px, good) — but there's no visible drag hint; stamps exist, add a one-time "Drag or tap" hint.
15. After Ship it, the page scrolls so the tab bar is half out of view (`23-after-ship.png`). Keep scroll where the button was, or scroll to top of the card. I also did not see an Undo after "Order placed" (rule: one-tap Ship it with Undo) — only "Track order →"; verify Undo exists in the 5s window.
16. Orders: games order shows `T8-409a0cbb` ref and "Demo orders · simulated delivery" — fine for judges, but the total ₩21,700 vs ₩310,800 on the CTA in other runs shows #2 is real: items differ run to run.
17. Embedded "Preferences updated / Back to shopping" bridge screen (`games.html:403`) is bare — flashes before the picks carousel appears; replace with a "Connecting the dots" tile consistent with the host (the host already shows that tile, `02-surprise-5.png`).

## Game ranking (visual similarity)
- **Too similar:** *Rapid fire* and *Swipe* — both: one product card, big image, name, price, emoji/✕♥ buttons, counter pill. Differences are cosmetic (3 emoji buttons + timer bar vs 2 round buttons). *Price guess* and *Budget* share the same pink/yellow gradient and money framing. If cutting, drop Swipe (Rapid fire already says "want/nope") or make Swipe real drag with stacked cards.
- **Feel best:** 1) **Price guess** — unique interaction (big ₩10,000 number + slider, reveal "Spot on/Close"), strong haptic-like pop, clear stakes. 2) **Bracket** — "VS" cards with real photos and 7 progress dots read as a different game at a glance. 3) Rapid fire (timer bar creates urgency; best for the live embed). Budget is fun but its grid is the longest and shows the worst art.

## What's already good (keep)
- No horizontal overflow on any game or the dashboard (scrollWidth 390); all game CTAs/buttons are ≥44px (Lock in 54px, ✕/♥ 72px, tiles large).
- Games feel like games: pop animations, confetti, coins/streak, chunky shadows, bold colour per game; transitions are smooth, no jank seen.
- Price guess slider thumb is 40px with large hit area; works with touch.
- Result → Ship it → "Order placed" → "Track order" → Orders page works end to end; Orders shows Preparing timeline and Real photos/Fun art toggle.
- Embedded Rapid fire → "Connecting the dots / Using your context…" → "Your surprise picks" carousel is a good funnel story; carousel has the peek of the next card as a swipe cue.
- Dashboard concept is persuasive: Guru vs Fresh user toggle, "Reset to before", before/after bars with pp deltas, evidence links back to events.
