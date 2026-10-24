# Team 8 handoff: AI-first Coupang demo (as of 25 Oct 2026, ~01:00)

Read this first in a new thread. It records the user's directions, decisions, current build state and next steps.

## 1. The challenge (sources in this folder)
- Brief: "Reimagine and create an AI-first retail experience that shifts ecommerce from browsing and searching to AI as the primary interface", covering DISCOVER → EVALUATE → PURCHASE. Slides ask: Is it effortless? Does context compound? Can customers stay in control?
- Demo: 14 teams, 9 am, a 7-minute slot each. Exact submission rules and the full rubric are UNKNOWN. See `briefing/DECISION-BRIEF.md`, `slides-info/SLIDES-INFO.md` and `company-research/DEMO-RESEARCH-BRIEF.md`.
- **Signals reference:** `JUDGE-SIGNALS.md`. (kept local, not in the repo). It covers the official rubric themes plus extra design guidance:
  - Keep users inside Coupang (no outside agent).
  - The recommendation carousel is bad and can go.
  - A big app redesign is welcome.
  - Render the UI dynamically from what the user wants.
  - Infer context instead of asking.
- Strongest official signals: AI-core (not AI-assisted), no-intent discovery and the long tail, cold start, one funnel for strong, weak and no intent (never slow down a known-item buy), multimodality beyond chat, customer control, and safety.

## 2. The product idea (the user's)
- A ground-up redesign of the Coupang **phone app**. AI is the interface, and **each request generates its own UI** (scene, palette, layout, controls).
- Home is minimal, like the Claude mobile app.
- The conversation becomes **one long scroll of generated blocks**, like a marketing email: scroll up to see how the UI evolved turn by turn.
- Customization (season dial, moods, toggles) appears **inside** generated screens only where relevant.
- Purchase stays in Coupang: Rocket delivery, cart, Undo.
- The demo is **frontend-only and scripted**: no backend, no live AI. It shows the frontend architecture and the aha of what "dynamic UI" means.

## 3. The user's directions and taste (follow these)
- **Home:** plain white, Claude-mobile-like. A Coupang mark, "Hey Guru, what are you planning to buy?", the composer, and a small Surprise me chip **on home only**. **No customization on home.**
- **No persistent mood picker or settings bar** in the chrome. Moods and dials live inside the generated block, and they **freeze** when the user moves on.
- **Minimal copy.** No quips, taglines or AI narration sentences. Allowed: product names, prices, "Rocket · tomorrow", buttons, chips of up to 3 words.
- **Generated blocks are lively, vibrant, cute and fun.** The contrast with the white home is the aha. Learning from implicit feedback (dwell, ♥/✕) must be visible and undoable.
- **Multi-turn:** each turn appends a new block; earlier blocks stay visible.
- **Cover several intents, not just camping.** In particular, the fast path (e.g. toothpaste) should still feel like generated UI, but compact.
- **Must be flawless on iPhone.** The default URL is the full-bleed app; `?board=1` gives the desktop presentation board with a phone mock.
- **Working style:**
  - Move fast and don't be pedantic.
  - **No GPT/Codex review loops and no review agents.** The user stopped those after v4.
  - Preferred: **one Sonnet agent per screen or flow to build and fix**, then **one Opus agent to evaluate** by tapping through every press.
  - Show screenshots and concrete feedback. Give a recommendation, not a survey.
- Rejected along the way:
  - v1 directions were gimmicky, with too much copy.
  - v3 was too sober.
  - v2/v4 kept a mood bar on every screen (the user hated this).
  - Fixed customization on home.

## 4. Current build: v5 (the latest; use this)
Folder `ui-concepts/v5/`. The spec is `v5/SPEC.md`; the index is `v5/index.html`.

| File | Intent | What the turns do |
|---|---|---|
| `camping.html` | Explore / weak | Season dial (Sunny/Forest/Winter) re-paints the scene and kit → "winter, just me" (night, 1 person) → "cheaper" (₩173,000, old price struck through, save ₩84,000, per-item swaps) → Add to cart · Undo |
| `toothpaste.html` | Strong / fast | "Your usual" + Buy again; variant chips morph the tube → ordered row · Undo → "add a toothbrush too" → "make it a monthly thing" (4w/6w/8w) |
| `surprise.html` | No intent | Moods inside the block re-layout it (Bold = poster 2×2 grid) → ♥/✕ + Saved tray + Add saved to cart → "more like the lamp" → "under 15,000" |
| `mosquito.html` | Weak | Net/Plug-in/Spray compare; Baby-at-home and Bedroom↔Living toggles re-rank → Net bed-size picker → Buy → "is there a cheaper one" |

**Verified (25 Oct, ~00:55):**
- Tapped through all four at 390x844 (mobile, touch): 63 actions, no page errors, no horizontal overflow.
- The only failed taps were on frozen old controls, as intended.
- Screenshots are in `/tmp/t8shots/v5eval/<flow>/`; contact sheets are `/tmp/t8shots/v5eval/new-<flow>.png`.

**Known remaining issues:**
- The home screens differ across the 4 files (red C mark vs wordmark vs sparkle). Unify them.
- White space below the first block in toothpaste and mosquito.
- Camping turn 3 scrolls slightly short (the scene top is under the header).
- Not tested on a physical iPhone Safari, with the software keyboard, or with native Share.

**Suggested next steps:**
1. Unify the home across the flows (or merge the 4 flows into one app where any prompt routes to the right flow).
2. Fix the small issues above.
3. Expose the server to the phone (Tailscale/LAN) and rehearse on a real iPhone.
4. Write the 7-minute run-of-show. A reusable second-by-second draft is in `ui-concepts/review/AHA-DIRECTION.md`. It was written for v3, so adapt it to the v5 flows.

## 5. Earlier iterations (reference only)
In `ui-concepts/`:
- v1: `a-`…`h-*.html`, eight style directions.
- v2: `v2-*.html`.
- v3: `v3-astra.html` / `v3-sol.html`.
- v4: `v4.html`.
- Specs: `V2-BRIEF.md`, `V3-BRIEF.md`, `V4-POLISH.md`.
- Per-screen critiques: `review/*/CRITIQUE.md`; also `review/AHA-DIRECTION.md`.
- Gallery of everything: `ui-concepts/index.html`.
Useful ideas carried over: home → block morph, "each request gets a different shape" (fewer controls the more certain the request is), and visible implicit feedback with Undo.

## 6. Running it / tooling
- **Server:** `cd team8/ui-concepts && python3 -m http.server 8817 --bind 127.0.0.1`. URLs:
  - http://127.0.0.1:8817/v5/
  - http://127.0.0.1:8817/v5/camping.html?board=1
  - It is bound to localhost only, so a phone can't reach it yet.
- **Screenshot server:** port 8818 serves `/tmp/t8shots`.
- **Playwright:** `playwright-core` is installed in `/tmp/t8pw`; use `executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`.
  - `/tmp/t8pw/v5eval.js` taps through all four v5 flows.
  - `/tmp/t8pw/v5sheet.js` builds the contact sheets.
  - Python PIL is not installed.
  - `/tmp` is ephemeral; recreate it if missing (`npm i playwright-core` in a temp dir).
- **Models available via T3 delegate_task:** Codex gpt-6-astra / gpt-6.1-sol, plus Claude Sonnet/Opus. The user said Codex tokens are plentiful, but now prefers Sonnet builders + an Opus evaluator, with no review loops.
- Nothing is committed to git; all of `team8/` is untracked.
