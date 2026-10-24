# ML demo implementation and local verification

25 Oct 2026. Owned changes: `app/ml/*`, `app/public/games.html`, `app/public/dashboard.html`. No commits, server changes or service restarts.

## Implemented

- Pure Node logistic model, 79 fixed features, seed 20261025, pinned recency reference 25 Oct 2026. Catalogue-semantic SHA-256 and model version exposed.
- 2,000 synthetic shoppers, 40,000 exposed outcomes; split by shopper, 32,000 train / 8,000 test. Five fixed epochs. Cold starts included. Four checked demo orders weakly bootstrap Guru. No negative labels from unordered products.
- All four model/event endpoints via auto-loaded `routes.mjs`; bounded JSON and IDs, canonical item validation, strict game schemas, frozen intercept, single-step gradients, budget aggregation, separate price-knowledge estimate.
- Exact retry receipts, payload conflicts and stale runs rejected. Synchronous per-session model mutations occur without an intervening await. Atomic versioned journals under locally excluded `app/data/ml/` retain run identity and replay state. Process singleton survives route reload; clients receive immutable before/current snapshots.
- Rapid canonical 10-card deck; Swipe binary, Bracket pairs, Price guess vs verdict, Budget final basket only. The browser serializes events, retains retry IDs and displays a retry control when saving fails. Recommendations use the same model probabilities and the existing Orders flow.
- Responsive dashboard with real catalogue photos, fixed before state, full-catalogue ranks, probabilities, signed coefficient comparisons, term explanations, actual event deltas with separate data/L2 gradients, segment heuristic, frozen held-out synthetic metrics/reliability/provenance and 1.5-second polling.

## Commands and results

- `node --test app/ml/model.test.mjs`: 3 tests PASS. Checks deterministic fit/reset, 79 features, sigmoid/logit reconstruction, gradient direction, fixed before/global model, neutral/guess-only invariance, retry conflict, stale runs, isolation, shared pair features and basket-order invariance.
- `curl -sf http://127.0.0.1:8817/api/model/global -o /tmp/t8shots/ml/global.json`: PASS; held-out synthetic log loss 0.5429476772, training-prevalence baseline 0.5647965114, AUC 0.6348366314, ECE 0.0378072878. Actual running-process fit 158.5 ms. Frozen metrics match independent seeded engine tests.
- `node /tmp/t8pw/ml-check.cjs`: PASS against the existing local server, Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, Playwright from `/tmp/t8pw/node_modules/playwright-core`. HTTP rejects forged weights, unknown items, over-budget baskets, changed retry payload and stale runs; exact retries do not fit twice.
- Touch browser at 390×844: ten Want/Nope actions → ten receipts with the exact canonical IDs. Pepero almond 0.3278845864 → 0.8310612368, #28 → #1. Frozen before panel unchanged. Dashboard polls the new state. Swipe 8 events; Bracket 7 pairs; Price 10 events / 5 fitted verdicts; Budget toggle churn → 1 final event. Order placed from model picks.
- Dashboard at 390 and 1440: no page errors or horizontal overflow; desktop contains no phone iframe. Screenshots inspected visually. Expanded term explanation captured on phone.
- `node /tmp/t8pw/ml-edge.cjs`: PASS. An aborted event remains visibly pending; explicit retry uses the same ID and fits exactly once. Expanded all-items and all-coefficients sections have no phone overflow.
- Curl `POST /api/events` server-timing: 1.07 ms including synchronous journal persistence, excluding response JSON serialization/network. Receipt saved at `/tmp/t8shots/ml/latency-receipt.json`; headers at `latency-headers.txt`.
- Final reset: `ml-check`, `ml-adapters`, `ml-retry`, `ml-latency`, `demo` all reset to Guru, seq=0.

Screenshots and machine report: `/tmp/t8shots/ml/` (`dashboard-before-390.png`, `rapid-390.png`, `dashboard-after-390.png`, `dashboard-after-1440.png`, `recommendations-390.png`, `verification.json`). The temporary test harness is at `/tmp/t8pw/ml-check.cjs`.

These are local synthetic/demo calculations and local Chrome checks, not public-endpoint, physical-iPhone or real purchase calibration evidence. No public endpoint was tested. No conversion improvement is claimed.

Integration finding: the provided ignore assumption was false: only `app/data/prefs.json` and `app/data/sessions/` were ignored. Added `/app/data/ml/` to the local `.git/info/exclude`; shared `.gitignore` remains unchanged. `git check-ignore app/data/ml/demo.json` now passes.

Next action: rehearse `dashboard.html?sid=demo` beside `games.html?game=rapid&sid=demo`; Want snacks/drinks and Nope the other cards, or use genuine choices. Reset starts a new run and invalidates old game tabs; refresh the game after resetting.

## Follow-up: cold start, Undo and LLM context (25 Oct 2026)

Owned files for this pass: `app/ml/*` and `app/public/dashboard.html` only. No commits, server restarts, other challenge edits or LLM/frontend-owner edits.

- Profiles are `guru` / `new` (`cold` remains a compatibility alias). `POST /api/model/profile {sid,profile}` preserves the run and replays the same reactions against the selected baseline. `POST /api/model/reset {sid,profile}` clears reactions and creates a new run. New users have no order features or bootstrap updates: their initial predictions equal the population model exactly.
- `GET /api/model` now includes `summary:{text,claims,orders}`, a monotonic `revision`, full surviving history, catalogue hash and `comparison:{new,guru}`. Comparison uses the same observations with each profile's prior, without changing the active session. The dashboard retains `?sid=` / localStorage `t8-sid`, links evidence to event anchors, offers profile selection and per-event Undo, and displays a desktop five-card before/after strip. All five strip cards fit above y=784 at 1440 width.
- `POST /api/events/undo {sid,event_id,run_id?}` removes the observation and replays surviving events in original receipt order from the deterministic baseline. Optional run ID rejects stale tabs. Repeated Undo is idempotent; resending an undone event is rejected (409), so network retries cannot resurrect learning. `seq` counts surviving observations and can decrease; dashboard refresh uses `revision` as well as run/version/seq.
- `GET /api/model/context?sid=&limit=1..12` returns segment, summary, positive features (up to eight), negative features (up to five), top item IDs with rounded p, seq and run_id. Matching **`import {contextFor} from '../ml/routes.mjs'`** reads the process singleton/journal; synchronous `contextFor(sid, limit=12)` needs no HTTP. Engine instances also expose `contextFor` and `replay`. No LLM integration files were edited.
- Each endpoint/context export checks catalogue contents. Semantic SHA-256 keys ID/price/category/tags/brand, with sorted IDs/tags. A changed semantic hash rebuilds the dictionary and seeded synthetic fit, then replays loaded journals, preserving run IDs/profile and Undo tombstones; persisted sessions hydrate against the current dictionary. Image-only metadata changes avoid retraining. The actual catalogue expanded to 200 during this pass and existing test events remained replayable. No 76-item/79-feature assumptions remain in the owned implementation/tests/dashboard.
- Summary claims require supporting **data** gradients, excluding L2-only drift; source events are linked. Population/history baseline provenance is explicit and the four fixture orders are visible. Coefficients remain descriptive and correlated, not causal purchase evidence.

Verification commands and measured results:

- `node --test app/ml/model.test.mjs`: **4/4 PASS** against the 200-item catalogue. Added fresh-vs-population equality, exact surviving-event replay, immutable comparison, bounded context and deterministic expanded-dictionary replay.
- `python3 /tmp/t8pw/ml2-api.py`: curl checks **global, model, reset, profile, events, undo, context PASS**. Ten observations, remove a middle event, independently reset/replay the other nine: weights and predictions identical, max error **0**. Context **1,150 bytes** (limit 12); limit 3 returns three items. Fresh baseline equals population and differs from Guru. Repeated Undo leaves revision unchanged.
- Node import plus authenticated-free localhost curl comparison: in-process `contextFor('ml2-api')` exactly equals HTTP context JSON.
- `node /tmp/t8pw/ml2-check.cjs`: Chrome `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, Playwright `/tmp/t8pw/node_modules/playwright-core`, **390×844 touch and 1440×844 PASS**. Profile switch, ten observations, evidence anchor, middle-event Undo and all-items/all-coefficients expansion; no page/console errors or horizontal overflow. Screenshots and JSON results: `/tmp/t8shots/ml2/`. `projection-1440.png` also shows the full five-card strip within a 1440×900 viewport.
- Initial verification found a missing profile-route condition (405) and the implicit favicon request (404). Both fixed in owned files; subsequent endpoint/browser runs pass. No failures were relabelled as passes.
- `git diff --check -- app/ml app/public/dashboard.html`: PASS. `git check-ignore app/data/ml/demo.json`: PASS (existing local exclusion).

Test SIDs `ml2-check`, `ml2-api`, `ml2-fresh`, `ml2-replay`, `ml2-ui-390`, `ml2-ui-1440` and `demo` reset to Guru, seq=0 after verification. These are local synthetic/model and Chrome checks, not public endpoint or physical-iPhone proof. Next action for LLM owner: import `contextFor` above and inject its compact JSON in the next prompt; integration remains owned by that builder.
