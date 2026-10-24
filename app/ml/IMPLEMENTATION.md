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
