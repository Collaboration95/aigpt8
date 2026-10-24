# Aha direction: the request determines the interface

**Decision:** build v3 on **v2-g-scroll.html**. The judge should understand within nine seconds: “My request creates controls; my choices change the products; my mood changes their composition.” Dynamic UI means choosing, ordering and sizing components for the task, with presentation as a separate dimension.
This is a frontend-only, scripted interaction prototype. Say that once and label the desktop board `Scripted prototype · sample products`. Context, prices, delivery and friend signals are fixtures; no live AI, catalog, purchase or learning claim.

## Base and borrowing

- **G owns the foundation:** continuous full-width sections, message separators, illustrated scenes, per-turn context, cart review, inference Undo and whole-scroll export. Keep its warm paper and solid foreground surfaces as the default.
- **E supplies composition:** Bold's row-to-grid change, the short exact-reorder card, price-first budget section and recognisable product sprites. Use its broad product assortment on home; reserve candy fields for Playful and discovery.
- **B supplies depth:** the dial's visual prominence and layered sky/weather transitions. Confine atmosphere to the scene and glass to the dial; retain solid product and price surfaces.
- Integration owner: one v3 HTML file, inline SVG/CSS/JS, no new libraries. Retain G's state model but replace whole-block `innerHTML` repaints during interaction with keyed component updates and measured position animations.

## Three signature transitions

Timing below is relative to the initiating action. `move = cubic-bezier(.22,1,.36,1)`; `blend = cubic-bezier(.4,0,.2,1)`; opacity fades are linear. Durations are implementation targets, not measured v2 performance.

**A — Home becomes the first answer, 900 ms.** Home starts as a neutral arrangement of shopping objects and a circular colour field, alongside the exact greeting. A complete camping scene appears only after the request.

- **0–100 ms:** Send depresses to .96 scale and releases; the input clears. Keep Coupang, cart and composer stationary. The request becomes its message label; “camping” receives a temporary underline.
- **100–340 ms:** the greeting fades over 120 ms; the message moves into its separator over 240 ms (`move`). The existing colour field stretches to the block's full-bleed sky; the home tent moves into the scene using the same SVG identity. No white frame or full-screen crossfade.
- **220–620 ms:** the circle's outline moves and grows into the 156 px rotary dial (`move`); its three option labels fade in during 440–620 ms. Context chips travel to the scene's upper edge. The visible request word and arriving scene share one accent pulse, with no flying letters or AI narration.
- **420–780 ms:** three product illustrations move from the home composition into their row thumbnails (`move`), starting 40 ms apart, each lasting 280 ms. Names and prices fade in for the final 100 ms of each arrival.
- **680–900 ms:** total and `Add kit to cart` reveal over 220 ms (`move`, translateY 8→0). First usable result is complete by 900 ms. Home's content slot becomes T1; do not scroll past a second retained home screen.

**B — The same kit responds under your finger, 480 ms; mood reflows it, 600 ms.** Keep the dial, scene, first product and total simultaneously visible.

- **Drag:** pointer follows the finger on every animation frame without easing. Blend the adjacent sky/ground layers proportionally to angle; use three labelled detents, with 12° hysteresis to prevent flicker. Products change only when entering a new detent; release snaps the pointer over 160 ms (`move`). Clicking an option uses the same state path.
- **Detent 0–160 ms:** underline the selected label; retain each kit-role slot (tent, sleeping bag, mat/lantern). **80–360 ms:** old thumbnail/name fades out for 100 ms; replacement enters from 8 px below for 180 ms (`move`). **0–480 ms:** scene layers blend (`blend`). The total crossfades over 160 ms when replacements finish; never show intermediate invented prices.
- Sunny→Winter visibly changes equipment and total: G's sample `₩127,000 → ₩197,000`. Party size remains `2 people`. The scene supports that change; the products prove it.
- **Mood 0–100 ms:** selected swatch gains a ring. **100–500 ms:** preserve SKU IDs, quantities and prices while moving existing rows into the new arrangement (`move`). **100–600 ms:** blend palette and illustration treatment (`blend`); typography weights crossfade over 180 ms, with stable text boxes. Keep the first product's screen position anchored and the composer fixed.
- Cozy = warm flat shapes, 3 generous rows, weight 600; Bold = angular shapes, 2-column compact kit tiles, weight 800; Calm = quiet outline art, 3 spacious rows, weight 500; Playful = bright sprite art, 2-column tiles with alternating image placement, weight 700. All retain readable names, prices and the same total.
- Discovery uses the same four product IDs: Cozy = one featured tile above three compact rows; Bold = tight 2×2 grid; Calm = four spacious horizontal cards; Playful = 2×2 grid with alternating illustration placement. Preserve reading order, and scroll naturally when the composition grows.
- After 3.0 s of visible, idle Winter dwell, reveal `Winter ↑ · Undo` over 160 ms. Undo removes the inferred preference and restores its prior ranking/default in 240 ms; the explicitly selected Winter kit stays selected. Suspend dwell during scrolling, dragging, keyboard entry and hidden-tab time.

**C — Each new request creates a different shape, 600 ms.** Subsequent messages append sections; previous sections remain intact. Use temporary, aria-hidden copies for carryover motion, never move products out of historical blocks.

- **0–120 ms:** append the message; briefly underline `just me`, `cheaper`, or `red Nike socks`. Reserve the destination's actual height, with no generic full-screen loading panel.
- **120–420 ms:** scroll the message just below the fixed app bar (`move`). Shared chips travel into the new section; `2 people` flips to `1 person` over 180 ms for T2. On T3, a copy of the scene compresses to a 56 px winter strip as the price comparison expands. On T4, a red sock illustration expands into a compact single-product card with no landscape or dial.
- **300–600 ms:** T2's solo kit rows, T3's old/new prices and alternatives, or T4's variant and Buy now fade/translate in over 220 ms (`move`, 40 ms stagger). Keep a 24 px tail of the preceding block visible when space allows: the changing section lengths are evidence.
- For `Surprise me`, apply C to a four-item discovery grid. For ✕, only that tile exits over 120 ms and its replacement enters over 180 ms (`move`). For ♥, add the item to a compact saved row in 240 ms; Undo restores the preceding state. A heart never silently buys an item.

## Component vocabulary and generation rules

Every output is a composition of **Scene, Dial, KitList, Comparison, SingleProduct, DiscoveryGrid**, plus shared Context, Total, Action and Message components. Intent selects the composition; constraints select products; mood changes its rendering. More certainty means fewer controls.

| Request | Ordered composition and visible difference |
| --- | --- |
| Home | Greeting + broad product artwork + context; persistent prompt, Surprise me and four mood choices. No product feed to scroll through first. |
| T1: `I want to buy some camping stuff` | Context → 160 px Scene with 156 px Dial alongside kit total → 3-row KitList → Add kit to cart. The open-ended task receives an exploration control. |
| T2: `make it winter, just me` | Context → 120 px winter Scene → solo KitList → total/action. Winter is resolved, so omit the dial; carry Seoul/Late Oct, update party size and tent. |
| T3: `cheaper` | Context → 56 px winter strip → Comparison → 3 budget replacements → action. Show `₩177,000`, `₩80,000`, `−₩97,000`; use the same kit roles and retain solo/winter requirements. Prices and substitutions dominate. |
| T4: `reorder my red Nike socks` | `Previous order` → SingleProduct, Red / M / 3 pairs, price, Rocket delivery → Buy now. Aim for 240–280 px at 390 px width; retain relevant delivery context only. Buy now → review → Confirm order is two purchase taps after the request. |
| T5: `Surprise me` | Context → mood label → four-item DiscoveryGrid with name, price, ♥ and ✕. No campsite hero or kit dial. Choose a random mood and four long-tail items from the local fixture catalog; preserve that choice until another explicit request. |
| Share | Export the existing ordered blocks, product choices and context as one long page. Preserve differences in section height, not five standardised cards. |

Use only the brief's greeting, user messages, functional labels and short context chips. Keep `Rocket · tomorrow` near purchase decisions. Context chips are editable; new turns inherit confirmed context. A mood change affects the active visible block only. Earlier sections do not change when a later request arrives.
**Do not lead with four mood screenshots:** a live row-to-grid rearrangement proves causality more clearly. A desktop-only four-mood comparison may follow if asked. **Do not lead with a carousel before/after:** spend those seconds creating controls; any later generic carousel illustration must be labelled schematic, not presented as today's verified Coupang UI.

## Seven-minute run of show

Before the clock: mirror the actual iPhone app, prepare the camping request in the visible input with keyboard dismissed, and show Home. No result is pre-generated. The desktop operator has Next/Home fallback controls outside the mirrored app. Quotes below are spoken, never inserted into product UI. Between specified actions, hold the stated view; timestamps are rehearsal cues.

| Clock | Presenter action / exact spoken cue | What judges see |
| --- | --- | --- |
| 0:00–0:01 | “Scripted prototype.” Hold Home. | Exact Guru greeting, prepared request, Coupang chrome. |
| 0:01–0:02 | Tap Send. | A completes in 900 ms; home objects become scene, dial and kit. |
| 0:02–0:03 | “A request creates controls.” Point to dial. | Three kit rows, total and purchase action are readable. |
| 0:03–0:04 | Drag Sunny→Winter. | Scene tracks the finger; equipment begins replacing in place. |
| 0:04–0:05 | “Winter changes the kit.” Release. | Winter equipment and `₩197,000`, same `2 people`. |
| 0:05–0:06 | Hold; point from sleeping bag to total. | A full second to register a merchandise change. |
| 0:06–0:07 | Tap Bold. | The same SKU images travel from rows into tiles. |
| 0:07–0:08 | “Mood changes the layout.” Hold. | Heavier type, angular artwork and different density. |
| 0:08–0:09 | Point to unchanged total. | Same products and `₩197,000`; distinct composition. |
| 0:09–0:10 | “The interface follows the task.” | Settled output; no additional animation or explanation panel. |
| 0:10–0:30 | At :12 select Cozy; at :20 point to scene, dial, rows. “The request chooses the components. Your choices determine their contents.” | Kit returns to rows; home and result are one continuous surface. |
| 0:30–1:00 | At :32 select Forest, at :40 return to Winter. At :44 point to `Winter ↑`; at :48 tap Undo. “It can infer a preference. I can undo that inference.” | Equipment responds; preference chip appears and disappears; explicit Winter selection remains. |
| 1:00–1:30 | At 1:02 enter `make it winter, just me`; submit at 1:08. “Same trip. One person.” At 1:18 point to chips and solo tent. | T2 appends; `1 person`, inherited Seoul/Late Oct, smaller tent, `₩177,000`; dial is absent. |
| 1:30–2:00 | Scroll up at 1:32, stop at 1:38; return to T2 at 1:48. “The earlier request stays here. The next one carries its context.” | T1 still has two-person context; T2 shows one-person context. |
| 2:00–2:30 | At 2:02 type `cheaper`; submit at 2:05. At 2:15 point to the three figures. “Now the interface is a price comparison.” | T3 appends with short scene strip, `₩177,000 → ₩80,000`, `−₩97,000`, three alternatives. |
| 2:30–3:00 | At 2:32 point to retained winter/solo constraints; at 2:40 Add kit to cart; at 2:48 Undo. “The budget changes. The requirements stay. The cart is still my decision.” | Only qualifying fixture replacements; cart increases then returns to its prior count. |
| 3:00–3:30 | At 3:02 enter `reorder my red Nike socks`; submit at 3:08. “An exact request needs a much smaller interface.” | A short red-sock card appends directly below the budget comparison. |
| 3:30–4:00 | At 3:32 Buy now; at 3:40 Confirm order. “Two purchase taps, inside Coupang. This order is simulated.” | Product/variant review, then a local confirmation; Rocket delivery remains visible. |
| 4:00–4:30 | At 4:02 tap Surprise me. “With no shopping plan, it creates a place to explore.” At 4:14 point to two unfamiliar products. | Four long-tail items in a new mood; neither the camping control nor the reorder layout repeats. |
| 4:30–5:00 | At 4:32 tap ✕ on one item; at 4:40 ♥ another; at 4:48 Undo. “My reactions shape this collection.” | One tile replaces, one item enters Saved, then the last action reverses. |
| 5:00–5:30 | At 5:02 select Calm; at 5:12 Bold; at 5:22 Cozy. “The selection stays. Its presentation changes.” | The same four items rearrange with different density, type weight and illustration treatment. |
| 5:30–6:00 | At 5:32 swipe upward through T4→T3→T2; pause at each boundary; return to latest at 5:52. “A product. A comparison. A kit. Each request leaves its own interface.” | One email-like history, visibly unequal blocks, no chat transcript of AI paragraphs. |
| 6:00–6:30 | At 6:02 Share; at 6:08 open generated long-page preview; scroll at 6:15. “The whole plan can be shared.” | The same five blocks and choices in a clean export; no board, mock phone or duplicate home. |
| 6:30–6:50 | Return to app at 6:32; hold on T2/T3 boundary. “This prototype demonstrates composition and control. Catalog, context services and model-driven composition are the next integration.” | Honest scope alongside the already-demonstrated interaction. |
| 6:50–7:00 | “Dynamic UI gives each shopping task the controls it needs, and keeps the customer in charge.” Hold. | Final stable app view; finish at 7:00. |

## iPhone contract and rehearsal gate

- Mobile is the app itself: `viewport-fit=cover`, width `100%`, height `100dvh` with `100svh` fallback; zero body margin. Remove mock borders, radius, shadow, transform/scale, fake status bar, dynamic island and home indicator. Actual iOS supplies device chrome.
- Use one three-row app shell: fixed-height app bar, `minmax(0,1fr)` scroll history, auto-height composer. Scene backgrounds bleed edge to edge; text uses 16 px gutters. Apply `env(safe-area-inset-*)` once at shell boundaries; keep the composer above the keyboard using the visible viewport when needed.
- At 390×844, target a 56 px app bar, 104 px composer plus safe inset, 44 px message and a T1 body of about 540 px. Put context 28 px, scene/dial 160 px, three 64 px rows, total/action 56 px and spacing inside that budget. Smaller heights scroll; never scale the app or clip controls to force a fit.
- Inputs ≥16 px; product names/prices ≥14 px; touch targets ≥44×44 px. Scene, dial and cards never overlap labels. Only the dial consumes drag gestures; the rest of the history remains vertically scrollable. Stop automatic scrolling when the customer manually scrolls.
- Default `/` to full-bleed app; enable desktop presentation via `?board=1` only at ≥1024 px. On phones ignore board mode completely. Desktop may show the mock and terse signals; real iPhone mirroring shows neither. Use the same app DOM and state in both modes.
- Share opens an in-app preview of the complete long page; offer native Share where supported and HTML/Print fallback. Do not claim a downloaded file is a hosted public link. Reduced-motion mode uses ≤120 ms fades and immediate layout placement; never depends on animation to communicate changed items.
- Rehearse on actual iPhone Safari and standalone mode at 390×844 plus a smaller 375 px width: keyboard open/closed, rotate, five appended turns, drag, Undo, purchase review, Share and back. Require no horizontal overflow, reachable actions and stable scroll anchors. Record first-ten-second footage; viewport emulation alone does not establish iPhone perfection.
- Evidence this pass: read both briefs and project instructions; inspected supplied home/iPhone, camping and discovery screenshots across all three builds, plus winter/budget/reorder samples. Ran `node` with `/tmp/t8pw`'s `playwright-core` and installed Chrome against all three `http://127.0.0.1:8817/v2-*.html` pages: typed T1–T4, clicked Winter/Bold/Surprise, inspected DOM state; no page errors captured. T3 snapshots timed out twice; used the brief's Playwright fallback. No physical-device or motion-performance validation performed. Next: implement this direction in v3, then run the rehearsal gate.
