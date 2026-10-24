# Team 8: AI-first Coupang app (agent instructions)

- Read `PLAN.md` first (decisions, three intents, product rules), then `ARCHITECTURE.md`.
- Mobile UI only (390x844, iPhone Safari / home-screen app). Real product photos by default; the cartoon art is behind a toggle.
- The LLM composes UI from the primitives in `ui-concepts/v5/primitives.js` (see `PRIMITIVES.md`). It returns validated JSON and falls back to the scripted flows. The API key lives only in `app/.env` (gitignored), never in the frontend.
- Move fast: run automated Playwright checks yourself (touch, no page errors, no horizontal overflow, flow completes). No review loops.
- This repo is PUBLIC. Never commit secrets or `JUDGE-SIGNALS.md`.
