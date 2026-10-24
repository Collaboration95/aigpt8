# Team 8 plan: decisions and build (25 Oct 2026)

The team has bought in. We are now building the real app: a mobile-only web app on our phones, with an LLM backend on the Mac and access over Tailscale.

## The three intents (what the demo shows)
1. **Strong intent: toothpaste.** The user knows what they want. Fast path: your usual, Ship it in 2 taps or fewer. The UI is generated per run (the same request gives a different UI).
2. **Weak or vague intent: mosquito net (PRIMARY).** Camping is secondary (kept, not the main demo). Short turn-based questions, inferred defaults, compare, Ship it.
3. **No intent: games as a sales funnel.** Price guess and Rapid fire are the favourites; Swipe, Budget and Bracket are also kept; Blind box was removed. Pitch it as a gamified loop and acquisition funnel that also trains recommendations.
   - **Backend dashboard:** shows per-user preference weights before and after a game (what they're more likely to buy).

## Product rules
- **Real products by default.** Coupang must show actual products, not cartoons, so every product shows a real photo, brand, name and ₩ price.
  - A toggle switches all products to the gamified/cartoon art; it lives on the Orders page.
  - Product data comes from an open dataset or scraped images, stored locally. No live scraping during the demo.
- **Show that prior context is used.** Make the inference visible while the LLM "thinks" and generates the UI, for example:
  - "Your previous purchase" labels.
  - Preselected options with a reason: "King size · from your bed purchase (Mar)".
  - A short "Thinking… using: past orders, bedroom, baby at home" state before a block appears.
- **Orders page after Ship it.** It shows the order (Preparing → Out for delivery → Delivered) and proves the action was carried out. Keep the rest of the app chrome minimal: no About You or settings pages.
- **Carried over:** every tap becomes a user bubble, the agent asks with tappable primitives, feedback is given by buttons, minimal copy, one-tap Ship it with Undo, and earlier blocks freeze.
- **Mobile only.** It must be flawless at 390x844 on iPhone Safari and as a home-screen app.

## Access and dev loop
- Phone (tailnet only): https://macbook-pro-7.tailca286e.ts.net:8443/ → Mac 127.0.0.1:8817.
- Local: http://127.0.0.1:8817/
- Save a file, then refresh the phone. Live reload comes with the app server.
- Architecture: see `ARCHITECTURE.md`. One Node server holds the LLM key in `app/.env`; the LLM composes primitives as validated JSON, with a scripted fallback.

## Way of working
- Fast iteration. Builders run automated Playwright checks themselves (390x844, touch, no errors, no overflow, flow completes). No review agents.
- Builders: Codex gpt-6.1-sol (medium, fast) or Claude Sonnet 5.5, one per file area.
- Next step: collect the user's feedback per flow (toothpaste, mosquito, games) and iterate.

## Open
- LLM provider (DeepSeek vs organiser credit). Permitted tools are UNKNOWN.
- Whether to push `JUDGE-SIGNALS.md` to the public repo (currently kept local).
- The demo run-of-show will be written later (draft: `AHA-DIRECTION.md`, written for v3).
