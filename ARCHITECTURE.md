# Team 8: build architecture (lean, draft 25 Oct)

Goal: a real app on our phones, driven by an LLM. Revising it should take seconds (save the file, refresh the phone), with no cloud deploy and no API key in the client.

```
iPhone (Safari → "Add to Home Screen", full-screen PWA)
   │  HTTPS
   ▼
Tailscale (tailnet-only, or Funnel :8443 for a public HTTPS URL)
   │
   ▼
Mac: node team8/app/server.mjs  (one process, no framework)
   ├── GET  /            static frontend (app shell + primitives.js)
   ├── POST /api/turn    { sessionId, event } → { blocks[], learned[], bubble }
   ├── GET  /api/events  (dev) SSE live reload: save a file → the phone refreshes
   └── LLM call (server-side only, key in team8/app/.env, gitignored)
          → DeepSeek or any OpenAI-compatible endpoint (PROVIDER/BASE_URL/MODEL env)
```

## The core idea: the LLM composes primitives; it doesn't write UI
- The frontend renders only the ~30 primitives in `primitives.js` (AorB, Slider, Carousel, Compare, TierList, ShipIt…).
- Each turn, the server sends the LLM:
  - the primitive catalogue (from `PRIMITIVES.md`, condensed)
  - the session context (answers so far, learned traits)
  - a small slice of the product catalogue
- The LLM returns JSON only:
  ```json
  {"bubble":"Wild","blocks":[{"type":"AorB","q":"Your vibe?","a":{...},"b":{...}}],"learned":["Adventurous"]}
  ```
- The server validates it against an allowlist schema: known types only, at most 3 blocks, product IDs must exist. If it's invalid, it retries once, then falls back to the scripted `compose()` (what v5 does today).
- Products come from a fixed mock catalogue (`app/data/products.json`, ~150 items with real-looking ₩ prices and SVG art). The LLM picks IDs and can never invent prices, which is the safety story for judges.
- Every tap is an event (`{type:'answer', blockId, value, label}`). The label becomes the user bubble, so the composer is optional.

## Reliability for the live demo
- `?mode=live` (LLM), `?mode=scripted` (v5 flows, deterministic), and an automatic fallback to scripted if the LLM takes longer than about 4s or errors.
- The demo runs on our own phones over our own tailnet, so venue Wi-Fi only matters for the LLM call. Keep a mobile hotspot as backup.
- Show a skeleton shimmer while waiting. Target: under 2s per turn with a fast model and a small prompt.

## Context that compounds
- Per-session JSON in `app/data/sessions/<id>.json`: answers, learned traits, shipped items.
- Learned traits from games (Price guess, Rapid fire, Swipe…) feed the next request's prompt. That's the "context compounds" moment: play a game, then ask for camping, and the kit reflects it.
- Traits are visible as chips with ✕ (customer control).

## Access options (pick one)
| Option | URL | Pros | Cons |
|---|---|---|---|
| Tailnet only (recommended for dev) | `https://macbook-pro-7.tailca286e.ts.net:<port>` via `tailscale serve` | Private, stable, HTTPS (PWA works) | Every device must join our tailnet |
| Funnel :8443 | `https://macbook-pro-7.tailca286e.ts.net:8443` | Public HTTPS, stable URL, no deploy | Public. Port 443 is already used by the Sites game (8790); don't touch that one |
| Cloudflare quick tunnel | random `*.trycloudflare.com` | Zero setup | URL changes every run |

## Repo layout (proposed)
```
team8/app/
  server.mjs        node http, static + /api/turn + SSE reload
  llm.mjs           provider call + JSON schema validation + fallback
  prompt.md         system prompt: primitive catalogue + rules
  public/           index.html (single app shell), primitives.js, flows.js (scripted fallback), manifest.json, icons
  data/products.json, data/sessions/
  .env              LLM_API_KEY, BASE_URL, MODEL (gitignored)
team8/ui-concepts/v5/   design reference (kept as is)
```

## Open decisions
1. LLM provider: DeepSeek, or the "$50 credit" the organisers mentioned (provider unverified)? The permitted tools rule is UNKNOWN.
2. Teammates: do they need repo access (commit `team8/` to a branch and push) and tailnet invites?
3. Tailnet only, or also Funnel :8443 for judges and teammates without Tailscale?
