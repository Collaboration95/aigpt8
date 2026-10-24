// UI kit core: every primitive is an LLM tool with many visual variants.
// Group files (kit/questions.js, kit/products.js, ...) call KIT.register(); live.html renders tool calls via KIT.render().
// Each group also ships kit/tools/<group>.json (OpenAI tool definitions) for the server.
(() => {
  const tools = {};          // name -> { group, description, variants: { id: render } }
  const css = new Set();

  // Variant choice per user: epsilon-greedy bandit over "engagement" (answered, and how fast).
  // Stored in localStorage so the same phone keeps learning which looks this user responds to.
  const KEY = 't8-variant-stats';
  const stats = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = s => localStorage.setItem(KEY, JSON.stringify(s));

  function pickVariant(tool, forced) {
    const t = tools[tool]; if (!t) return null;
    const ids = Object.keys(t.variants);
    if (forced && t.variants[forced]) return forced;
    const s = stats()[tool] || {};
    if (Math.random() < 0.35) return ids[Math.floor(Math.random() * ids.length)];   // explore
    let best = ids[0], bestScore = -1;
    for (const id of ids) {                                                          // exploit (optimistic prior)
      const v = s[id] || { n: 0, r: 0 };
      const score = (v.r + 1) / (v.n + 2) + Math.random() * 0.05;
      if (score > bestScore) { bestScore = score; best = id; }
    }
    return best;
  }
  function reward(tool, variant, r) {
    const all = stats(); const s = all[tool] ||= {}; const v = s[variant] ||= { n: 0, r: 0 };
    v.n += 1; v.r += r; save(all);
  }

  window.KIT = {
    // spec: { group, description, variants: { id: (args, ctx) => HTMLElement } }
    register(name, spec) { tools[name] = spec; },
    // Inject a CSS string once (keyed by id).
    css(id, text) { if (css.has(id)) return; css.add(id); const s = document.createElement('style'); s.dataset.kit = id; s.textContent = text; document.head.appendChild(s); },
    tools: () => Object.keys(tools),
    variants: name => Object.keys(tools[name]?.variants || {}),
    stats,
    // Render one tool call. opts: { onAnswer(value, label), variant?, theme? }
    // Returns an element with .freeze(), .kitTool and .kitVariant set.
    render(name, args = {}, opts = {}) {
      const t = tools[name];
      if (!t) { const d = document.createElement('div'); d.textContent = `[unknown tool ${name}]`; d.freeze = () => {}; return d; }
      const variant = pickVariant(name, opts.variant || args.variant);
      const shown = performance.now(); let answered = false;
      const ctx = {
        variant,
        catalog: window.CATALOG, memory: window.MEMORY,
        img: (item, cls = '') => (window.CATALOG && item ? CATALOG.imgHTML(item, cls) : ''),
        product: id => window.CATALOG?.get?.(id),
        won: n => '₩' + Number(n || 0).toLocaleString('en-US'),
        answer(value, label) {
          if (!answered) { answered = true; const secs = (performance.now() - shown) / 1000; reward(name, variant, secs < 8 ? 1 : 0.5); }
          return opts.onAnswer?.(value, label ?? String(value));
        },
      };
      const el = t.variants[variant](args, ctx);
      el.classList.add('kit', `kit-${name}`, `kitv-${variant}`);
      if (args.theme) el.dataset.theme = args.theme;
      el.kitTool = name; el.kitVariant = variant;
      if (!el.freeze) el.freeze = () => { el.classList.add('kit-frozen'); el.querySelectorAll('button,input,select').forEach(b => b.disabled = true); };
      return el;
    },
  };

  KIT.css('image-edges', `.pimg{isolation:isolate;clip-path:inset(0 round 12px)}.pimg>img,.pimg>svg{position:absolute!important;inset:-1px!important;width:calc(100% + 2px)!important;height:calc(100% + 2px)!important;max-width:none!important;display:block!important;object-fit:cover}.pimg::after{display:none!important}`);
  KIT.css('core', `
  .kit{--acc:#e52528;--ink:#16161a;--sub:#6b6b76;--card:#fff;--soft:#f5f5f7;--r:18px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--ink)}
  .kit button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .kit-frozen{opacity:.6;pointer-events:none;filter:saturate(.7)}
  .kit [data-picked]{outline:2px solid var(--acc);outline-offset:2px}
  .kit[data-theme=mint]{--acc:#0f9d7a;--soft:#e9f8f3}.kit[data-theme=grape]{--acc:#6d3df5;--soft:#f1ecff}
  .kit[data-theme=sun]{--acc:#f08c00;--soft:#fff5e0}.kit[data-theme=ocean]{--acc:#1677ff;--soft:#e8f2ff}
  .kit[data-theme=rose]{--acc:#e64980;--soft:#ffe9f1}.kit[data-theme=ink]{--acc:#fff;--ink:#f4f4f6;--sub:#a9a9b3;--card:#1f1f26;--soft:#2a2a33;background:#15151b}
  `);
})();
