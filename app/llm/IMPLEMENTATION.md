# Builder A backend handoff — 25 Oct 2026

Implemented only `app/llm/*`. No dependencies, commits, server edits/restarts, or public-file edits. The existing server hot-loads `routes.mjs`; after editing siblings, touch routes.mjs to reload their cache-busted imports. State, locks, response cache, capabilities, and order-write queue survive imports through a global singleton.

## Endpoints and renderer contract

- `POST /api/turn`: `{sid,text}` OR `{sid,event:{toolCallId,value,label?}}`. Optional `Idempotency-Key` returns the exact stored SSE stream on transport retry; different input with the same key is rejected.
- Query `fresh=1` bypasses validated first-turn response caching; `debug=1` adds safe metrics; `testBadModel=1` deliberately requests an unavailable model for failure testing without touching env.
- `GET /api/orders?sid=...`, `GET /api/orders/:id?sid=...`.
- `POST /api/orders`: `{sid,toolCallId,quote?}` uses an existing server quote, never client items/prices.
- `POST /api/orders/:id/undo` or `/redo`: `{sid}`. The same operations work as `/api/turn` events (`value:'ship'` or `{action:'undo'|'redo',orderId}`). Orders remain explicitly simulated demo purchases.

SSE events match plan section 4: `meta`, `accepted`, `thinking`, provisional validated `tool`, `commit`, optional `debug`, `done`. Failed attempts issue `reset`; one repair maximum, then `fallback` with `source:'scripted'` and valid deterministic tools followed by commit. Ship/Undo issue `order` then `done`. Persistence failure issues `reset`, `error`, `done`, never commit. All generation attempts share a 4.5-second deadline. Stale/invalid answers are rejected before SSE/model calls.

`tool` data is `{turnId,attempt,index,toolCallId,name,args,products,provisional:true}`. Products are catalogue records with canonical prices. `commit` is `{turnId,revision,toolCallIds,quotes:{callId:opaqueToken}}`. Controls stay disabled until commit. Kit tools use their current `product_ids`, `items:[{product_id,qty}]`, and `preselect` schemas. The four JSON files are reread each turn, with all `x-examples` recursively removed; catalogue is also reread and versioned each turn. Original provider raw argument strings are persisted unchanged and used in assistant history. On the next answer all preceding tool IDs get exactly one result in original order.

Server-only `play_game` has `{game,title,productIds,rounds}`; the SSE args additionally receive **server-generated** `sid` and `launchToken`. The frontend game bridge must pass both to games.html and validate the message's token and iframe source. On completion submit `{toolCallId,value:{action:'complete',eventIds:[...]}}`. The backend rejects invented event IDs and requires those IDs to be in that SID's saved ML history. No model is allowed to authorize purchases.

`memory.mjs` ports the browser's labelled demo past orders and facts. There is deliberately no invented usual shampoo. ML context reads `/api/model?sid=` in-process over loopback; handles its array-shaped weights, profile/version/sequence, compact candidate probabilities and top feature weights. Missing ML gracefully produces an unavailable preference source. Orders and sessions persist atomically under `app/data/`. Quotes are SID/call/catalogue-bound and expire after ten minutes. Catalogue updates invalidate prior quotes. Order replay checks persisted orders before checking pending controls.

Response cache is memory-only, bounded to 24 distinct contexts, TTL ten minutes, and keyed by provider/model, prompt, schema/catalogue versions, normalized exact prompt, facts, candidate set and ML version/signals. Replay revalidates, clones call IDs, issues new game tokens/quotes and reports zero new tokens, `source:'response-cache'`, original generation time/usage separately. Five fixtures prewarm once on first module load; no session/order effects are persisted by prewarming. The server imports backend modules lazily on its first API request, so this is module startup, not process boot.

OpenAI requests use streaming Chat Completions, tools, `reasoning_effort:'none'`, priority when fast, and completion-token limits. Actual returned tier measured as `fast`. DeepSeek-compatible host handling disables thinking, omits OpenAI-only options and uses max_tokens; it has NOT been tested with a DeepSeek key. Measured usage/parallel/tier capabilities are retained globally. Parallel calls and continuation were verified on the configured OpenAI model; unsupported compatible-provider options are not separately probed.

## Verification and limits

Commands: `node --check app/llm/{routes,turn,validate}.mjs`; live curl POST to `/api/turn?fresh=1&debug=1`; `node /tmp/builder-a-unit.mjs`; `node /tmp/builder-a-verify.mjs`; `node /tmp/builder-a-state.mjs`; separate Node process importing store.mjs to read persisted orders/sessions. No server was restarted. Evidence: `/tmp/builder-a-results.json`, `/tmp/builder-a-game.txt`.

Live fresh generation wall times from the completed run:
- toothpaste first response: **1951 ms**, show_usual + ship_it, no retry.
- mosquitoes first response: **1719 ms**, grounded ask_choice preselection; answer continuation: **1736 ms**, note_inference + ship_it, no retries.
- Surprise me: **1456 ms**, play_game, no retry. After a real saved rapid-game preference event, completion produced show_picks in **2446 ms**. A fabricated completion event was rejected.
- usual shampoo: **2814 ms**, ask_choice, one repair. Continuation: **2350 ms**, another choice. No haircare products exist yet, so no unsupported usual/order was fabricated.
- desk discomfort: **1293 ms**, ask_choice; continuation **2364 ms**, labelled scripted no-match clarification after two invalid model IDs were rejected.
- median of the seven live-source generations in that run: **1736 ms**. Core three first-turn median: **1719 ms**. Timings are local HTTP measurements, not phone/public-network proof.
- first-turn cache: **18 ms**, response-cache label and zero new model tokens.
- deliberate bad-model request: **686 ms**, exactly one repair then labelled scripted checkout; no env change. Debug records the deliberately requested invalid model name after the final correction.
- Ship **4 ms**, duplicate Ship **3 ms**, Undo **3 ms**; same persisted order ID returned on replay. REST GET/Ship/Undo/Redo and SID ownership checks pass. A separate process could read cancelled orders and pending sessions from disk (no full process-restart exercise).

Synthetic checks pass: one-byte fragmented UTF-8/CRLF frames, interleaved arguments, usage-only final chunks, truncation rejection, original call order, unknown product IDs, missing required checkout, forbidden model prices, schema validation, all four registry files stripped of examples. Live checks validate every emitted tool and hydrate every emitted product against its catalogue price. Request checks pass for malformed/null bodies, oversized text, SID/path rejection, stale tools, unknown quotes, conflicting idempotency keys, and exact replay.

An initial model response emitted show_usual alone; validation/prompt were tightened so a known toothpaste usual requires same-turn ship_it. An initial verification assertion required shampoo checkout despite an empty haircare category; corrected to distinguish absence from a backend regression. At that earlier check there were **76 products, zero haircare, zero desk**; shampoo/desk checkout was blocked on catalogue additions. This historical failure is preserved above. See the final expanded-catalogue results below for the current status. No browser/mobile/public-endpoint evidence was collected by this backend worker.

## Final expanded-catalogue verification

Builder C's catalogue landed during verification: **200 products, 16 haircare, 12 desk**. The backend reloaded it without a process restart. `node /tmp/builder-a-final.mjs` reran the primary flows; `node /tmp/builder-a-expanded.mjs` exercised the new categories. Current evidence is `/tmp/builder-a-final.json` and `/tmp/builder-a-expanded.json`.

Latest fresh response measurements (all live, zero retries, every emitted tool schema-validated):
- toothpaste **1815 ms**: show_usual + ship_it.
- mosquitoes **1667 ms**: grounded ask_choice + note_inference; accepted preselection answer → ship_it in **1305 ms**.
- Surprise me **1354 ms**: play_game with server-issued SID/token.
- usual shampoo **1473 ms**: show_picks, never inventing a usual; product answer → ship_it in **1354 ms**.
- desk discomfort **1171 ms**: show_picks; product answer → ship_it in **1095 ms**.

Median across these eight final generation turns is **1354 ms**; first-response median across all five prompts is **1473 ms**. Across three development samples each, primary first-response p50s are toothpaste **1815 ms**, mosquitoes **1671 ms**, Surprise me **1456 ms**; mosquito answer-turn p50 **1305 ms**. This is a small warm local development sample, not a controlled public-network benchmark. Shampoo and desk have one sample per turn against the expanded catalogue.

**Current result: all five backend flows PASS**, including two-turn shampoo/desk checkout with real configured-provider calls. Both optional categories now have eligible IDs and canonical prices. Prior empty-category failures above are historical, not relabelled successes. Every previously recorded streamed tool also revalidated under the current registry (13 calls). There are 24 tools total: 23 kit functions plus server-only play_game.

Next: Builder B owns mobile visual acceptance and the orders mirror; game SID/token args are ready for its bridge. No review agents were used. Compatibility with a separate DeepSeek key, public-endpoint/physical-device behavior and a full process restart remain untested.
