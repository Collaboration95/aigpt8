**VERDICT: REVISE — no P0 observed; three P1 issues weaken cancellation trust and customer control.**

Reviewed 25 Oct 2026, mobile Chrome 390×844, touch enabled, device scale 3, against PLAN.md, ARCHITECTURE.md and HANDOFF.md. Source HEAD at inspection: `a06527e178965f7c9e05bd6d2d4837a5106de583`. Read existing `llm.md`, `ml.md`, `demo.md`; their findings are referenced below rather than repeated as new findings.

## Prioritised findings

### 1. P1 — Orders tells the customer their cancelled live order is being delivered
- **Location:** `app/public/orders.js:4–5`, `app/public/orders.html:5`.
- **Observed:** Home → type `reorder my toothpaste` → Send → Ship it → Undo showed **Order cancelled**. Track order immediately showed the same order as **Preparing**, with **Rocket · tomorrow 7am**. Its saved record had `status:"cancelled"`. Later the same cancelled order became **Delivered / At your door. Enjoy!** solely through elapsed time. The live badge correctly cleared, making the two surfaces contradict each other.
- **Screenshots:** `/tmp/t8shots/ux-strong/05-live-undo.png`, `06-orders-cancelled.png`, `15-scripted-track-after-undo.png` (the latter also contains the older cancelled live order marked Delivered).
- **Cause/fix:** `Orders.status()` ignores cancellation and derives every state from age; Orders renders its timeline/delivery unconditionally. Give cancelled state precedence in the shared status helper, exclude it from active counts, and render a Cancelled card without delivery progress or celebration. Keep the cancelled receipt visible as evidence of the reversal.

### 2. P1 — Scripted reorder implies a recurring purchase without opting in
- **Location:** `app/public/toothpaste.html:173`, `app/public/toothpaste.html:235`, `app/public/toothpaste.html:258–261`, `app/public/toothpaste.html:280`.
- **Observed:** Tap the scripted home shortcut → Your usual → Ship it, without touching Repeat. Checkout already says **Repeat every 6w · from your order history**, highlights 6w, and the receipt says **₩8,900 · ↻6w**. There is no one-time/off choice. A past purchase interval has been presented as permission to repeat.
- **Screenshots:** `/tmp/t8shots/ux-strong/12-scripted-checkout.png`, `13-scripted-receipt.png`.
- **Fix:** default to one-time; keep “Usually every 6w” as descriptive context only. Offer explicit “Repeat every 6w” opt-in with a One time option, then carry only the confirmed schedule into the receipt/order record. This is a misleading **simulated** subscription presentation; no real recurring charge or scheduler was demonstrated.

### 3. P1 — Scripted composer silently deletes all correction requests after entry
- **Location:** `app/public/toothpaste.html:285–292`.
- **Observed:** Open `/toothpaste.html?q=reorder%20my%20toothpaste`, then type **actually I want sensitive toothpaste** and Send. Input clears, but no user bubble, acknowledgement or product change appears; the original product grid remains. `run()` returns whenever `started` is true, after the submit handler has cleared the text. It makes an always-visible composer falsely promise customer control.
- **Screenshot:** `/tmp/t8shots/ux-strong/17-scripted-ignored-correction.png` (compare `16-scripted-typed.png`).
- **Fix:** route supported refinements to the scripted state machine and append the user's bubble; preserve the input with a brief unsupported-request response for other text. If the backup is controls-only, replace the composer after entry with an honest controls-only affordance rather than accepting and discarding requests.

### 4. P2 — The requested Home toothpaste shortcut is absent; the scripted shortcut is mislabeled
- **Location:** `app/public/index.html:29`, `app/public/index.html:38`; `app/public/toothpaste.html:66`, `app/public/toothpaste.html:293`.
- **Observed:** Main Home has only **Surprise me**, Orders and composer. No toothpaste/reorder shortcut exists to exercise. On `/toothpaste.html`, tapping **Surprise me** emits a **toothpaste** bubble and opens toothpaste selection, rather than discovery. That shortcut was exercised through purchase/Undo, but it is not a main-Home reorder shortcut.
- **Screenshots:** `/tmp/t8shots/ux-strong/01-home.png`, `10-scripted-home.png`, `11-scripted-entry.png`.
- **Fix:** if the demo requires the shortcut described in the assignment, add one small **Reorder toothpaste** chip using the same live `go()` path. Rename the scripted starter **Your toothpaste** or **Reorder toothpaste**; reserve Surprise me for actual discovery.

### 5. P2 — Scripted Undo leaves a tracking link to an order it has deleted
- **Location:** `app/public/toothpaste.html:280–281`; `app/public/orders.js:5`.
- **Observed:** In a separate empty browser context, Ship it → Undo → Track order navigates to `/orders.html#T8-…`, but the page says **Nothing here yet**. Undo's fallback removes the order because `Orders.cancel`/`restore` do not exist, while the tracking link remains enabled. With an earlier live order present, the same action shows that unrelated order instead.
- **Screenshots:** `/tmp/t8shots/ux-strong/14-scripted-undo.png`, `18-scripted-undo-empty.png`.
- **Fix:** preserve a cancelled local record and use the same cancellation rendering as live Orders; alternatively replace the link with “Order cancelled” until Redo restores the record. Never send a customer to a missing hash target after a successful reversal.

### 6. P2 — Scripted composer has two dead controls; inference buttons undershoot the touch target
- **Location:** `app/public/toothpaste.html:34`, `app/public/toothpaste.html:67–70`, `app/public/toothpaste.html:198–200`.
- **Observed:** Add and Mic each occupy 44×44 but tapping either produces no action, explanation or bubble; neither has an event handler. Both compete with typing, reducing input width to **208px**, versus **294px** on main Home/live. Active inference chips measured **40px** high, below the requested 44px minimum.
- **Screenshots:** `/tmp/t8shots/ux-strong/10-scripted-home.png`, `11-scripted-entry.png`, `12-scripted-checkout.png`.
- **Fix:** remove Add/Mic until implemented; retain the common uncluttered composer. Raise inference `min-height` to 44px. Other sampled visible action targets met 44px, including Ship it, Undo, Orders and both art segments.

## What's already good (keep)
- White Home is calm and legible: restrained wordmark, centered greeting, one clear composer, no competing feed. Composer text is 16px; Home controls are 44px tall.
- Typed live request reached a quoted **₩8,900** checkout in the first response. **Send → Ship it = two action taps**, or **one purchase tap after intent submission**; focusing the input is one additional tap. No question was required.
- The sampled live receipt appears immediately with demo/simulated-delivery disclosure, correct total, Track order and a 44px Undo button. Undo returned a cancellation receipt and Redo affordance; server cancellation was reflected in the saved local mirror.
- Orders **Real photos ↔ Fun art** works both ways: one loaded 450px source photo switches to SVG cartoon and back, with selected `aria-pressed` state and 44px segment targets. Home back link works. The Median photo is recognisable and loads without broken-image UI, though its busy photographic background is less clean than a studio cutout.
- Scripted blocks are visually expressive; provenance is adjacent to the product; price and Ship it remain prominent in the sampled checkout. Earlier decision blocks freeze. Scripted shortcut → Your usual → Ship it took **three action taps**, i.e. **two after the shortcut intent**; Undo toggled to Redo and removed the local order.
- Sampled screenshots had no horizontal document overflow, clipped product-name text or composer overlap. New live receipts and scripted decision blocks scrolled into view. The sampled live stamp checkout's actual Ship it lay below the initial viewport; see existing duplicate-surface finding below.

## Existing findings referenced, not duplicated
- `llm.md`, finding 4: duplicate usual/Reorder and Ship it surfaces, extra selection turn and APPROVED? copy. Reproduced visually in `03-live-reorder.png`; the actual purchase button needs scrolling in this stamp composition. Direct Ship it completed successfully.
- `demo.md`, finding 5: conversation/receipt loss on Back. Browser Back from Orders also reset the scripted route to its initial choice rather than restoring Undo/Redo (`19-scripted-back-reset.png`). Main Orders “← Home” correctly goes Home; it is not a return-to-conversation action.
- `demo.md`, finding 2: live inference Change/Forget contract mismatch. This pass did not repeat that known backend probe. Sampled live provenance was readable and explicitly labelled demo history; no correction button was offered in that composition. Scripted provenance expands its reason but does not edit the underlying fact.

## Execution record and limits
- Read-only source/docs commands: `cat`, focused `rg`, `sed`, `nl`, `git status --short`, `git rev-parse HEAD`. Browser: inline Node REPL, `require('/tmp/t8pw/node_modules/playwright-core')`, Chrome executable `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, `chromium.launch`, two isolated contexts with viewport 390×844, `isMobile:true`, `hasTouch:true`, `deviceScaleFactor:3`; locator `.tap()` actions and screenshots.
- Exercised running **local** endpoint `http://127.0.0.1:8817/`; no public-endpoint, physical iPhone Safari, native keyboard, safe-area/notch or venue-network claim. Desktop mobile emulation cannot verify software-keyboard avoidance or keyboard dismissal. Tested composer focus, fill, submit, input clearing and resulting navigation.
- **Three `/api/turn` requests total:** initial typed reorder, Ship it, Undo; isolated `ux-strong-*` SID in localStorage, no `demo` SID. Initial response was rendered through the real backend, with no interception/replay; source/model/cache metadata was not independently captured, so this is not proof of a fresh provider generation. Scripted routes made no LLM calls. One server-backed demo order was left cancelled; both scripted test orders were undone. No source edits, commits, restart or other service operations.
- Captured page errors/console: **zero page exceptions** in both contexts; first context emitted one generic resource **404** console error whose resource URL was not captured (not diagnosed as an app-flow defect). Second context's HTTP-error listener/pageerror listener recorded none. No UI freeze/dead control beyond the findings above.
- Harness failures: `.pm-shipit` wait timed out because entry correctly required selection first; a product locator omitted whitespace in its accessible name and timed out. Corrected using the observed product button's text filter, then completed purchase. These are reviewer errors, not app defects.
- Screenshots: `/tmp/t8shots/ux-strong/01-home.png` through `19-scripted-back-reset.png` (number 11 is `11-scripted-entry.png`). Only this report was intentionally written in the repo; pre-existing `plans/review/llm.md` remained untouched. Runtime sessions/local browser storage changed through authorized shopping interactions.
- **Next action:** integration owner fixes shared cancellation rendering, one-time purchase defaults and scripted composer handling first; then reruns these same short mobile flows. No review loop or delegated agent was used.
