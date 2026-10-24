# Two-hour build: real composition, real learning, one retail journey

**Decision:** build one live shopping surface on the existing Node server. DeepSeek emits validated function calls mapped to existing primitives and catalog IDs; a small fitted preference model changes recommendations after games; server-side context carries into the next request. Keep the existing flow pages as clearly identified scripted fallbacks. Keep the iPhone experience primary.

**Delivery floor at 2:00:** one uncached, unscripted live prompt; toothpaste in two taps; mosquito defaults with editable provenance; Price guess and Rapid fire producing real events; fixed-product predictions before/after fitting; a subsequent request using the updated model; a persisted demo order and Undo. Reserve the final 15 minutes for rehearsal and recording.

## Ground truth and scope boundaries

| Read-time finding | Build consequence |
| --- | --- |
| `app/server.mjs`: `/api/turn` returns 501; `/api/prefs` persists caller-supplied weight deltas. No LLM or fitted model. | Replace the stub and introduce raw events plus a fitted model. Existing weight bars alone cannot demonstrate ML. |
| `index.html` uses keyword routing; unknown prompts go to games. Toothpaste uses a seeded local `compose()`. | All free-text prompts enter the live composer; unknown products receive a useful clarification or honest no-match. |
| `public/data/products.json` and the embedded `catalog.js` array contain the same 76 items across 10 categories; there is no camping category. | Keep this actual JSON path as canonical; expand both representations with one owner. Add genuine breadth before quantity. |
| `MEMORY` is a browser fixture shared by every visitor. `Orders` uses localStorage and elapsed-time delivery animation. | Put user context and live-path orders on the server; distinguish seeded history, inferred preferences and simulated fulfillment. |
| `P` already exposes 30 primitives, `onAnswer`, `freeze()` and product-image support. Games use alias IDs and hand-authored scoring. | Adapt JSON to existing primitives. Send canonical catalog IDs and reactions from games; remove local scoring from the live recommendation path. |
| Current reload endpoint is `/__reload`; the architecture draft mentions an older `/api/events` SSE route. | Keep `/__reload` for development. `/api/events` below is JSON POST, with no SSE collision. |
| `SOURCES.md` labels catalog prices/bundles as synthetic and some photos as representative. | Say “real AI and learning; demo catalog and fulfillment.” Do not claim live Coupang inventory, payments or dispatch. |

Basis: [PLAN](../PLAN.md), [ARCHITECTURE](../ARCHITECTURE.md), [HANDOFF](../HANDOFF.md), [AHA-DIRECTION](../AHA-DIRECTION.md), [decision brief](../briefing/DECISION-BRIEF.md), [slide evidence](../slides-info/SLIDES-INFO.md), and all current app source/config/data files; JPEG assets inventoried. Older frontend-only directions are history; the user's live-tech request governs this build. Permitted tools and unpublished submission rules remain UNKNOWN.

**Provider identity:** the current [DeepSeek API documentation](https://api-docs.deepseek.com/) lists `https://api.deepseek.com` and `deepseek-flash`; it says legacy `deepseek-v4-flash` requests now use V4.1 Flash. Recommend configurable Flash, record requested and returned model IDs, and name the model accurately in the video. Confirm if the team uses a different gateway. Documentation checked 25 Oct 2026; account access and latency are untested.

## 1. Feature menu

Effort is incremental implementation **including the owner's focused checks**, measured in agent-hours: **S ≤0.5; M >0.5–1.25; L >1.25–3**. Rows share infrastructure and are not additive estimates. MUST, 2h is the committed slice; SHOULD gets time only if the 0:45 checkpoint is green; LATER is outside this build.

| Backend feature / bounded slice | Demo value / judge impact | Effort | Risk | Dependencies | Verdict |
| --- | --- | --- | --- | --- | --- |
| LLM `/api/turn`: server-only credentials, validated tool calls, bounded SSE, deadline/fallback | Proves AI creates the interface for the request | L · 1.5–2 | High: provider/schema | Key, model, renderer, corpus | **MUST, 2h** |
| Intent router: strong / weak / none in the same generation call; small deterministic fallback | Known-item buying stays fast; vague requests get useful controls | S · 0.3 | Medium: ambiguity | Turn contract, candidates | **MUST, 2h** |
| Generic primitive renderer and continuing conversation | Unseen wording works beyond four HTML scripts | L · 1.5 | High: callbacks/history | Existing `P`, turn schema | **MUST, 2h** |
| Corpus expansion toward 120–160 entries, 12 categories; local photos and provenance | Demonstrates breadth and long-tail discovery | M · 1.25 | Medium: source time | Existing 76 items, licensed assets | **MUST, 2h**, coverage floor below |
| Local candidate retrieval over names/tags/category/budget, capped at 12–20 items | Grounds arbitrary text without sending the whole catalog | S · 0.4 | Medium: recall | Corpus, router | **MUST, 2h** |
| Server-side profiles, order-derived inference and session persistence | “King · from your Mar bed order” has an actual source | M · 0.75 | Medium: stale assumptions | Store, synthetic Guru history | **MUST, 2h** |
| Explicit memory correction and learning Undo | Demonstrates customer control and causal change | S · 0.4 | Medium: replay/cache | Events, profile versions | **MUST, 2h** |
| Persisted order API, server-priced lines, idempotency, status machine and cancel | Completes discover → evaluate → purchase action | M · 1.0 | Medium: async compatibility | Catalog, store, frontend adapter | **MUST, 2h**, demo fulfillment |
| Raw preference events API with deduplication | Shows the signals that actually trained the model | M · 0.6 | Medium: wrong labels | Canonical IDs, event mapping | **MUST, 2h** |
| Small fitted regression model with versioned product predictions | Real learning changes a measurable output | L · 1.5 | High: sparse labels | Features, events, model plan | **MUST, 2h** |
| Dashboard: immutable before/after predictions, coefficients, event count | Makes learning visible in seconds | M · 0.9 | Medium: misleading comparison | Model snapshots, shared session | **MUST, 2h** |
| Backend “Guru currently prefers…” summary with evidence links | Turns technical changes into understandable customer context | S · 0.25 | Low if templated | Profile and model contributions | **MUST, 2h** |
| Guru / fresh-user switch, same identity on phone and laptop | Shows cold start and context isolation | S · 0.3 | Medium: fixture leakage | Session helper, server binding | **MUST, 2h** |
| Minimal debug receipt: source, model/turn ID, latency, validated tool JSON | Proves the technology is running during the demo | S · 0.3 | Low | Turn metadata, dashboard | **MUST, 2h** |
| Floating live debug overlay with raw rejected LLM JSON | Useful for technical questions; little shopper value | S · 0.5 | Medium: disclosure/clutter | Sanitized debug data | **SHOULD**; laptop only |
| LLM-written recommendation explanation | Adds readable rationale; can hallucinate causes | S · 0.4 | Medium | Grounded reasons | **SHOULD**, same turn only; templates suffice |
| Typed allergen / suitability guardrail, fail closed on unknown facts | Clear reliability and trust behavior | S · 0.4 | Medium: absent evidence | Catalog safety metadata | **MUST, 2h**, narrow checks only |
| Cached validated first turns and explicit scripted mode | Makes the presentation recoverable | S · 0.4 | Medium: stale context | Versioned cache, fallback | **MUST, 2h** |
| Elaborate streaming status sequence | Little extra proof beyond the accepted SSE transport | S · 0.4 | Medium: invented narration | Working turn stream | **SHOULD**; factual server milestones only |
| Streaming model “thinking” text | Consumes time without proving customer benefit | M · 1.0 | High: unstable/private reasoning | Streaming provider | **LATER**; no reasoning transcript |
| Voice input | Convenient modality but browser/permission dependent | M · 1.0 | High on iPhone | Speech service, permissions | **LATER** |
| Photo input / multimodal matching | Strong visual demo, substantial new error surface | L · 2–3 | High | Uploads, vision, image context | **LATER** |
| Server rewards, coins, streaks or redeemable value | Acquisition story; does not prove personalization | M · 0.75 | Medium: correctness | Identity, ledger | **LATER**; retain existing cosmetic coins |
| Korean UI / complete localization | Valuable only if needed for this audience | L · 1.5–2 | Medium: coverage | Confirmed language requirement | **LATER**, English default |
| Price-drop alerts / subscription automation | Extends context beyond checkout | L · 2–3 | High: external side effects | Catalog feed, scheduler, consent | **LATER**; no automation claim |
| Vector database, embeddings, auth, cloud migration or payment integration | Adds infrastructure, little seven-minute evidence | L · 3+ | High | New services/accounts | **LATER** |

**Meaning of “arbitrary”:** accept any free-text wording, rather than four trigger phrases. Fulfill supported catalog requests and ask one clarifying question for ambiguous ones. For absent categories, state the limit and offer relevant alternatives; never fabricate a SKU or silently redirect to games. Adopt the backend plan's haircare and desk additions: at least six distinct, sourced items each, plus problem keywords for the existing categories. Aim for 120–160 total; filling to 200 is SHOULD. Camping stays secondary/scripted unless sourced items are ready. Stop at useful coverage; a 1,000-item import is unnecessary.

## 2. Recommended two-hour execution

**Staffing:** one human technical lead/operator, one presenter, and **eight builders** with about 10–12 agent-hours available before freeze. Use Codex `gpt-6.1-sol` at medium effort with fast service through T3 delegation, or Sonnet 5.5. These are implementation owners, not review agents. Reassign existing builders into these areas; do not launch duplicate workers onto files already being edited.

All paths below are relative to `team8/`; new paths are proposed. Each row exclusively owns its files and tests. Owners request changes from the named owner of another file. The integration lead alone wires routes and manages the Node process. No other challenge directories, port 443 Funnel, infrastructure changes or commits are in this plan.

| Stream / owner agent | Exclusive files | Work and acceptance check |
| --- | --- | --- |
| **I — integration owner, Codex** | `app/server.mjs`, `app/llm/store.mjs`, `app/public/session.js`, `app/package.json`/lockfile if needed, `tests/integration.spec.mjs` | Route adapters, bounded JSON input, session binding, common serialized/atomic persistence and env loading. `curl` all API shapes; malformed input → 400; two sessions stay isolated; restart preserves orders/profile. Own final mobile/public smoke and dependency installs. |
| **L — LLM composer, Sonnet** | `app/llm/{tools,stream,validate,turn,fallback}.mjs`, `app/llm/prompt.txt`, `tests/llm.mjs` | Provider/tool pipeline from the backend plan, imported by I without a second server. Valid calls with existing IDs; forced timeout/bad JSON → labelled fallback within deadline. Curl unseen strong/weak/none prompts with cache bypass; capture `source=live`. |
| **C — corpus/retrieval, Codex** | `app/public/data/products.json`, `app/public/catalog.js`, `app/llm/retrieve.mjs`, `app/scripts/catalog-build.mjs`, `app/public/SOURCES.md`, new `app/public/img/products/*`, `tests/catalog.mjs` | JSON is canonical and generates synchronous browser data; export retrieval to L. Check IDs/prices, family integrity, metadata parity, local image HTTP 200s and 12 held-out queries across old/new categories. No runtime scraping. |
| **M — preference model, Codex** | `app/ml/{model,synth}.mjs`, `app/ml/model.test.mjs`, `app/llm/prefs-adapter.mjs` | Use the ML plan's `reset/event/model/global` engine; add replay/Undo and L's score/context adapter. Automated fitted before/after, duplicate-event no-op, different-session isolation and Undo within numeric tolerance. No duplicate ML implementation in L/G/D. |
| **F — live mobile surface, Sonnet** | `app/public/index.html`, `app/public/live.{html,js,css}`, `app/public/ai.js`, `app/public/primitives.js`, `tests/live.spec.mjs` | Tool-to-`P` mappings, SSE provisional/commit/reset, and an optional async checkout hook preserving scripted behavior. Handle follow-ups and post-game text in the same session. Playwright at 390×844/touch: two-tap reorder, mosquito edit, different compositions, stale-response rejection, no errors/overflow. |
| **G — games/events, Sonnet** | `app/public/games.html`, `app/public/preferences-client.js`, `tests/games.spec.mjs` | Wire Price guess/Rapid fire to canonical events and F's game bridge; await saves before return. Use server predictions for picks. Playwright taps actual controls, checks receipts and increasing `seq`, then returns to shopping. Do not use `demoPlay()` as training evidence. |
| **D — dashboard/debug, Sonnet** | `app/public/dashboard.html`, `app/public/debug.js`, `tests/dashboard.spec.mjs` | Show Guru evidence, cold start, fixed-product before/after scores, coefficient changes and safe tool JSON/latency. Playwright uses the same `sid` as games, sees increasing `seq` in the same `run_id` and retained baseline; phone layout also has no overflow. |
| **O — orders/profile, Codex** | `app/orders.mjs`, `app/profiles.mjs`, `app/data/fixtures/profiles.json`, `app/public/orders.js`, `app/public/orders.html`, `app/public/memory.js`, `tests/orders.mjs` | Export order/profile service functions through I's store. Async live purchase and cancel; refresh orders on another browser; verify price tampering is ignored/rejected, duplicate checkout yields one order, illegal transitions fail, persisted history survives restart. |

**Shared-file handoff:** F adds imports for I/G/D/O-owned helpers; I imports backend modules. O uses I's store for durable mutation; M owns one process-local model engine. F takes `primitives.js` only after its active owner hands it over; the change is the optional async checkout hook. `primitives.html`, `toothpaste.html`, `mosquito.html`, `camping.html` and `surprise.html` remain fallback/reference surfaces. A prerequisite bug goes to its current owner, with an explicit handoff before anyone else edits it.

| Clock | Parallel work and integration decision |
| --- | --- |
| **0:00–0:10** | Lead confirms credentials/provider, captures the current working URL and file-owner roster, and freezes contracts below with the two specialist planners. I publishes store/session interfaces; L/M/O publish callable stubs; F creates a fixture-driven renderer; C freezes feature/category vocabulary with M. Presenter prepares a neutral architecture slide. |
| **0:10–0:30** | L makes the first provider call; C expands metadata/images/retrieval; M fits from a small event fixture; F renders strong/weak/none fixture responses; G records raw reactions; D reads model fixtures; O persists orders/profile. Each builder runs their own focused check. |
| **0:30–0:45** | I wires modules. F connects the `/api/turn` stream; G/D use the shared model; O connects checkout. C freezes the complete catalog/hash, even if below target; M rebuilds the feature dictionary/prior against it before collecting demo events. No hardcoded 76-item/79-feature assumptions. |
| **0:45 — checkpoint 1** | Required: one uncached live prompt renders on the phone; one raw reaction changes fitted coefficients/predictions; one server order reads back. Lead runs curl + mobile smoke. If late: cut prose/floating overlay and optional tool templates; keep the eight core tools below and 76 items plus sourced new-category anchors. Preserve live/model truth claims. |
| **0:45–1:00** | Complete editable mosquito defaults, fast reorder and Guru/new-user isolation. M/G/D lock immutable baseline behavior and event Undo. L/C improve retrieval on held-out prompts; F proves a continuing request after returning from games. |
| **1:00–1:15** | Run the full causal journey once: baseline → games → new predictions → new request → order → refresh → Undo. Force LLM timeout and invalid output. Validate the exact public Funnel URL on a signed-out phone; the operator controls only Team 8's service. |
| **1:15 — checkpoint 2 / FEATURE FREEZE** | All delivery-floor acceptance checks must pass. No new features, dependencies, primitive types, categories or interface redesigns after this point. Mark incomplete MUST claims explicitly; lower-priority features stay out. |
| **1:15–1:35** | Owners repair failures in their own areas. Lead runs one integrated regression at 390×844/touch, refresh/cross-device persistence, cold start and network/provider-failure paths. Presenter practices the seven-minute sequence with genuine controls. |
| **1:35–1:45** | Presenter records the first full seven-minute rehearsal. In parallel, operator prepares labelled cached turns, disables presentation reload and verifies hotspot/power/mirroring; lead captures safe tool JSON and model before/after evidence. Save a clean baseline for a retry. |
| **1:45 — checkpoint 3 / CODE FREEZE** | One successful live rehearsal on the actual iPhone and public URL; one forced-fallback check; laptop shows matching user/session/model versions. Only a demo-blocking fix may enter, followed by its focused check. Confirm a playable local backup video file. |
| **1:45–2:00 — rehearsal/recording buffer** | Record a complete seven-minute run and play it back with audio; use remaining minutes for one retry, clean session reset and opening the correct phone/laptop views. Stop editing. |

If only four builders are available, combine I+O, L+C, F and M+G+D. Cut the floating overlay, extra game wiring and corpus count first; keep the complete causal path. The lead must confirm the smaller roster at kickoff, not discover the capacity gap at 1:15.

## 3. Integration contract (freeze by 0:10)

Use [backend-llm.md](backend-llm.md) §§3–4 for tool schemas/SSE and [ml-preferences.md](ml-preferences.md) §5 for raw events/model responses. Both became available during this pass. The decisions below reconcile their proposals; the ownership table above supersedes their overlapping worker assignments.

| Integration decision | Single agreed boundary |
| --- | --- |
| Generated UI | Validated function calls, not a second free-form block JSON protocol. SSE carries complete calls and a final commit; private reasoning stays hidden. |
| Identity | Keep existing `sid` / `t8-sid` everywhere; use the ML plan's `run_id`, `seq` and `version`. Do not invent parallel `userId/sessionId/modelVersion` wire fields. |
| Two-hour tool coverage | Implement the backend registry, but initially offer only `ask_choice`, `compare_products`, `show_usual`, `show_picks`, `pick_variant`, `note_inference`, `ship_it`, `play_game`. Other six templates are SHOULD; never advertise a tool the renderer cannot handle. Strong eligible reorders include `ship_it` on the first response. |
| Feature vocabulary | M is the sole numerical feature authority: category, brand, usable tags, price log/bands and history interactions. Backend retrieval consumes its predictions; do not build a second additive `price:`/`use:` weight model. Recompute dictionary/hash after corpus freeze. |
| Persistence and evaluation | Orders/profile/conversation persist. For two hours, ML live state may remain process-local as its plan proposes; restart recovery is SHOULD and must be disclosed. Fit the disclosed synthetic prior once; richer synthetic calibration charts are SHOULD, never a gate for live learning. |

### Identity, persistence and runtime

- Every live page honors query `sid`, then `t8-sid`; create random opaque SIDs for fresh users. Server context binds each SID to `profile:"guru"|"cold"`. A fresh user starts cold in both O's profile service and M's engine, never M's default Guru fixture. Phone and laptop use the identical SID. A new request keeps that SID/context; switching identity aborts pending turns and clears displayed state.
- Persist conversations, profile overrides and orders under ignored `app/data/`, outside `public/`. Use I's serialized store and atomic replacement. M retains full accepted events/receipts for the current run and Undo; the API may show only the latest timeline entries. Do not move the canonical catalog into private storage.
- I explicitly loads ignored `app/.env`; merely creating it does not load it in today's server. Use `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`; DeepSeek is the selected provider. O supplies profile/order functions to L; M supplies a preference adapter. Never expose credentials, headers, raw system context or provider reasoning.
- Preserve `GET /__reload`. Add presentation mode so recording is not reset by saves. Reuse the existing stable Funnel URL/8817 process; port 443 → 8790 belongs to another challenge.

### `POST /api/turn`

```json
{"sid":"guru-demo","text":"reorder my toothpaste"}
```

An answer is `{sid,event:{toolCallId,value,label}}`; supply exactly text or event. Validate the active stored call/options and rebuild its canonical label. Optional `Idempotency-Key` identifies a retry. No client-provided profile facts or callback code.

```text
Content-Type: text/event-stream; POST fetch reader, not EventSource
meta     {sid,turnId,attempt,source:"live"|"response-cache"|"scripted"}
thinking {steps:["Reading past orders","Matching catalogue"],origin:"server"}
tool     {turnId,attempt,index,toolCallId,name,args,products,provisional:true}
commit   {turnId,revision,toolCallIds,quotes:{<callId>:<opaqueQuote>}}
debug    {model,ttftMs,firstToolMs,totalMs,usage,retries,source}
done     {turnId}
# Failure: reset {turnId,attempt}, then repair or fallback {url,reason,source}.
# Checkout/Undo: order {order,action}, then done; no LLM call.
```

- Each turn has **1–3 validated function calls**, mapped to local `P` templates with registry-defined style enums. Validate complete arguments and product/source IDs; previews stay disabled until the whole batch is validated and persisted. A reset removes failed previews. No partial JSON, HTML, SVG, JS, arbitrary CSS or callback strings from the model.
- Product names/prices/images and checkout totals are hydrated from the catalog. Inference fact keys resolve through O's server profile; model text cannot assert safety or write authoritative memory. At most one required shopper question; `show_usual` plus `ship_it` is the strong fast path. `ship_it` includes a summary if only one call is available.
- L stores original assistant calls and closes **every** tool-call ID with a result before the next user turn. Untapped controls are skipped/superseded, never silently “answered.” Checkout validates a server quote bound to SID/call/items/catalog version and expiry. No order exists until O persists it successfully.
- Goal: usable turn within 4 seconds, absolute deadline 4.5 seconds; one repair only inside the remaining budget, then labelled fallback. Timings are unmeasured until smoke. Server milestones reflect actual work; avoid `AI.thinking()`'s artificial delay. `?fresh=1` bypasses response cache; keys include provider/schema/catalog, profile hash and preference `run_id/seq`. Cache hits mint new call IDs/quotes and disclose `response-cache`; never cache purchases.
- No intent offers `play_game`. F/G use the backend plan's same-origin launch-token bridge, canonical product IDs and acknowledged event IDs; complete the original game call, refresh preferences, then continue shopping. Full-page return with the same SID is the fallback if embedding misses 0:45. Never generate per-tap LLM calls.

### `POST /api/events` and `GET /api/model`

```json
{"sid":"guru-demo","run_id":"run-from-model","event_id":"e-uuid","game":"rapid","item_id":"snack-1","label":1,"ts":1792886400000}
```

Response: `{event_id,seq,before,after,learned}`; snapshots use the ML plan's shape below. Deduplicate `(sid,run_id,event_id)`; changed payload under the same ID and stale runs → 409. The server derives targets/features: Want/Worth it → 1, Nope/Pass → 0, timeout/Meh → null. Price uses `stage:"guess",guess` or `stage:"verdict",label`; accuracy alone never trains interest. Pair/budget shapes and reliability weights are in the ML plan. G flushes its Promise queue before results/return; retries retain IDs.

```text
GET /api/model?sid=guru-demo
→ {sid,run_id,seq,profile,version,target:"buy-intent-proxy",
   weights:[{feature,before,after,delta}],
   predictions:[{item_id,p_buy,beforeP,deltaP,rank,beforeRank,rankDelta,logit,terms}],
   top:[...],segment,learned,history,priceExpectation,priceError}
POST /api/model/reset {sid,profile:"guru"|"cold"} → fresh run_id,seq:0,immutable baseline
GET /api/model/global → synthetic provenance, counts, feature/hash/version, held-out metrics
POST /api/model/undo {sid,run_id,event_id} → refit without target event, current snapshot
```

- Use the ML plan's regularized logistic SGD and immutable Guru-before anchor; no second Python service. Keep its wire name `p_buy`, but label the UI **“Predicted Want · demo model”**: neither synthetic outcomes nor game reactions establish calibrated real purchase probability. Show synthetic-prior and live-label counts separately.
- Reset only at demo preparation or an explicit user action, not between Price guess and Rapid fire; I coordinates the selected Guru/cold profile with O. Baseline/current evaluate the **same full catalog and feature version**; highlight 4–6 fixed probes. D polls every 1–1.5 seconds and rejects stale run/sequence responses. Undo refits from retained events, advances sequence, preserves the baseline and is idempotent.
- L's preference adapter reads `{version,run_id,seq}` plus current scores/top coefficients before each new request. Explicit safety/budget constraints apply before preference ranking. O's fact corrections override inferred defaults and invalidate cached turns; they are not arbitrary model labels.
- Add small O-owned `GET /api/profile?sid=…` / `POST /api/profile {sid,key,value}` routes for sourced facts, overrides and the evidence-backed summary; I mounts them. D's laptop receipt can poll `GET /api/debug?sid=…` for L's latest sanitized tool JSON and timing. These do not change ML's core response shape. `/api/prefs` stays legacy; never dual-train from its deltas.

### Catalog, orders and browser globals

```text
products.json = Product[]
Product = {id:string, name:string, brand:string, price:integer KRW>0,currency:"KRW",
  category:string,tags:string[],traits:string[],use_case:string[],problem_keywords:string[],
  family_id?:string,variant?:{size?:string},img:"/img/products/<id>.jpg",source:string,
  data_origin:"demo-fixture",price_source:"fixed-demo",image_kind:string,license:string,
  fun?:trustedLocalSVG,
  safety?:{allergens?:string[],babySuitable?:"yes"|"no"|"unknown",evidence?:string}}
```

C preserves IDs and generates the same data into synchronous `CATALOG.items`; no async migration across fallback pages. Real variants resolve to stored SKU IDs. Use M's feature encoder from actual tags, excluding `game/history/usual`; its log-price and low/mid/high bands supersede the backend sketch's additive price/use weights. Missing safety data means unknown; `baby` tags do not prove suitability or household composition. Replace unsupported baby-safe assertions with “check suitability.”

`POST /api/orders {sid,quoteId,idempotencyKey}` → `{order}`; `GET /api/orders?sid=…` → `{orders}`; `POST /api/orders/:id/cancel {sid}` → `{order}`. L's Ship/Undo tool events and these routes invoke the **same O-owned service**, never two checkout implementations. Verify quote ownership/items/expiry and price from catalog. State machine: `preparing → shipped → out_for_delivery → delivered`, with `preparing → cancelled` for Undo. Persist transitions/timestamps; accelerated fulfillment is simulated. F's optional async `P.ShipIt` hook awaits persistence before receipt; `morph:false` alone is insufficient. O adds `upsertServer(order)` for the existing Orders mirror.

| Shared global / owner | Contract |
| --- | --- |
| `window.T8` / I | `ready`, current `sid/profile`, `selectUser()`, `api()`; owns `t8-sid`/query propagation and cold initialization. Consumers wait for readiness. |
| `window.CATALOG` / C | Preserve synchronous `items/get/byCategory/byTag/imgHTML/mode/setMode/onMode`. Photos default; art toggle stays on Orders. |
| `window.P` / existing owner | `P.Name(cfg)` with `onAnswer(value,label,el)`, `freeze()`, `pick()`. F calls allowlisted names only. Preselection must not call `pick()` and accidentally emit an answer. |
| `window.AI` / F | Preserve `thinking/inferred/trackLink`; add live turn/SSE handling. Map named tools to local templates; emit `t8:turn` with safe metadata for debug. |
| `window.MEMORY` / O | Preserve `facts/pastOrders/explain`; add `ready/refresh` for the active server profile. Live code waits; fresh users receive no Guru fixtures. |
| `window.Orders` / O | Preserve synchronous `add/list/get/status/count/onChange` for labelled fallbacks. Add `upsertServer(order)` and async `create/refresh/cancelRemote` for live usage. Never treat a Promise as an order. |
| `window.PreferenceEvents` / G | `emit(event)` / `flush()`, pending queue, shared SID, current `run_id/seq`; retries keep IDs. No independent model authority in localStorage. |

## 4. Acceptance and evidence

These checks are **builder instructions, not tests executed in this design pass**. Owners attach command, exit/result, failure, next action and screenshot path in their handoff to I. I runs the integrated checks once at each checkpoint; there is no review-agent loop.

```sh
# Local smoke after wiring; the same request must be checked through the actual public URL.
BASE='http://127.0.0.1:8817'
curl -fsSN "$BASE/api/turn?fresh=1" -H 'Content-Type: application/json' -d '{"sid":"smoke-guru","text":"reorder my toothpaste"}' | rg '^event: (commit|debug|done)$'
curl -fsS "$BASE/api/model?sid=smoke-guru" | jq -e '.target == "buy-intent-proxy" and (.predictions | length > 0)'
node --test app/ml/model.test.mjs
```

| Gate | Required evidence |
| --- | --- |
| Composition and speed | Curl unseen prompts in all three intent classes; inspect valid IDs/source/timing. L's stream test and F's Playwright check assert `source=live`, a valid committed batch and a follow-up. **Two taps from typed reorder: Send → Ship it**; no mandatory quiz/upsell. |
| Learning and compounding | Capture baseline IDs/scores, tap actual Price guess/Rapid fire reactions, await receipts, then compare fixed probes at increasing `seq`. A matched unseen product should change score; show ranking movement only if computed. The next request must use the same `run_id` and latest acknowledged `seq` through M's adapter. |
| Control and persistence | Edit King → Queen; Undo a signal and refit; cancel an order and refresh another browser. Confirm cold-user isolation. Test order/profile restart persistence on a separate test instance without interrupting the shared server. Model restart recovery is optional; label its process-local limitation. |
| Reliability | Force provider timeout, malformed/unknown primitive, made-up SKU and an unverified allergen/baby suitability query. Expect labelled fallback or clarification, no executable output, invented prices or unsupported safety assurance. |
| Mobile and public access | Playwright 390×844, touch: no console/page errors, no horizontal overflow, reachable controls, frozen history, loading/error recovery. Capture screenshots immediately. Separately use actual iPhone Safari/keyboard and a signed-out phone on the existing public URL; emulation and localhost do not prove either. |

## 5. Seven-minute demo

One phone is Guru throughout; laptop loads the same `sid`. Use phone mirroring for shopper actions, full-width laptop dashboard for evidence, and one closing slide. English, sparse copy, no permanent debug/settings chrome on the phone.

| Time | Phone / presenter | Laptop / operator | What it proves |
| --- | --- | --- | --- |
| **0:00–0:20** | White home. “Tell us what you need; the request creates the controls.” Briefly identify demo catalog/fulfillment. | Mirror the actual phone; prepare a compact live receipt panel. | AI is the primary shopping interface. |
| **0:20–1:05** | Take an unscripted retail prompt from someone in the room; type/send it live. Respond to one generated control. If outside catalog coverage, show the honest clarification and continue with an available alternative. | Show this request's `source=live`, model ID, latency and validated primitive JSON for a few seconds, then return to mirroring. Cache bypass is on. | A live model composes from request + context; no unseen-prompt success claim if fallback occurred. |
| **1:05–1:40** | Start a new conversation as the same Guru. Type “reorder my toothpaste”: Send → Ship it. Point to the saved-order reason, then Track order; briefly Undo if time permits. | Show the persisted order ID; retain Guru identity. | Strong intent stays effortless; a server action completes purchase. |
| **1:40–3:00** | “Mosquitoes keep biting me at night.” Show generated comparison and inferred bedroom/King defaults. Open the Mar bed-order reason; change one default. Pick net and Ship it. Show suitability as an editable/uncertain constraint. | Mirror phone; optionally display the source order behind the inference. | Weak intent → evaluate → purchase; the customer controls inferred context. |
| **3:00–3:25** | Surprise me / games. Enter a run; inspect a product with no pre-existing purchase intent. | Show immutable baseline for 4–6 probe products, current sample count and Guru's evidence summary. | Discovery starts before a shopping target exists. |
| **3:25–4:25** | Play a few Price guess rounds and a full short Rapid fire run with real taps; include positive and negative reactions. | Hold before/after scores for the fixed probes, accepted events and new fitted coefficients. | Games yield labelled observations and real fitted prediction changes. |
| **4:25–5:15** | Open the learned chip/Undo for one reaction, then restore or make a new choice if needed. | Explain “predicted Want,” synthetic prior count if used, and observed sample count. Briefly switch laptop to a fresh user, then back to Guru. | Visible learning, cold start and reversibility without a fake accuracy claim. |
| **5:15–6:15** | Return to shopping, same user. Ask a **new** request related to the preferences actually learned, e.g. a small kitchen gift under ₩20,000. Show a learned preference/reason and select an item. | Show the new turn reads the post-game `run_id/seq` and ranked candidates. | Context compounds across games and shopping, beyond a dashboard animation. |
| **6:15–7:00** | Hold the resulting product/order and finish: “Less effort, context that compounds, control at every step.” | One architecture slide: iPhone → Funnel → Node → profile/catalog + DeepSeek JSON validator → primitives; events → fitted regression → next retrieval; order store at checkout. Mark seeded data and simulated fulfillment. | Ties the real mechanisms to HUMAN / INTELLIGENT / TRUSTED and the full retail journey. |

Rehearse to finish speaking at 6:45, leaving 15 seconds for a slow response. Do not promise a particular score jump, top product or “personality”; narrate the observed result. Recording is the backup of the working system, not a substitute for implementing it.

## 6. Risk register and fallbacks

| Risk / trigger | Owner | Prevention and concrete fallback |
| --- | --- | --- |
| LLM exceeds 4.5 seconds, 429s or outage | L/I | Bound prompt/output and abort by deadline. Use versioned validated first-turn cache, then deterministic scripted fallback. Surface `response-cache`/`scripted`; skip repair if time is gone. A cached/scripted result does not count as live proof. |
| API key absent, invalid or unfunded by 0:10 | Human/I | Enter it privately via the secret-entry mechanism or directly in ignored `app/.env`; smoke server-side without printing it. Continue renderer/model work against fixtures. If still absent at 0:45, declare live LLM blocked; demo labelled fallback plus real ML and use previously captured genuine live footage if available. |
| “V4 Flash” model ID differs from gateway availability | L/human | Confirm base URL and model with one account-level smoke. Keep config explicit and show returned identity; never silently call another model and label it V4. |
| Model emits invalid JSON, unsafe props, nonexistent products or dubious safety claims | L/C | Validate the entire response, hydrate facts/prices locally, check source IDs and enforce constraints before rendering/ordering. Repair within deadline or fall back. Unknown allergen/suitability evidence asks for confirmation; no medical/safety assurance. |
| Venue Wi-Fi / Funnel / Mac connectivity fails | Operator | Test the actual public URL before recording; keep Mac powered and prevent sleep. Prepare a hotspot for both Mac and phone and recheck reachability. If external connectivity remains down, show the local laptop app and the labelled recorded phone run. Do not reconfigure the other challenge's Funnel. |
| Sparse or inconsistent game labels barely move rankings | M/G | Use genuine contrasting choices and display continuous scores/coefficients on fixed probes, plus sample count. Treat timeouts/Meh as unlabelled. A synthetic prior is disclosed. Never inject a predetermined “after” result. |
| “Before” moves on every poll or phone/laptop users differ | M/D/I | Freeze baseline at explicit reset; show SID/profile/run/sequence on laptop. Ignore stale fetches; flush events before a request. Re-run a clean demo session if identity was mixed. |
| Server restart clears process-local live learning | I/M | Finish restarts before rehearsal, pin catalog/feature versions and show process-local status. Persistence/replay is SHOULD. If restarted, reset the run and repeat real taps; never show an old baseline as the new run's result. |
| Legacy sync orders/profile calls break after async conversion | O/F/G | Add separate async methods; preserve old synchronous fallback methods. Await live purchase before receipt. Failure shows retry; a localStorage-only order is not described as server persistence. |
| Agents collide; live reload resets the recording | I | Enforce the ownership table, one route integrator and one state writer. Presentation disables reload; freeze feature work at 1:15 and code at 1:45. No rewrite/merge sweep in the recording buffer. |
| Corpus coverage/photos fail or are misleading | C/L | Keep existing assets working, add verified local metadata/photos, preserve attribution and identify representative images/demo prices. Honest no-match beats fabricated merchandise. Cut import volume, not ID validation. |
| Inferred family/bed context is wrong or unsafe | O/F | Show “inferred from…” with a correction action. New users start empty; corrections outrank history. A baby monitor is a suggestion to confirm context, not proof of household composition or product safety. |
| Live run or recording fails near deadline | Presenter/operator | Record a successful full run by 1:45 where possible; final buffer allows a complete retry and audio/playback check. Keep the MP4 locally accessible on laptop plus a second device. Retain source badges and distinguish prerecorded evidence when using it. |

## 7. Only blocking decisions for the user / lead

| Decision needed | Recommended default / deadline | What waits for the answer |
| --- | --- | --- |
| Who can provide a funded DeepSeek credential privately? | Authorized operator supplies it in ignored `app/.env` or secret entry by **0:10**; never in chat/source/handoffs. | Genuine provider smoke and live-turn acceptance; all independent streams continue. |
| Which endpoint/model should the account actually use, given the V4 alias change? | `https://api.deepseek.com` + configurable `deepseek-flash`, with honest returned identity; confirm an alternative gateway or strict version requirement by **0:10**. | Provider-specific request configuration and the final model name in the video. |
| How many available teammates/builders, and who is the single integrator/operator? | Eight disjoint builders, one human lead/operator and one presenter; reuse existing agents. Confirm roster **before delegation**; apply four-builder cuts if necessary. | File assignments and achievable corpus/dashboard scope. |
| Is Korean required for the judged demo? | **English UI/demo** unless explicitly required by **0:10**. If required, translate the demo labels only and cut SHOULD features; defer full localization. | Translation work only; English implementation proceeds. |

Lead separately verifies official live-call/tool and submission restrictions with the organizer; the supplied evidence does not settle them. This is an external rule check, not a reason for builders to invent restrictions or pause independent local work.

## Design-pass record

Read the six requested project/brief documents, both AGENTS instructions, app source/config/data, catalog and photo provenance at the initial snapshot; inventoried 76 JPEGs and checked headers. Used `rg`, `cat`/`sed`, `wc`, read-only Python parsing and `git status --short`; parallel app edits were already present and continued. Both specialist plans arrived during this pass; read their interfaces, ownership, feature/corpus and checkout/game-bridge sections and reconciled them above. Checked the provider's official model documentation.

An initial `rg plans` failed because the folder did not exist; large combined reads truncated and were followed by focused API/runtime reads. No app mutation, server restart, provider call, browser run, public-endpoint check, ML training or commit occurred in this design pass. The only authored artifact is this file. Next action: integration owner confirms the reconciled boundaries, active file owners and private provider configuration, then starts the 0:00–0:10 contract freeze.
