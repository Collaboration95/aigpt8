# Preference ML review — 25 Oct 2026

**VERDICT: REVISE.** No P0 found. The fitted model and online learning are real; the two P1 findings concern recovering the live demo. The numerical and next-turn integration claims are supported within the evidence limits below.

Reviewed repository HEAD `e7abbbcbdc3e63e9a3b75f0f2da83b4226ae8590`, initially clean, against `PLAN.md` and `plans/ml-preferences.md`. Scope: `app/ml/*`, dashboard, game event adapters, and the model-consumption path in `app/llm/retrieve.mjs` (read surrounding turn code to verify prompt construction). Current catalogue: **200 items / 193 coefficients**, semantic hash `e2996c835d0fd208cfea45ecaa0bd27a0b2cb782bf6381fc7149c2a6465ec971`. Older 76-item/79-feature rehearsal figures in the history are not current measurements.

Only this repository file was written. No application edits, commits, service restart, GitHub access or other-challenge operations. Test harnesses, curl receipts and screenshots are under `/tmp/t8shots/review-ml/`. Authorized API calls wrote isolated runtime sessions; all test preference sessions and `demo` were subsequently reset. Two `/api/turn` calls were made, both live with zero retries; no checkout was requested. Their isolated test conversation remains in the normal local LLM session store; no conversation-reset API exists, and no other repository file was edited to remove it.

## Prioritised findings

### 1. P1 — Reset strands an already-open game in an unrecoverable save queue

**Location:** `app/public/games.html:353-361`, `app/public/games.html:399-400`; reset trigger at `app/public/dashboard.html:42`.

**Scenario:** Open Swipe on the phone, reset the same sid from the dashboard, then Love a card. The old `runAtTap` is correctly rejected. However, the client treats the terminal 409 as a retryable transport failure and retains that exact run forever. Tapping Retry resends the rejected run; later actions queue behind the unresolved promise, and the result screen waits indefinitely on `pending`. Play again/tab switching does not reload the model or clear this queue. This is especially likely when rehearsing reset → before → play with two tabs already open.

**Evidence:** `/tmp/t8shots/review-ml/stale-retry-390.png` shows card 2/8 and **“Learning pending · tap to retry · 409 stale run”** after an explicit retry; server seq remains 0. `/tmp/t8shots/review-ml/ui.json` records this scenario. Independent curl reproduction: `/tmp/t8shots/review-ml/stale.txt`, HTTP 409, `{"error":"409 stale run"}`. Rejection itself is correct; client recovery is missing.

**Fix:** Distinguish stale-run/undone/conflict 409s from retryable network failures. Stop accepting choices for the expired run and offer a clear **“Run reset — start a new game”** action that discards its unsaved queue, fetches the new model/run and restarts the deck. Do not silently reattach an old choice to a new run. Also handle reset during the initial model fetch, before the first `runAtTap` exists.

### 2. P1 — A transient dashboard startup failure permanently disables polling

**Location:** `app/public/dashboard.html:43`; related stale-state handling at `app/public/dashboard.html:17`, `app/public/dashboard.html:38`.

**Scenario:** The first global-model or catalogue request fails or returns non-JSON. The outer startup catch displays an error, but `setInterval(poll,1500)` is installed only after the entire successful bootstrap. Restoring connectivity never retries bootstrap. A presenter can wait indefinitely on Connecting/Loading even though every subsequent endpoint request would succeed.

**Evidence:** A browser-only interception returned one HTTP 503 for the first `/api/model/global`, then allowed subsequent requests. After 3.3 seconds there had still been **only one request**; the screen remained **“Connecting…” / “Loading preferences…”**. `/tmp/t8shots/review-ml/dashboard-load-failure-390.png` and `ui.json` (`loadFailure`). No server interruption was used.

**Fix:** Put bootstrap in an explicit retry/reconnect path, check HTTP status before decoding JSON, and offer Retry immediately. Install a recovery timer independently of bootstrap success. Bound fetch duration so `busy` cannot remain true indefinitely. On ordinary poll failure, mark the existing data **stale** with last-success time instead of retaining the green **“Live · 10 observations”** badge; the latter behavior is independently captured in `/tmp/t8shots/review-ml/dashboard-poll-failure-390.png`. Preserve last good predictions during recovery.

### 3. P2 — Retrieval silently drops the direct weight contribution for multiword/punctuated brands

**Location:** `app/llm/retrieve.mjs:7`, compared with `app/ml/model.mjs:13`, `app/ml/model.mjs:26`, `app/ml/model.mjs:46`.

**Scenario:** The model encodes Sam lip as `brand:sam-lip`, Happy Bath as `brand:happy-bath`, and Dr.FORHAIR as `brand:dr.forhair`. Retrieval builds the matching keys with `norm(p.brand)`, producing `brand:sam lip`, `brand:happy bath`, and `brand:dr forhair`. Their learned weights cannot match. Single-word brands do match, so the extra feature-weight reranker inconsistently favors them. The `3 * p_buy` path still works: this is a partial integration defect, not a claim that preferences never reach the LLM.

**Evidence:** `/tmp/t8shots/review-ml/brand-context-curl.txt` is a real curl response after five Want actions for `snack-yakgwa`: `brand:sam-lip` is **+0.465**, and the item probability is **0.837**. The local independent retrieval probe in `brand-key.json` confirms the actual model key and unmatched retrieval key. Its rank remained #1 with either normalization in that particular probe; no observed rank change is claimed for it. The missing **+0.465** contribution follows directly from the exact string comparison at line 7 and can affect tighter candidate cutoffs.

**Fix:** Share a canonical brand-feature key function with the model, or use the server's active encoded feature names. Add a narrow regression covering a multiword and a punctuated brand. If the intended ranker is exclusively model probability plus intent constraints, remove the separate coefficient bonus deliberately rather than maintaining two inconsistent encodings.

### 4. P2 — The most prominent probabilities omit their target label

**Location:** `app/public/dashboard.html:7`, `app/public/dashboard.html:24`, `app/public/dashboard.html:27`; game profile copy at `app/public/games.html:348`.

**Scenario:** At 1440 the presentation strip displays large **82.7%** figures and the fresh/Guru comparison displays percentages, but neither identifies them as **“Buy-intent probability · demo model.”** The “positive preference response” explanation is in the lower main panel, and the explicit real-purchase limitation is at the page footer. The top synthetic-prior badge is useful, but does not explain what event the large percentage predicts. The game also always says **“Guru · demo profile”**, even when launched after selecting Fresh user on the dashboard.

**Evidence:** `/tmp/t8shots/review-ml/dashboard-after-1440.png` shows the unlabeled prominent percentages. The complete source includes a correct footer disclaimer; no fabricated purchase rate or “accuracy” metric was found. `/tmp/t8shots/review-ml/dashboard-fresh-undo-390.png` and `extra-ui.json` verify Fresh user is an actual supported profile; the game's status string is unconditional at line 348.

**Fix:** Put **“Buy-intent probability · demo model”** and a short **“Positive preference response; not purchase calibration”** caption beside the strip/comparison, including mobile. Keep synthetic provenance visible. Derive game profile text from `modelState.profile`; call comparison counts “observations” because `seq` also counts neutral actions and price guesses, while `learned` counts informative fits. Retain the existing honest metrics/footnote wording.

### 5. P2 — Mobile layout hides the central before/after demonstration behind the evidence prose

**Location:** `app/public/dashboard.html:2`, `app/public/dashboard.html:4-7`.

**Scenario:** On 390×844, the compact hero prediction strip is hidden, while the large summary, evidence links, four order descriptions and comparison cards precede the actual before/after panel. Immediately after playing, the first viewport shows prose and order history, with no prediction numbers. A presenter has to scroll substantially to show the model's main result.

**Evidence:** `/tmp/t8shots/review-ml/dashboard-after-390-viewport.png`. Measured top of `#top`: **y=1,409 before / y=1,553 after**; comparison begins at y=916 after. Exact rectangles are in `ui.json`. No horizontal overflow: document width is 390. At 1440×900, the five-card strip is readable and ends at **y=784** after play; the fresh/Guru comparison ends at y=983 and needs a small scroll. This is information order, not a broken responsive width.

**Fix:** On mobile put a compact before→after prediction row directly below the status controls. Collapse the order list and supporting evidence behind a disclosure, and shorten the summary to one sentence. Keep full explanations available below. Preserve the successful desktop strip; optionally reduce its preceding summary height to fit the cold-start comparison in the projection viewport too.

## Numerical audit and behavior evidence

- **Feature encoding — verified:** deterministic sorted catalogue/feature dictionary; clipped log price and the stated price bands; category/brand one-hot, actual tag multi-hot, and normalized recency-weighted history features. `game`, `history`, `usual` are excluded. Explanations reconstruct logits and sigmoid probabilities. Identical encoded products necessarily tie; item ID provides deterministic ordering. No item-ID coefficient is present.
- **Fit/updates — verified:** stable sigmoid; binary cross-entropy gradient `p-y`; population intercept fitted, personal intercept frozen; personal penalty anchored to the Guru/fresh baseline, with L2 excluded from bias. An independent analytic update after a prior event matched to **6.94e-18** maximum coefficient error. Guru starts from the global weights and applies four weak positive bootstrap steps, rate 0.20, reliability 0.35, anchor penalty 0.025. Those are fixture priors, not real user purchases or evidence of recommendation quality.
- **Bradley–Terry — verified:** the update uses `x_winner - x_loser`, label 1, so the data gradient for shared features cancels and relative winner utility increases. Existing displaced coefficients may still move under L2, which is expected. This relative-preference update does not calibrate absolute purchase probability.
- **Train/held-out split — verified:** 1,600 train shoppers / 400 test shoppers, **zero user overlap**; 32,000 / 8,000 exposures. Each shopper's history is generated before their labeled exposures, and test exposures are not fitted. Sharing the catalogue and generator archetypes is intentional synthetic evaluation, not user-level leakage. Cold-start rows: **7,240 train / 2,220 test**.
- **Metrics — independently reproduced:** log loss **0.5210779632**, training-prevalence baseline **0.5391358193**, tie-aware AUC **0.6209310632**, 10-bin weighted ECE **0.0129856394**. Independent AUC used direct positive-negative pair comparisons rather than the implementation's rank-sum formula. Empty reliability bins carry no ECE mass. These frozen metrics evaluate the population model on synthetic exposures, not the personalized post-game model or real sales. Curl output: `global.txt`; independent calculations: `numeric.json`. Reported running-process fit time was **287.6 ms**, a single local measurement.
- **Determinism/reset/Undo — verified:** repeated fits and resets reproduce numerical weights/predictions; run IDs and receipt times are intentionally fresh. HTTP Undo of a middle observation matched an independent reset-and-replay of the nine surviving observations **exactly** for all weights and predictions. Repeated Undo is idempotent; retrying the removed event returns 409; exact event retry returns its old receipt without teaching twice; conflicting payloads return 409. Other sid and global weights/metrics remain unchanged. `api.json`, `undo.txt`, `retry.txt`, `conflict.txt`, `undone-retry.txt`. Browser Undo reduced 10→9 and profile switch worked (`extra-ui.json`).

Actual touch-browser adapters at 390×844 (events inspected, no generated shopping calls):

| Game | Observations / fitted updates | Result |
|---|---:|---|
| Rapid fire | 10 / 10 | Canonical ten-card deck. Want snacks/drinks, Nope the rest: Pepero **28.32499% → 82.67481%**, #57→#1. Before remains fixed. |
| Swipe | 8 / 8 | Alternating Love/Pass saves canonical IDs and moves the preferred drink group into the top five. |
| Bracket | 7 / 7 | Seven winner/loser pairs; favoring the left-hand bracket entrants moves drink probabilities up to **63.2%**. |
| Price guess | 10 / 5 | Five guess records plus five verdicts. Guess-only leaves preference weights unchanged; verdicts teach. Error/expectation remains separate. |
| Budget | 1 / 1 | Add/remove churn teaches nothing (seq 0); Done posts one final basket. Selected-snack probabilities rise, though the deliberately weak update can leave a history-favored item first. |

Artifacts: `ui-events.json`, `ui.json`, `rapid-result-390.png`, `swipe-result-390.png`, `bracket-result-390.png`, `price-result-390.png`, `basket-result-390.png`. Independent neutral/guess-only invariance and basket-order invariance also pass.

**Degenerate effects and honest limits:** The ten-action Rapid sequence gives a catalog-wide probability range **0.073–0.827**, not universal saturation. Snack deltas differ by brand/tags/price, rather than jumping equally. However, its entire top five becomes Lotte snacks. Pepero almond/Original share precisely the same features and **82.6748%**; Crunky/White Cookie likewise tie at **82.2453%**. A single positive Pepero verdict already moves it **28.3%→51.8%** because several correlated active features update together. Thirty repeated Wants give about **96.6%**, a stress result rather than a ten-action result. This is coarse shared-feature generalization and sparse-feedback sensitivity, not evidence that the model learned distinct flavor/variant tastes. Keep raw ranks honest; if a varied shopping tray is desired, add a clearly disclosed diversity rerank rather than inventing different model scores. See `numeric.json` and `dashboard-after-1440.png`.

**Cold start — verified:** Fresh user's untouched predictions exactly equal the population model. Fresh top item is `snack-jelly` **32.36%**; Guru top is `bed-curtain` **42.03%**. The four-order history therefore creates a sensible visible difference. Comparison replays the same actions separately against the two baselines without mutating the active user. This is a controlled model comparison, not a measured cold-start business improvement.

## Next-turn LLM integration

**Verified on the running server with two real calls:** `POST /api/turn?debug=1&fresh=1`, sid `review-ml-llm`, text **“Recommend snacks for me”**, before and after ten alternating Swipe observations: Want `snack-honey`, Pass `snack-2`.

- `retrieve.mjs:6` fetched the latest `/api/model`. `turn.mjs:12-13` put the returned coefficients and candidate probabilities into `SERVER_CONTEXT`; retrieval also used updated probabilities when selecting its 18 candidates. Candidate input version changed from `...:guru:0` to `...:guru:10`.
- `snack-honey` moved **0.30589→0.70239**; `snack-2` fell **0.28325→0.21477**. Retrieval changed its leading candidates from Choco Pie / Ace / Honey to Ace / Honey / Seaweed / Shrimp. Savory items entered the candidate set and several sweet variants left it.
- Before: live `show_picks`, title **“Snack picks”**, IDs `snack-chocopie, snack-chocoheim, snack-ace, snack-honey, snack-jelly, snack-almond`.
- After: live `show_picks`, title **“Savory snack picks”**, IDs `snack-ace, snack-honey, snack-seaweed, snack-shrimp, snack-onion, snack-rice`.
- Both debug receipts: **source `live`, retries 0, no validation codes**; generation **1,825 ms / 1,388 ms**. Fresh mode bypassed response cache. These observations and the traced prompt path support actual preference consumption; stochastic LLM output alone would not prove causality or repeatability.

Full curl streams: `/tmp/t8shots/review-ml/llm-turn-before.txt`, `llm-turn-after.txt`. Compact extracted output: `llm-summary.json`. Candidate sets: `llm-candidates-before.json`, `llm-candidates-after.json`. No purchase was performed. Model retrieval has a **300 ms** deadline and silently returns `source:unavailable` if it fails; this succeeded in the tested path, but narration should not imply unconditional delivery of updated preferences.

## Commands, failures and evidence limits

- `node --test app/ml/model.test.mjs` — **4/4 PASS**. These tests exercise behavior but do not independently establish metric correctness; the separate audit above does.
- `node /tmp/t8shots/review-ml/numeric.mjs` — PASS, in-memory instrumentation of a read-only source copy exposed synthetic rows for independent metric checks; application files were not altered.
- `python3 /tmp/t8shots/review-ml/api.py` — PASS, curl-based event/reset/retry/Undo/replay/global isolation checks. Machine sequence took **0.65 s**, not human demo timing.
- `node /tmp/t8shots/review-ml/llm.mjs` — two live calls, zero provider retries, candidate/pick change verified.
- `node /tmp/t8shots/review-ml/ui.cjs` — completed touch-browser adapters, polling, before/after screenshots and fault injections; **no page errors**, no 390/1440 horizontal overflow. `extra-ui.cjs` additionally verified actual Undo, Fresh profile and expanded all-items/all-coefficients at 390 with no overflow. Desktop screenshot viewport 1440×900; mobile 390×844. Chrome through the repo's documented `/tmp/t8pw/node_modules/playwright-core` workflow.
- T3 preview opened but snapshot failed twice with **“Preview automation snapshot timed out after 15000ms.”** Switched to the documented Playwright workflow. The first temporary UI harness waited for a model response after navigation and missed it, allowing Rapid's timer to progress; that harness was stopped and its wait corrected before the completed run. This was a harness failure, not a successful UI result or a claimed application regression. A read batch also attempted nonexistent `app/package.json`; subsequent targeted reads succeeded.
- Successful machine-driven ten-action play plus dashboard polling took **2.77 s**, with reduced motion and immediate taps. The ordinary Rapid deck has 2.6-second neutral timeouts per card, so roughly 26 seconds is its no-action envelope; actual human reset→before→play→after within 60 seconds was **not timed**. The successful path has ample computational margin, but findings 1–2 can derail it. Reset first, then reopen/refresh games until recovery is fixed.
- Local server/API and Chrome evidence only. No physical iPhone Safari, public endpoint, venue-network/load test, real-user purchase labels, conversion lift or production identity guarantees were established.
- Cleanup: authorized reset API restored `review-ml-api`, `review-ml-replay`, `review-ml-ui`, `review-ml-llm`, `review-ml-swipe`, `review-ml-bracket`, `review-ml-price`, `review-ml-basket`, `review-ml-stale`, `review-ml-load`, `review-ml-brand`, and **`demo`** to Guru, **seq=0 / learned=0 / empty history**. `/tmp/t8shots/review-ml/cleanup.json`. Owned browser instances/tabs were closed; port 8817 and other services stayed running.

## Top five fixes

1. Recover expired game runs explicitly; discard the obsolete unsaved queue only through a clear new-game action.
2. Retry dashboard bootstrap, bound requests and display disconnected/stale status accurately.
3. Use the same canonical brand keys in model encoding and retrieval, covering multiword/punctuated brands.
4. Label prominent percentages as demo buy-intent/positive-response predictions and render the actual selected profile.
5. Put a compact before→after result above mobile summary/order evidence.

## What you can honestly claim to judges

“We fitted a real logistic regression on a disclosed synthetic population of 2,000 shoppers, with separate held-out shoppers. Guru's four orders are demo fixtures; a fresh user starts from the population model. Actual game choices update personal coefficients online: Want/Pass gives binary feedback, Bracket gives relative preferences, Budget contributes selected items, and price guesses stay separate from explicit preference verdicts. The dashboard shows computed before-and-after positive-response predictions, and Undo removes an observation by replaying the remaining actions. We also verified that updated preferences changed the next live LLM turn's candidate set and picks in a local test. These are demo buy-intent proxies with coarse shared features, not calibrated probabilities of real purchases, proven sales uplift or evidence of improved real-user accuracy.”
