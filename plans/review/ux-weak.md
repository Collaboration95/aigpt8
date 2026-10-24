VERDICT: REVISE — no P0 observed. Scripted mosquito is the clearest context demonstration; live correction can reinstate the wrong default. Camping completes but misses the real-product requirement.

Reviewed 25 Oct 2026 at HEAD `a06527e178965f7c9e05bd6d2d4837a5106de583`. Read PLAN.md, ARCHITECTURE.md, HANDOFF.md and existing llm.md, ml.md, demo.md reviews. Read-only application pass: only this report written; no source edits, commits, service changes or GitHub access.

## Prioritised findings

### 1. P1 — A size correction resets the first-turn guard and reinstates King

- **Location:** `app/llm/turn.mjs:34`, `app/llm/validate.mjs:26`, `app/llm/turn.mjs:14`.
- **Observed:** Home composer → “Mosquitoes keep biting me at night” → Bed net → “Actually this is for a Single bed. Compare single bed mosquito nets.” The model emitted Single-bed picks, then a Single-bed comparison on repair. Both were reset; the committed result was “Scripted fallback” followed by a preselected **King net**, two “Alternative” cards, and the old Mar-bed reason.
- **Mechanism:** category-bearing typed text resets `session.turn=0`; the next generation is treated as mosquito turn 1. Batch validation requires a grounded preselection, rejects the requested comparison with `grounded-preselection-required`, and fallback explicitly selects King from seeded memory. This is a correction-specific failure beyond the unmatched-category goal-retention case in llm.md finding 2.
- **Consequence:** the most important customer-control moment visibly contradicts the customer. The provenance line makes the wrong result appear justified by history.
- **Evidence:** `/tmp/t8shots/ux-weak/04-live-correction-compare.png`; `turns.json`, request 3, records both provisional generations, resets, fallback reason and final King choice. No outage or synthetic response was injected.
- **Fix:** classify same-task correction separately from new intent; store the explicit Single constraint and supersede the bed default before retrieval/validation. Apply approach-preselection requirements only to a genuinely new approach question. Fallback must honor the corrected size or ask, never silently restore King.

### 2. P1 — Camping ignores real-photo mode and sells generated, unbranded kit items

- **Location:** `app/public/camping.html:523`, `app/public/camping.html:537`, `app/public/camping.html:552`, `app/public/camping.html:557`.
- **Observed:** with `CATALOG.mode() === 'real'`, Dome/Tunnel comparison and the completed kit use illustrations. Kit has zero `<img>` elements and no brands. Items include “Sand Dome Tent”, “Olive Sleeping Bag -5°C” and “Stone Trail Pack”; Too pricey creates “Lite” products by multiplying prices by .75. Checkout uses slot IDs such as `camp-tent`, rather than selected catalogue SKUs.
- **Consequence:** the secondary flow looks polished but stops demonstrating evaluation of actual products. The shopper cannot tell which branded item the illustrated kit would order; the Orders photo toggle cannot govern this rendering path.
- **Evidence:** `/tmp/t8shots/ux-weak/21-camping-tents.png`, `22-camping-kit.png`, `23-camping-cheaper.png`. Initial total ₩287,800; cheaper total ₩245,900.
- **Fix:** bind each kit slot and swap to an existing catalogue ID; use catalogue brand/photo/price and the common real/fun renderer. Keep illustrated environments and question artwork. Cheaper should select a cheaper SKU with its actual fixture price.

### 3. P2 — The subtle source controls are undersized and become unreadable as controls after advancing

- **Location:** `app/public/mosquito.html:45`, `app/public/mosquito.html:50`, `app/public/mosquito.html:212`; `app/public/ai.js:2`.
- **Observed:** Bedroom/Living and No/Yes controls are approximately **40px** high; source chips are **24.8px** high. “✦ Aug baby monitor order” looks like a static badge, with no expansion cue. Tapping it reveals only “From your Aug baby monitor purchase”. After choosing Net or correcting Baby to No, previous source buttons are disabled, so scrolling back cannot open their explanations.
- **Context judgement:** the adjacent selected answers make the scripted inference understandable without a large narration card. The small badge treatment is worth keeping, but low visual weight should not mean a small touch area or inaccessible provenance.
- **Evidence:** `/tmp/t8shots/ux-weak/10-scripted-compare.png`, `11-scripted-context-expanded.png`, `12-scripted-size.png`, `16-scripted-baby-correction.png`; frozen-source disabled states in `metrics.json`.
- **Fix:** use ≥44px hit areas while retaining compact text; add a small chevron or info affordance. Freeze answer-changing controls but allow read-only source expansion on historical blocks. Show the inferred value beside its source, e.g. “King · Mar bed order”, and label expanded source detail as demo history.

### 4. P2 — Camping spends five turns collecting defaults and loses its memory explanation immediately

- **Location:** `app/public/camping.html:461`, `app/public/camping.html:501`, `app/public/camping.html:505`, `app/public/camping.html:620`.
- **Observed:** Weather → Vibe → Style → Crew → Look all require an answer before any kit. Autumn is marked “Now”, but its “Season · from today's date” explanation exists only in the disappearing thinking state. No persistent source line remains beside that default or on the kit. The attractive route map and question progress repeat the same five-stage journey.
- **Consequence:** the secondary weak-intent flow feels like a five-page configurator; memory does little observable work. The shopper must confirm even the seasonal default before seeing a recommendation.
- **Evidence:** `/tmp/t8shots/ux-weak/20-camping-weather.png`, `22-camping-kit.png`. Seven action taps to purchase on the direct path; eight with Too pricey. These counts include intent Send and Ship it, excluding typing/focus/scroll.
- **Fix:** show an initial kit using a small persistent “Autumn · today's date” line, then ask only material unresolved constraints such as crew. Make look/style optional edits with a direct “Use these defaults” route. Preserve the lively scenes and short choices.

### 5. P2 — Camping purchase and Undo never become user bubbles

- **Location:** `app/public/camping.html:393`, `app/public/camping.html:408`, `app/public/camping.html:589`.
- **Observed:** actual Ship it and Undo taps update the kit in place, but the conversation's last bubble remains “Too pricey”. Bubble list before and after Undo is identical. Answer and feedback taps do create bubbles.
- **Consequence:** the transcript omits the most consequential customer actions, violating the every-tap rule and making the in-place purchase/cancellation harder to follow when scrolling back.
- **Evidence:** `/tmp/t8shots/ux-weak/24-camping-receipt.png`; interaction output recorded during the pass. Receipt exists, but no Ship it bubble precedes it.
- **Fix:** append canonical “Ship it” and “Undo order” bubbles, then show the resulting receipt/cancellation without disabling Undo or losing the current kit.

## Context assessment and existing findings

Live initial output was a three-way approach choice with a small “✦ because From your Mar bed purchase · demo order” footer. It had no explicit King value or separate context tool. Scripted output placed provenance directly beneath the room/baby defaults and alongside the bed-size picker, which communicated the inference more clearly.

Use existing **demo.md findings 2–3** for live inference-control contract/availability, **demo.md finding 8** for scripted suitability claims, and **demo.md finding 1** for checkout convergence. Do not count them again as new findings here. This pass also encountered comparison repetition after selecting Single twice; an explicit purchase instruction was needed to reach checkout.

## What's already good (keep)

- Scripted mosquito: selected Bedroom/Yes and the Mar-bed source are adjacent to the controls they explain. King → Single appends a “Single” bubble, replaces the active product and updates ₩29,900 → ₩15,900. Baby → No removes that source badge and reorders the options.
- Main mosquito scene has strong hierarchy, readable prices, generous product cards and a clear red Ship it button. Real net photographs are sharp enough in the sampled cards.
- Live initial Bed net selection reaches a purchase surface in one continuation. Live Single purchase produced a server demo receipt; Undo produced “Order cancelled”. Both scripted flows also purchased and undid successfully.
- Camping's question artwork, progress, selected states, cheaper-price deltas and large kit actions are visually coherent. Each question appends a short answer and freezes the previous selection.
- No horizontal document overflow in measured 390px layouts. No JavaScript page errors captured. The live composer clears and blurs after Send; appended turns were readable with ordinary scrolling.

## Run record, limits and next action

- Used the required `/tmp/t8pw/node_modules/playwright-core`, Chrome executable, 390×844 viewport, mobile/touch and device scale 3. Real `.tap()` actions; no mock responses, provider failure injection or delegated reviewers.
- All browser navigation used local `http://127.0.0.1:8817/`. Public hostname, actual iPhone Safari, OS keyboard, home-screen safe areas and venue network were not tested. Emulation does not establish those results.
- Isolated localStorage SID `ux-weak-e64a8565-e5fd-4a6f-9b17-749046a7d7ac`; demo SID untouched. **9 `/api/turn` requests total:** 7 generation turns, one Ship, one Undo. One generation fell back; it is not counted as live-model success. Runtime session/order writes were caused by authorized browser interactions; final live test order is cancelled.
- Live path: intent Send → Bed net → correction Send → explicit correction Send → Single pick → comparison Single pick → explicit purchase Send → Ship it: **8 action taps and 3 typed follow-ups**. Undo is a ninth action/request. Initial uncorrected route could have shipped in 3 action taps; it was not purchased in this pass.
- Scripted mosquito: intent Send → Net → Single → Ship it = **4 action taps**, plus one optional source expansion in the observed run. Direct inferred-size path is 3. Scripted Baby → No tested separately without an order.
- Console captured one resource 404 whose URL was not retained; no visible broken image was identified from it. Do not report the console as completely clean. No page exceptions captured on the three main pages. Supporting source reads had one nonexistent filename (`kit/decisions.js`); corrected to `kit/questions.js`, not an app failure.
- Commands: focused `cat`, `rg`, `nl`/`sed`, `git status --short`, `git rev-parse HEAD`; persistent Node/Playwright browser session; report-only patch. A teardown REPL line incorrectly appended `.exit` to JavaScript; rerun without it. Screenshots and SSE/metric receipts: `/tmp/t8shots/ux-weak/`. No broad tests or server restart.
- **Next action:** integration owner fixes the correction reset/guard and connects camping to catalogue products, then checks one corrected-size compare → Ship journey. Keep the provenance line compact, explicit about its value, readable after advancing and easy to tap.
