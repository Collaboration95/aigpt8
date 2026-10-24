# primitives.js catalogue

`<script src="primitives.js">` exposes `window.P`. Every primitive is `P.Name(cfg) -> HTMLElement`.

Common contract
- `cfg.onAnswer(value, label, el)`: the answer signal. `label` becomes the user bubble.
- `el.freeze()`: disables it and dims the options that were not chosen. The chosen answer stays visible.
- `el.pick(value)`: the same path as a tap, used by demos and tests.
- `cfg.label` adds a small caps label above. `cfg.theme` (name or object) and `cfg.className` are optional.
- Theme CSS variables: `--bg --fg --acc --acc2 --card --r --fw --onacc`. `P.theme(el, 'mint' | {...})` sets them. Built-in themes: paper, mint, grape, sunny, bubblegum, ink, sky, plain.
- Each primitive injects its own CSS once. `P.art.{tube,brush,box,can}(c,d)` give SVG strings, `P.scenes.*` the scene illustrations, and `P.won(n)` formats ₩.
- Options are `'text'` or `{v, l, ...}` (value, label).

| Primitive | Asks or shows | Config | Signal |
|---|---|---|---|
| **ChoiceChips** | Single choice from chips | `options[{v,l,i(emoji),n}]` | `(v, l)` |
| **MultiTick** | Several ticks, then Done. `instant:true` answers on each tick | `options[{v,l,n}]`, `done`, `instant` | `([v...], "A + B")` |
| **AorB** | Two big cards | `options[2]{v,l,s,art}` | `(v, l)` |
| **Slider** | Spectrum with end labels, then Set | `lo,hi,min,max,value,say(v),confirm` | `(number, say(n))` |
| **Stepper** | − n + quantity, then Done | `value,min,max,step,unit` | `(n, "3 packs")` |
| **Segmented** | 2–4 sliding pill | `options,value` | `(v, l)` |
| **Carousel** | Scroll-snap cards with a detected centre; tap a card or the Pick button | `items[{v,l,s,art}], onCentre(v)` | `(v, l)` |
| **Swatch** | Colour or flavour dots | `options[{v,l,c,tag}]` | `(v, l)` |
| **Toggle** | On/off row | `text,sub,yes,no,value` | `(bool, yes/no)` |
| **ProductHero** | Big product with badge ("Your usual") | `name,price,sub,badge,art` | none (display) |
| **ProductRow** | Compact row. `tap:true` makes it answerable | `name,price,sub,badge,art,tap,value,say` | `(value, say)` |
| **ProductGrid** | 2-column product tiles | `items[{v,l,price,art,badge,s}]` | `(v, l)` |
| **Compare** | 2–3 products with spec chips and a Pick button | `items[{v,l,say,price,specs[],badge,art}],cta` | `(v, say or l)` |
| **Bundle** | Items plus total. `el.set(items,total)` | `items[{name,price,sub,art}],total` | none |
| **RatingTap** | ♥ / ✕ on one item | `name,sub,art` | `("love"\|"nope", l)` |
| **TierList** | Ranked rows with a colour band | `options[{v,l,s,e,c}]` | `(v, l)` |
| **ThisOrThat** | Two stacked options with VS | `options[2]{v,l,s,art}` | `(v, l)` |
| **PathTrail** | A → B → C progress. `el.set(i)` | `steps[],at` | none |
| **ProgressMeter** | Bar with value/max. `el.set(v)` | `text,value,max,fmt(v,max)` | none |
| **ShipIt** | "Ship it · ₩total" button, rocket swoosh, then a receipt morph (`morph:false` hands the receipt to the host) | `total,items[{art}],eta,note(),morph,onShipped(snap),onUndo` | `("ship","Ship it")` at tap |
| **Receipt** | Thumbs, total, "Rocket · tomorrow 7am", Undo/Redo. `el.setUndone(bool)` | `items[{art}],total,note,eta,onUndo(bool)` | `("undo"\|"redo", l)` |
| **Subscription** | Repeat cadence chips with the next date | `options[4,6,8]` | `(weeks, "Every 6w")` |
| **PriceTag** | Price, was, and a delta pill (▼ green, ▲ orange) | `price,was,delta` | none |
| **DiffList** | + new / − removed / ~ changed rows. `el.set(rows)` | `rows[{k:'+'\|'-'\|'~',l,r}]` | none |
| **FeedbackBar** | Reason chips, such as Too pricey | `options` | `(v, l)` |
| **NotThis** | Item actions Swap / Cheaper / Remove | `name,sub,art,actions,noun` | `(action, "Swap brush")` |
| **UndoToast** | Dark pill with an action and an optional countdown | `text,action,ms,onExpire` | `("undo", action)` |
| **Block** | Themed container. Layouts `bleed card blob ticket plain`. Optional scene header. `el.add(child)`. `freeze()` cascades | `theme,layout,scene,title,children` | none |
| **SceneHeader** | SVG illustration strip. Scenes `bubbles leaves stars waves sun confetti` | `scene,title,height` | none |
| **UserBubble** | Right-aligned answer echo | `text` | none |

## toothpaste.html generator

`compose(intent, seed)` returns `{variant, theme, scene, layout, entry[], asks[], ship}`.
- `entry` and `asks` are arrays of `{p: 'PrimitiveName', cfg, route(value) -> state patch, demo}`.
- The variant is `(seed-1) % 4`, and the other choices come from a seeded PRNG.
- `?seed=N` fixes the variant. Without it the seed is random. `?debug=1` shows the variant id.
- Entry variants: A = Hero + AorB, B = Swatch + ProductRow, C = Compare + Slider, D = ProductGrid.
- Follow-up questions pick a primitive from a pool. Flavour uses Swatch, ChoiceChips or Carousel. Focus uses Segmented, Slider, AorB, Toggle or ThisOrThat.
- The ship block varies Hero or Row, and the order of add-on and repeat.
- Demo hooks: `window.demoSteps[0..3]`.
