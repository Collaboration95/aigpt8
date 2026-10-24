# UX review: variety of the generative UI (AREA = variety)

**Verdict:** The kit is rich (119 variants, 0 render errors, 0 overflow at 390px), but live requests don't show it. 8 unscripted turns used only 3 tool/variant shapes (`show_picks` default/grid, `ask_choice` cards), with the colour tint as the only change. The biggest visible problems are cartoon placeholder art in most live products and a wrong-category result for "desk lamp". Several variants are visibly unfinished. Not a P0 for the flow, but P1 for "wow, generative UI".

Method: 8 live turns on fresh sids (8 of the ~12 /api/turn budget), then all 119 kit.html variants captured at 390px (`/tmp/t8shots/ux-variety/kit/NNN_tool_variant.png`, contact sheets `sheet0-9.png`). Console/page errors: none on live, kit or primitives.

## Live results (screenshots `/tmp/t8shots/ux-variety/liveN.png`)

| # | Request | Tool / variant / theme | Impression |
|---|---|---|---|
| 0 | desk lamp | show_picks / default | Shows **office chairs** (live0). Carousel is fine, but the product is wrong. |
| 1 | gift for mom under 30000 won | show_picks / grid / rose | Good: pink tint, 2x2 grid, all under 30k. But images are cartoons. |
| 2 | snacks for movie night | show_picks / default (magazine-like) | Big hero + list. Placeholder pouch art at hero size looks empty (live2). |
| 3 | shampoo for dandruff | show_picks / default (ranked) | Clean, but 2 results only and 55% of the screen empty. |
| 4 | rainy day stuff | ask_choice / cards / ocean | Nice blue tint; cartoon tiles tiny. |
| 5 | Korean-y gift | ask_choice / cards / rose | One real photo (yogurt, cropped) next to 3 cartoons: inconsistent (live5). |
| 6 | coworker leaving | show_picks / grid / mint | Same 4 products as #1, different tint only. |
| 7 | healthy breakfast | ask_choice / cards / mint | 3 options, orphan third tile; none of them "healthy" (snacks/drinks/coffee). |

Variety score: 8 turns = 2 tools, 2 layouts, 4 themes. Judges will see "grid of pink cards" and "grid of mint cards". Themes tint only the card background; type, shape and motion stay the same.

## P1 (hurts the demo)

1. **Cartoon art dominates live results.** `public/data/products.json`: 121 of 200 products are `Original Team 8 studio placeholder` art (gift, snack, lamp, desk, haircare, drinks). Real photos exist only for toothpaste/mosquito/bedding. Brief says "real product photos by default". Shots: live1, live2, live4, live6. Fix: add real photos for the gift/snack/drinks/haircare/desk categories first (the ones the demo's vague prompts hit), or make the placeholder look intentional (flat colour tile, bigger brand wordmark) instead of a half-empty pouch with a white label.
2. **Wrong-category answer for "desk lamp"** (live0): no lamp in the catalog (only a UV insect lamp), so retrieval falls back to desk chairs, titled "Desk setup picks". For a judge, this is an obvious miss. Fix: add 3-4 lamp SKUs to `desk`; and when no SKU matches, have the prompt (`app/llm/prompt.txt`) answer with `ask_choice` ("Reading / Ambient / Study") rather than unrelated picks.
3. **Model rarely uses the variety.** Prompt line 2 of `llm/prompt.txt` says variant/theme are "optional", so the model skips `variant` most turns and omits other tools (`compare_products`, `insight_card`, `scene_header`, `show_alternatives`, `note_inference`, `bundle` never appeared in 8 turns). Fix: add a short mapping table to the prompt: gifts → `show_picks:magazine|stories` + `scene_header:collage`; 2 candidates → `compare_products:duel`; budget → `ask_budget:presets`; fast comparison → `compare_products:columns`; vague intents → open with `scene_header` (the "mood") then `ask_choice`. Also add a server-side nudge: never reuse the same tool+variant as the previous turn in the session (rotate to a sibling).
4. **Same four products for "gift" intents** (#1 vs #6): retrieval isn't intent-specific. Fix: add a `gift` tag filter by recipient/occasion, or rank by `use_case`.
5. **Image framing glitch on every card**: a thin white strip on the right/left edge of the product image area (live1/live2/live3 left edge: `.pimg` container shows a lighter sliver beside the placeholder gradient). Fix: `object-fit:cover; inset:0` on `.pimg img`, or render the SVG with `preserveAspectRatio="xMidYMid slice"`; check `catalog.js:6`.
6. **Orphan layouts**: ask_choice cards with 3 options leave one empty cell (live7); show_picks with 2 results leaves 55% of the screen empty (live3). Fix: if n is odd, span the last card (`grid-column:1/-1`, horizontal layout); for n<3 prefer `compare_products:duel`.

## P2 (polish) — weakest 10 variants (kit.html, 390px)

| Variant | File | What's wrong | Fix |
|---|---|---|---|
| `pick_variant:swatches` | 072 | Every swatch is the **same red circle**; colour data isn't used. Looks broken. | Use the option's colour (or a product thumb); fall back to hide. |
| `pick_variant:sizes` | 073 | Empty pink rectangles above each size name (placeholders). | Draw proportional bars, or remove the shape. |
| `deal:coins` | 023 | Three identical red rings, no meaning; "See my benefit" is generic. | Show coin amounts/₩ saving or drop. |
| `deal:scratch` | 021 | Grey striped box with "Reveal offer" and no scratch affordance. | Add a coin/foil texture and a "Scratch" hint, or drop. |
| `deal:graph` | 022 | Dotted line with a dot but no axis/value ("no historical data"); red title clashes. | Show 3-bar price history when data exists; hide the variant otherwise. |
| `ask_budget:coins` | 084 | Squashed ₩ glyph tiles look like zig-zag noise; 5th tile clipped. | Use plain ₩10k chips with a stack icon. |
| `thinking_steps:toasts` | 092 | Header "CONTEXT IN MOTION" is **clipped on the left** (negative margin). | Remove the offset on the wrapper. |
| `scene_header:particles` | 106 | Moons overlap the headline/subtitle ("Your bedroom" overprinted). | Keep particles away from the text (z-index/mask), lower opacity. |
| `ask_budget:envelope` | 086 | Raw numeric text inputs (no ₩ formatting, tiny) — triggers the keyboard, against the "no typing" rule. | Replace with the presets/stepper. |
| `scene_header:poster` | 108 | Mostly empty card, a faint asterisk, red border; no image. | Add a product/category photo or a bolder colour block. |

Also minor: `feedback_bar:tune` shows a bare "Too pricey" with no scale labels (013); `feedback_bar:reasons` has one button only (012); `path_progress:map` (111) is a scattered 2-column layout, hard to read; `ask_a_or_b:tug` (060) has an unlabeled slider; `ask_choice:polaroid` (055) uses grey empty photo frames when no product is attached; the mono "Tap a control to see its answer" footer is a gallery artefact (fine in live).

## Best variants to favour (prompt weight up)

- **show_usual:hero / gradient / refill** (025, 029, 030): confident, real photo, one-tap.
- **show_picks:magazine / stories / grid** (033, 035, 031) and **compare_products:duel / columns** (038, 036): strong hierarchy and big photos.
- **product_spotlight:hero / editorial / personal** (041, 043, 044): the "THE ONE." editorial type and the "YOUR PICK" stamp are the most memorable.
- **show_alternatives:ladder / tiers / swap** (046, 049, 047): clear saving logic ("₩5,000 less").
- **ask_choice:cards / carousel / chips** and **ask_a_or_b:versus** (052, 053, 051, 057): crisp, thumb-sized, show the "because" line.
- **ask_slider:dial / gradient** (063, 066), **ask_rank:podium** (080), **ask_budget:presets / piggy** (083, 085).
- **memory_recap:sources / timeline / home**, **note_inference:badge / banner / receipt** (100, 102, 103, 093, 095, 098): subtle and correctable ("Change"/✕).
- **thinking_steps:ring / orbit / terminal** (090, 089, 088) and **scene_header:collage / illustration** (107, 104); **insight_card:verdict / bars** (117, 116).
- **ship_it:slide / stamp / hold** (006, 008, 007) for variety at the final step.

## Recommendations (concrete, in order)

1. Replace placeholder art for gift/snack/drinks/haircare/desk (or make the placeholder tile bolder); add lamps.
2. Prompt: variant/theme mapping table + "don't repeat the previous tool+variant"; encourage `scene_header` as the first block for vague/mood prompts (rainy day, Korean-y, movie night) so the UI changes character, not only the tint.
3. Let `theme` change more than background: accent colour, type weight/serif headline, corner radius (rose = rounded + serif; ocean = tight + mono numerals).
4. Hide/remove the 10 weak variants above from the LLM's allowed list until polished (`kit/tools/*.json` enum) — fewer, better variants beat 119.
5. Fix the odd-count and sparse-result layouts; fix the image-edge sliver and the toasts/particles bugs.

## What's already good (keep)

- Zero JS errors; every variant fits 390px, tap targets >= 44px, bottom composer/chin looks right.
- Kit consistency: eyebrow + big headline + "because…" line is a recognisable, premium system.
- Real photo variants (toothpaste, mosquito net, bedding, groceries) look excellent.
- Tinted themes (rose/mint/ocean) are tasteful, and live scroll-anchoring put the user bubble at the top cleanly.
- Context-inference primitives are subtle and give a clear "Change" escape.

`primitives.html` (old gallery, 30 tiles, 390px wide, no errors): not part of the live path; full-page shot at `/tmp/t8shots/ux-variety/prim-full.png`. Not reviewed beyond load and overflow.
