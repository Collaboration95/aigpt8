# Final demo review — Click (척하면 척), 25 Oct 2026

**Verdict: SHIP WITH TWO FIXES (about 45 min).** The story lands in under 7 minutes and the AI is visibly live. The lookup trace, the usual card and the Undo are strong. The game → picks → checkout loop now converges, and the dashboard before/after is convincing. Two things can still embarrass the team on stage: (P0-1) **Change** and **Don't use this** on the "✦ inferred" sheet fail on the live page, and (P0-2) the working tree has a half-finished dashboard that is broken right now.

Read-only review. The only file I wrote is this report. Evidence is in `/tmp/t8shots/review-final/`. All checks ran against the public URL (390×844 touch phone; 1440×900 laptop), each with a fresh sid.

## Scope and honesty notes
- **17 completed live `/api/turn` calls** plus 2 rejected with HTTP 400. That is over the ~15 budget; about 4 were my own selector mistakes. All were `source=live`.
- Ship it → receipt took 58 ms and Undo 84 ms. Neither calls the model (server order store).
- Not tested: a real iPhone, Back-navigation recovery, Redo, fallback/outage, cold-start fresh user, and Ship it in loop 2. I reached the King checkout card but did not tap it; it is the same component as loop 1.
- Git state during review: `main` @ `d1492e8`, with **uncommitted edits to `dashboard.html` and `taste.html` by another worker**. My loop-4 results are from the version served before that edit.

## Previous review (plans/review/demo.md): what is fixed
| Old finding | Now |
|---|---|
| P0 post-game finale loses meaning | **Fixed.** "Show me snacks under ₩20,000" returns 8 snacks, "✦ Tuned by your recent game picks", then one pick → Ship it. |
| P0 Change/Forget payload mismatch | **Half fixed.** Works on the `note_inference` pill (HTTP 200). **Still broken** on the ask_choice "✦ inferred" sheet (400). See P0-1. |
| P1 mosquito control scene unreliable | **Fixed.** Trace → King preselected → "✦ inferred" badge → "Why King?" sheet, in all 5 runs. |
| P1 reload/save restarts the screen | **Fixed.** Live reload is opt-in via `?dev=1`. |
| P2 "This option is getting ready" placeholder over the game | **Fixed.** Not seen. |
| P2 fresh user / fallback / phone Undo | Not re-tested. |

## The 5 loops
| # | Loop | Time (tap → UI ready) | Result | Screenshot |
|---|---|---|---|---|
| 1 | Toothpaste → trace → usual → Ship → receipt → Undo → Orders | trace 1.4 s, usual 2.7–3.9 s, receipt 0.06 s, Undo 0.08 s | **PASS**. Two oddities: the trace showed only `search_orders` in 1 of 2 runs; Orders ends on a greyed "Cancelled" card. | `l1-01-trace`, `l1-02-usual`, `l1-03-receipt`, `l1-05-orders` |
| 2 | Mosquito → trace → King ✦ → why sheet → Change / Don't use this | trace 1.9 s, choice 3.5–4.1 s, sheet 0.04 s, King → net 3.7 s | **FAIL on Change and Don't use this (400)**. The rest passes. | `l2-02-choices`, `l2-03-why`, `l2-04-change`, `l2-06-king-result`, `l2-08-pill-change` |
| 3 | Surprise me → game → result → picks → Ship with coins | game embed 2.9 s, 4 price rounds ~2.6 s each, picks ready ≲5 s | **PARTIAL**. The game works with real taps and +45 coins is awarded, but the reward screen is not visible and coins can't be spent (P1-2, P1-3). | `l3-01-embed`, `l3-03-result`, `l3-04-after` |
| 4 | Dashboard `?frame=1` Reset → Simulate → before/after + "How Click uses this" → Undo; `/taste.html` Play all | Simulate <1 s, Undo 1.5 s, Play all 8.6 s | **PASS on the committed version.** Broken in the current working tree (P0-2). | `l4-02-after-sim`, `l4-04-undo`, `l4-taste-02-after` |
| 5 | After game: "Show me snacks under ₩20,000" | trace 1.4 s, 8 picks 4.0–4.7 s, pick → Ship it card 3.4 s, ship 0.07 s | **PASS**. The picks mirror the game, "✦ Tuned by …" appears, and it converges to checkout. | `l5-01-picks`, `l5-02-after-pick` |

Latency: PITCH.md says "about 1.8 s per turn". User-visible time is **2.7–4.7 s**. The trace first appears at 1.4–1.9 s, which feels fast. Say "first lookup in under 2 seconds", not "1.8 s per turn". Nothing exceeded 5 s; the slowest was 4.6 s (pill Change).

## P0 — breaks the demo

**P0-1. "Change" and "Don't use this" on the ✦ inferred sheet fail on the live page.**
- Repro (twice, fresh sid): Mosquito net → tap "✦ inferred" → Change (or Don't use this).
- Result: HTTP 400. The feed shows "Shopping is temporarily unavailable. Try again" and the card is restored; "Try again" fails the same way. The sheet is the star of loop 2.
- Cause: `public/kit/questions.js:48` sends `{action:'change'|'forget', key}`. `app/llm/validate.mjs:30` (the `a.options` branch of `answer()`) only accepts one of the option values, so it throws `invalid-answer` before `app/llm/turn.mjs:52` can handle `forget/change`.
- Fix: at the top of `answer()` in `validate.mjs`, accept `{action in change|forget}` for any call that has a `preselect` and `because`, and set `label = 'Change King'` / `"Don't use King"`. `turn.mjs:52` already stores the fact as forgotten. Then the next turn must re-ask without the preselect (see P1-1). About 15 min.
- Fallback if unfixed: do not tap those two buttons on stage. Show only "Why King?", then tap another size or "Continue · King". The note pill **Change** after the product card works at the server (200), but it has its own problems (P1-1).

**P0-2. The dashboard is broken in the working tree right now.**
- The working tree has uncommitted rewrites of `app/public/dashboard.html` and `taste.html`. The new `dashboard.html:61` fetches `/api/segments`, which the running server does not serve (404).
- Result (`l4-dashboard-midedit.png`): "Loading shopper profile…", "Model request failed (404) · retrying automatically", and no before/after panel. It retries forever.
- The buttons also differ from the script: "Simulate snack game / Simulate drinks game", not "Simulate a snack lover game".
- Fix: either `git checkout app/public/dashboard.html app/public/taste.html`, or land `/api/segments` in `server.mjs` and restart. Then freeze. Re-run loop 4 once after the final state; I verified only the committed `d1492e8` version.

## P1 — hurts the story

**P1-1. After the pill "Change", the screen does not change anything.**
- The pill is the dark "✦ King · from bed sheet cover order" line under the product card.
- Tapping Change sends "Change King" and gets back the **same King nets** ("Side by side · For your request"). No other size is offered. The "Why this?" sheet also **stays open on top of the new result** (`l2-08`).
- Fix 1: close the dialog in the interceptor at `live.js:75` (`ev.target.closest('dialog')?.close()`).
- Fix 2: on `change`, force the next turn to `ask_choice` for that fact with the old value removed; add a one-line rule to `prompt.txt` and verify with one run.

**P1-2. Coins from one game can never be spent, so "Ship it with coins" cannot be demonstrated.**
- A Price guess game pays +45 coins. The checkout coin row is hidden unless the balance is ≥100 (`public/rewards.js:9`, server `rewards/routes.mjs:52` "multiples of 100").
- The code produced "Use 0 coins · −₩0" and hid the row, while the home pill showed 45 coins.
- Fix (5 min): grant at least 100 per completed game, or seed demo users at 100, or allow multiples of 10 at 1 coin = ₩2.

**P1-3. The reward moment is invisible.**
- Within ~2.5 s of the last round, the feed anchors to a new "Game complete" bubble, and the "+45 coins · Preferences updated" card is scrolled away.
- "Game complete" is also a user bubble the user never typed (`live.js:177`).
- Fix: keep the iframe result in view for ~2.5 s, or show a coin toast. Label the bubble "Done playing".

**P1-4. Snack photos are flat placeholders, which undercuts "real products".**
- The hero of "Your game picks" is a huge grey-green box labelled "Crown" (`l3-04`). All 8 snack picks in loop 5 look like this. The dashboard's real Pepero photos look good by comparison.
- Heuristic: 135 of 201 product JPGs are under 20 KB (placeholders); 17 of 24 snacks.
- Fix: reorder or filter so the snack picks put the Pepero / Koala / real-photo SKUs first, and cap picks at 4.

**P1-5. The inference line is duplicated.**
- In loop 2 the "✦ King · from your bed sheet cover order" line appears inside the card (`questions.js:19`) and again as a floating pill under it (a separate `note_inference`).
- Fix: in `live.js:75`, drop a same-turn `note_inference` whose `because` equals the in-card `preselect`.

**P1-6. Some lookups look decorative.**
- "Surprise me" and the snacks request show `search_orders · get_reorder_pattern` (refill timing for a game?). A sharp judge will ask.
- Fix: in `turn.mjs:21–37`, restrict the lookup tools per intent: no-intent → `get_preferences`; strong → `search_orders` + `get_reorder_pattern`; weak → `search_orders` + `check_bought_before`.
- Also: the trace collapses to "✦ Used: search_orders" and loses the evidence (e.g. "13 Sept"). Keep the first row's summary visible.

## P2 — polish
- **Tap target**: the "✦ inferred" badge is 61×17 px with 9 px text (`questions.js:185`). It worked with a real tap, but a finger on stage may miss. Make it ≥32 px tall, or make the whole selected card open the sheet.
- All three bed sizes show the **same net photo**, so Single/Queen/King look identical.
- Toothpaste hero photo is a tiny tilted thumbnail above a long dark slider bar. It looks unfinished next to the 56 px logo on Home.
- Loop 5 shows a pill "✦ Current request · from current request: Show me snacks…". This is system-speak. Hide `note_inference` whose source is the current request.
- Orders after Undo shows only a greyed "Cancelled" card. Show Orders before Undo, or Redo first (Redo exists but I did not test it).
- 404 `/api/segments` is a console error on the dashboard. `taste.html` button says "Play all 3" next to five persona cards.
- `/logos/` page: the phone-frame notch overlaps the title "Click — logo concepts".
- "Coupang" appears only in `logos/index.html`; no leftover debug text in the shopper flow. "Rocket · tomorrow 7am" is a deliberate Coupang nod; keep it.
- Laptop dashboard defaults to the `demo` sid. The phone game only appears on it if you open `?frame=1&sid=<phone sid>`. For the demo, use Simulate rather than linking.

## Top 5 improvements for ~1 hour of work
1. **Fix Change / Don't use this and make the follow-up visible (P0-1, P1-1, P1-5).** About 25 min. This turns the most Coupang-relevant control into an unmistakable "customer in control" moment.
2. **Freeze the dashboard (P0-2).** About 10 min. Also re-run loop 4 once on the final build.
3. **Make the coin reward land (P1-2, P1-3).** About 15 min. This makes "game → coins → cheaper checkout" a closed loop on stage.
4. **Real photos on the snack picks (P1-4).** About 10 min. Cap picks at 4 and reorder.
5. **Honest lookups (P1-6).** About 10 min. Per-intent lookup tools, and keep the evidence row ("Median Toothpaste x3 · 13 Sept") on screen.

## 6:45 run-of-show (phone mirrored; laptop only for the two dashboard beats)
Say the 척하면 척 line first, then keep the spoken lines tight. Use the exact PITCH.md technical lines.

| Time | Do | Say |
|---|---|---|
| 0:00 | Home. | "Click, 척하면 척: it gets you before you finish. Reorder my toothpaste. 척. Done." |
| 0:15 | Tap "Reorder toothpaste". Hold on the ✦ trace for 2 s. | "It already knows what you use. It looked up my orders, that's retrieval, not search. The LLM picks UI tool calls, 23 tools and 127 pre-built variants; it never writes UI code. The server checks every ID and price." |
| 0:50 | Ship it → receipt → Undo. | "One tap to reorder, and Undo if you change your mind." |
| 1:15 | Home → "Mosquito net". Hold on the trace. | "Weak intent. It checked my past purchases and found a King bed sheet cover from March." |
| 1:50 | Point at "✦ inferred" → "Why King?" sheet. Tap **Change** (only after P0-1 is fixed), pick Single → Ship it. | "✦ King, from your March bed order. Tap to see why, change it, or tell it not to use it. A correction becomes a confirmed fact that overrides memory." |
| 2:50 | Home → "Surprise me". Play 4 rounds, taps only. | "No intent. 30 seconds of play is 30 seconds of labelled data. Coins pay for finishing, not for particular answers, so the data stays unbiased." |
| 3:40 | Result with +coins → picks. | "Every tap trains your personal model. Now here's the before and after." |
| 4:00 | **Laptop** `/dashboard.html?frame=1` → Reset → Simulate a snack lover game. Show before/after and "How Click uses this". | "The preference model is a logistic regression with about 190 features, trained on 2,000 synthetic shoppers. Each tap is a gradient update, anchored to the prior so one tap can't swing everything." |
| 4:50 | Undo last. | "Undo replays the history exactly." |
| 5:05 | Phone: type "Show me snacks under ₩20,000"; point at "✦ Tuned by your game picks"; pick one → Ship it with coins. | "Closed loop: the updated model reranks the next shopping request. A discovery game becomes a sale." |
| 5:50 | Laptop `/taste.html?frame=1` → Play all (8 s) if time, else skip. | "Same model, different personalities. Play, pick, ship." |
| 6:10 | Close. | "Be honest: the prior is synthetic, the history is demo data, fulfilment is simulated. We haven't measured conversion uplift. 척하면 척: half a word is enough." |

If any step stalls for more than 6 s, say "Live model is slow — here is the recording" and cut to the local MP4. Never narrate the 400 error.
