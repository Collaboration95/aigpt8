/* primitives.js - ~30 tiny UI primitives. Each: P.Name(cfg) -> DOM element.
   Common contract: cfg.onAnswer(value,label,el); el.freeze(); el.pick(v) (programmatic tap).
   Theme via CSS vars: --bg --fg --acc --acc2 --card --r --fw --onacc. Each injects its own CSS once. */
(function () {
  const P = (window.P = {});
  const done = {};
  const inject = (k, c) => { if (done[k] || !c) return; done[k] = 1; const s = document.createElement('style'); s.dataset.pm = k; s.textContent = c; document.head.appendChild(s); };
  const h = (t, c, html) => { const e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const won = P.won = n => '₩' + Math.round(n).toLocaleString('en-US');
  const O = o => (o && typeof o === 'object') ? Object.assign({}, o, { v: o.v !== undefined ? o.v : o.l }) : { v: o, l: String(o) };
  const attr = v => esc(String(v));
  // Keep image slots independent of controls so art changes preserve selection/freeze state.
  const media = new Map(); let mediaId = 0;
  const imageMarkup = c => {
    const cat = window.CATALOG;
    const item = typeof c.product === 'string' ? cat && cat.get(c.product) : c.product;
    if (item && cat && cat.imgHTML) return cat.imgHTML(item, 'pm-photo');
    if (c.img) return `<img class="pm-photo" src="${attr(c.img)}" alt="${attr(c.name || c.l || 'Product')}">`;
    return c.art || '';
  };
  const artHTML = c => {
    if (!c.product && !c.img) return c.art || '';
    const id = ++mediaId; media.set(String(id), c);
    return `<span class="pm-media" data-media="${id}">${imageMarkup(c)}</span>`;
  };
  const refreshImages = () => document.querySelectorAll('[data-media]').forEach(el => {
    const c = media.get(el.dataset.media); if (c) el.innerHTML = imageMarkup(c);
  });
  window.addEventListener('t8-art', refreshImages);
  window.addEventListener('storage', e => { if (e.key === 't8-art') refreshImages(); });
  P.refreshImages = refreshImages;
  const ROCKET = '<svg class="rk" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c3 3 4 7 4 11l-4 4-4-4c0-4 1-8 4-11z"/><circle cx="12" cy="9" r="1.6"/><path d="M8 14l-3 3 2 1M16 14l3 3-2 1M10 19l2 3 2-3"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---------- themes ---------- */
  P.themes = {
    paper: { bg: '#fff', fg: '#111', acc: '#e52528', acc2: '#ffd23f', card: '#f4f4f6', r: '20px', fw: 700, onacc: '#fff' },
    mint: { bg: 'linear-gradient(160deg,#d9fbf1,#a9eedb 70%,#8fe3cf)', fg: '#08342d', acc: '#0b8f78', acc2: '#ffd23f', card: '#fff', r: '20px', fw: 700, onacc: '#fff' },
    grape: { bg: 'linear-gradient(160deg,#ece6ff,#cdbfff)', fg: '#231a5c', acc: '#5b3df5', acc2: '#ffb703', card: '#fff', r: '20px', fw: 700, onacc: '#fff' },
    sunny: { bg: 'linear-gradient(160deg,#fff3c4,#ffd86b)', fg: '#4a2a00', acc: '#e5500b', acc2: '#fff', card: '#fffdf4', r: '20px', fw: 800, onacc: '#fff' },
    bubblegum: { bg: 'linear-gradient(160deg,#ffe3ee,#ffb9d4)', fg: '#55102f', acc: '#e8337a', acc2: '#7be0d0', card: '#fff', r: '20px', fw: 700, onacc: '#fff' },
    ink: { bg: 'linear-gradient(160deg,#1a1d29,#10121a)', fg: '#fff', acc: '#ff4a4f', acc2: '#5ef2c8', card: '#262a3a', r: '20px', fw: 700, onacc: '#fff' },
    sky: { bg: 'linear-gradient(160deg,#e3f4ff,#b4dcff)', fg: '#0b2a52', acc: '#1769e0', acc2: '#ff9f1c', card: '#fff', r: '20px', fw: 700, onacc: '#fff' },
    plain: { bg: 'transparent', fg: '#111', acc: '#e52528', acc2: '#ffd23f', card: '#f4f4f6', r: '20px', fw: 700, onacc: '#fff' }
  };
  P.theme = (el, t) => {
    const v = typeof t === 'string' ? P.themes[t] : t; if (!v) return el;
    for (const k in v) el.style.setProperty('--' + k, v[k]);
    if (typeof t === 'string') el.dataset.theme = t;
    return el;
  };

  /* ---------- art helpers (inline SVG strings) ---------- */
  P.art = {
    tube: (c = '#19b394', d = '#0b6e5c') => `<svg class="pm-art" viewBox="0 0 120 150"><ellipse cx="60" cy="140" rx="30" ry="5" fill="rgba(0,0,0,.12)"/><path d="M30 28h60l-5 98H35z" fill="${c}"/><path d="M35 126h50l1-14H34z" fill="rgba(0,0,0,.14)"/><rect x="46" y="8" width="28" height="22" rx="6" fill="${d}"/><rect x="40" y="26" width="40" height="6" rx="3" fill="#fff" opacity=".5"/><rect x="42" y="48" width="36" height="46" rx="10" fill="#fff" opacity=".92"/><circle cx="53" cy="67" r="2.6" fill="#222"/><circle cx="67" cy="67" r="2.6" fill="#222"/><path d="M53 76q7 7 14 0" stroke="#222" fill="none" stroke-width="2.4" stroke-linecap="round"/><circle cx="48" cy="74" r="3" fill="#ff8fab" opacity=".7"/><circle cx="72" cy="74" r="3" fill="#ff8fab" opacity=".7"/><path d="M42 118h36" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/></svg>`,
    brush: (c = '#19b394', d = '#0b6e5c') => `<svg class="pm-art" viewBox="0 0 64 84"><g transform="rotate(14 32 42)"><rect x="27" y="30" width="10" height="44" rx="5" fill="${c}"/><rect x="25" y="8" width="14" height="26" rx="5" fill="${d}"/>${[0, 1, 2].map(i => `<rect x="${27 + i * 4}" y="2" width="2.4" height="9" rx="1.2" fill="#fff"/>`).join('')}</g></svg>`,
    box: (c = '#ff9a3c', d = '#c25a0a', g = '★') => `<svg class="pm-art" viewBox="0 0 100 100"><path d="M14 34l36-18 36 18v38L50 90 14 72z" fill="${c}"/><path d="M14 34l36 18 36-18M50 52v38" stroke="${d}" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M32 25l36 18" stroke="${d}" stroke-width="4"/><text x="50" y="76" text-anchor="middle" font-size="20" fill="#fff" font-family="sans-serif" font-weight="800">${g}</text></svg>`,
    can: (c = '#ff5c8a', d = '#b21f53', g = '🍓') => `<svg class="pm-art" viewBox="0 0 100 100"><ellipse cx="50" cy="90" rx="26" ry="5" fill="rgba(0,0,0,.12)"/><rect x="26" y="14" width="48" height="74" rx="12" fill="${c}"/><rect x="26" y="14" width="48" height="14" rx="7" fill="${d}"/><circle cx="50" cy="56" r="17" fill="#fff" opacity=".92"/><text x="50" y="63" text-anchor="middle" font-size="20">${g}</text></svg>`
  };

  /* ---------- scenes (for SceneHeader) ---------- */
  const SV = (b) => `<svg viewBox="0 0 390 84" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${b}</svg>`;
  const A = 'style="fill:var(--acc)"', B = 'style="fill:var(--acc2)"';
  P.scenes = {
    bubbles: () => SV(`<circle cx="40" cy="50" r="30" ${A} opacity=".22"/><circle cx="96" cy="20" r="14" fill="#fff" opacity=".6"/><circle cx="170" cy="62" r="22" fill="#fff" opacity=".45"/><circle cx="260" cy="26" r="26" ${A} opacity=".2"/><circle cx="320" cy="64" r="12" ${B} opacity=".9"/><circle cx="360" cy="22" r="16" fill="#fff" opacity=".55"/><circle cx="214" cy="14" r="6" fill="#fff"/><circle cx="130" cy="64" r="5" ${B}/>`),
    leaves: () => SV(`<g ${A} opacity=".28"><ellipse cx="50" cy="40" rx="34" ry="14" transform="rotate(-30 50 40)"/><ellipse cx="150" cy="64" rx="30" ry="12" transform="rotate(25 150 64)"/><ellipse cx="270" cy="30" rx="36" ry="14" transform="rotate(-18 270 30)"/><ellipse cx="350" cy="62" rx="28" ry="11" transform="rotate(32 350 62)"/></g><ellipse cx="205" cy="18" rx="22" ry="9" fill="#fff" opacity=".6" transform="rotate(20 205 18)"/><circle cx="100" cy="22" r="6" ${B}/><circle cx="310" cy="14" r="5" ${B}/>`),
    stars: () => { const s = (x, y, r, f) => `<path d="M${x} ${y - r}q${r * .18} ${r * .82} ${r} ${r}q-${r * .82} ${r * .18} -${r} ${r}q-${r * .18} -${r * .82} -${r} -${r}q${r * .82} -${r * .18} ${r} -${r}z" ${f}/>`; return SV(s(46, 44, 26, A + ' opacity=".35"') + s(120, 22, 12, 'fill="#fff" opacity=".85"') + s(190, 58, 18, B) + s(280, 30, 24, A + ' opacity=".3"') + s(346, 58, 12, 'fill="#fff" opacity=".85"') + s(340, 16, 8, B)); },
    waves: () => SV(`<path d="M0 50q48-28 98 0t98 0 98 0 98 0v34H0z" ${A} opacity=".22"/><path d="M0 62q48-24 98 0t98 0 98 0 98 0v22H0z" fill="#fff" opacity=".5"/><circle cx="330" cy="24" r="14" ${B}/><circle cx="60" cy="22" r="6" fill="#fff"/>`),
    sun: () => SV(`<circle cx="310" cy="40" r="26" ${B}/><g stroke="var(--acc2)" stroke-width="5" stroke-linecap="round" opacity=".8"><path d="M310 2v10M310 68v10M272 40h10M338 40h10M283 13l7 7M330 60l7 7M337 13l-7 7M290 60l-7 7"/></g><ellipse cx="90" cy="54" rx="50" ry="14" fill="#fff" opacity=".7"/><ellipse cx="130" cy="44" rx="30" ry="12" fill="#fff" opacity=".7"/><ellipse cx="200" cy="22" rx="30" ry="9" ${A} opacity=".22"/>`),
    confetti: () => SV([[30, 20, 20], [80, 56, -30], [140, 24, 40], [200, 62, 10], [250, 20, -20], [300, 52, 50], [350, 22, 15], [112, 70, 60], [372, 64, -40]].map(([x, y, r], i) => `<rect x="${x}" y="${y}" width="18" height="8" rx="3" transform="rotate(${r} ${x} ${y})" ${i % 3 == 0 ? A : i % 3 == 1 ? B : 'fill="#fff" opacity=".8"'}/>`).join(''))
  };

  /* ---------- registry ---------- */
  const BASE = `:root{--bg:#fff;--fg:#111;--acc:#e52528;--acc2:#ffd23f;--card:#fff;--r:20px;--fw:700;--onacc:#fff}
.pm,.pm *{box-sizing:border-box}
.pm{color:var(--fg);font-family:inherit;min-width:0;max-width:100%;position:relative}
.pm :where(button){font:inherit;font-weight:var(--fw);color:inherit;border:0;background:none;cursor:pointer;min-height:44px;-webkit-tap-highlight-color:transparent;transition:transform .15s,opacity .25s,background .25s,box-shadow .25s,border-color .25s}
.pm button:active{transform:scale(.95)}
.pm-lbl{margin:0 0 12px;font-size:12px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;opacity:.65}
.pm-art{display:block;width:100%;height:100%}
.pm .im{display:block;position:relative;flex:none;aspect-ratio:1;min-width:0}
.pm-media{display:block;position:absolute;inset:0;width:100%;height:100%;overflow:hidden;border-radius:14px;background:#f5f5f7}
.pm-media .pimg{width:100%;height:100%;aspect-ratio:auto;isolation:isolate;clip-path:inset(0 round 12px)}
.pimg>img,.pimg>svg{position:absolute!important;inset:-1px!important;width:calc(100% + 2px)!important;height:calc(100% + 2px)!important;max-width:none!important;object-fit:cover}.pimg::after{display:none!important}
.pm-media>img,.pm-photo{display:block;width:100%;height:100%;object-fit:cover}
.pm-media svg{display:block;width:100%;height:100%}
.pm .im>.pm-art{position:absolute;inset:0;padding:8px;border-radius:14px;background:#f5f5f7}
.pm-swatch .dot:has(.pm-media){background:#fff}
.pm-swatch .dot .pm-media,.pm-swatch .dot .pimg{border-radius:50%}
.pm :where(input[type=range]){min-height:44px}
.pm-frozen{pointer-events:none}
.pm-frozen .pm-o:not(.on){opacity:.38}
.pm-frozen:not(:has(.on)) .pm-o{opacity:.7}
.pm-chip{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 18px;min-height:44px;border-radius:999px;background:var(--card);border:2px solid transparent;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,.08);white-space:nowrap}
.pm-chip.on{background:var(--acc);color:var(--onacc);border-color:var(--acc);box-shadow:0 4px 12px rgba(0,0,0,.2)}
.pm-chip em{font-style:normal;font-size:12px;opacity:.75}
.pm-nm{font-size:15px;font-weight:800;line-height:1.25;text-wrap:balance;overflow-wrap:anywhere}
.pm-pr{font-size:20px;font-weight:800;letter-spacing:-.4px}
.pm-sm{font-size:12px;line-height:1.4;opacity:.65}
.pm-badge{display:inline-block;align-self:flex-start;font-size:11px;font-weight:800;line-height:1.2;padding:4px 10px;border-radius:999px;background:var(--acc);color:var(--onacc)}`;
  const common = (el, cfg) => {
    el.cfg = cfg; el.frozen = false;
    el.freeze = () => { el.frozen = true; el.classList.add('pm-frozen'); el._fz && el._fz(); return el; };
    el.answer = (v, l) => { if (el.frozen) return; el.value = v; el.label = l; cfg.onAnswer && cfg.onAnswer(v, l, el); el.dispatchEvent(new CustomEvent('pm-answer', { detail: { value: v, label: l }, bubbles: true })); };
    el.pick = v => { const b = [...el.querySelectorAll('[data-v]')].find(x => x.dataset.v === String(v)); b && b.click(); };
  };
  function reg(name, css, build) {
    P[name] = function (cfg) {
      cfg = cfg || {}; inject('base', BASE); inject(name, css);
      const el = h('div', 'pm pm-' + name.toLowerCase()); el.dataset.pm = name;
      common(el, cfg);
      build(el, cfg);
      if (cfg.label) el.insertBefore(h('p', 'pm-lbl', esc(cfg.label)), el.firstChild);
      if (cfg.theme) P.theme(el, cfg.theme);
      if (cfg.className) el.classList.add(...cfg.className.split(' '));
      return el;
    };
  }
  /* single-select button list helper */
  function selectable(el, cfg, root, sel) {
    root.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => {
      if (el.frozen) return; root.querySelectorAll('[data-v]').forEach(x => x.classList.remove('on')); b.classList.add('on');
      const o = b._o; el.answer(o.v, o.l);
    }));
  }
  const btn = (o, cls, inner) => { const b = h('button', 'pm-o ' + cls, inner); b.dataset.v = attr(o.v); b._o = o; b.type = 'button'; return b; };

  /* ======================= QUESTIONS & INPUTS ======================= */
  reg('ChoiceChips', `.pm-choicechips .w{display:flex;flex-wrap:wrap;gap:8px}`, (el, c) => {
    const w = h('div', 'w'); (c.options || []).map(O).forEach(o => w.appendChild(btn(o, 'pm-chip', (o.i ? `<span>${o.i}</span>` : '') + esc(o.l) + (o.n ? `<em>${esc(o.n)}</em>` : ''))));
    el.appendChild(w); selectable(el, c, w);
  });

  reg('MultiTick', `.pm-multitick .w{display:flex;flex-direction:column;gap:8px}
.pm-multitick .tk{display:flex;align-items:center;gap:10px;width:100%;padding:0 16px;min-height:52px;border-radius:calc(var(--r)*.8);background:var(--card);border:2px solid transparent;text-align:left;font-size:15px}
.pm-multitick .tk .t{flex:1;min-width:0}.pm-multitick .tk em{font-style:normal;font-size:13px;opacity:.7}
.pm-multitick .bx{width:24px;height:24px;border-radius:8px;border:2px solid var(--acc);display:grid;place-items:center;flex:none;transition:background .2s}
.pm-multitick .bx svg{width:14px;height:14px;opacity:0;transition:opacity .2s}
.pm-multitick .tk.on{border-color:var(--acc)}.pm-multitick .tk.on .bx{background:var(--acc)}.pm-multitick .tk.on .bx svg{opacity:1}
.pm-multitick .go{margin-top:10px;width:100%;border-radius:999px;background:var(--acc);color:var(--onacc);font-size:16px}`, (el, c) => {
    const w = h('div', 'w'), sel = new Set(); const opts = (c.options || []).map(O);
    opts.forEach(o => { const b = btn(o, 'tk', `<span class="bx">${CHECK}</span><span class="t">${esc(o.l)}</span>${o.n ? `<em>${esc(o.n)}</em>` : ''}`);
      b.onclick = () => { if (el.frozen) return; b.classList.toggle('on'); b.classList.contains('on') ? sel.add(o) : sel.delete(o);
        if (c.instant) { el.answer([o.v], o.l); } };
      w.appendChild(b); });
    el.appendChild(w);
    if (!c.instant) { const g = h('button', 'go', esc(c.done || 'Done')); g.type = 'button'; g.onclick = () => { const a = opts.filter(o => sel.has(o)); el.answer(a.map(o => o.v), a.length ? a.map(o => o.l).join(' + ') : 'None'); }; el.appendChild(g); }
  });

  reg('AorB', `.pm-aorb .w{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pm-aorb .cd{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 12px 16px;border-radius:var(--r);background:var(--card);border:3px solid transparent;box-shadow:0 6px 16px rgba(0,0,0,.1);text-align:center;min-width:0}
.pm-aorb .cd .im{width:min(100%,112px);margin-bottom:2px}.pm-aorb .cd b{font-size:16px;line-height:1.15}.pm-aorb .cd>span:not(.im){font-size:12px;opacity:.65}
.pm-aorb .cd.on{border-color:var(--acc);background:var(--card);box-shadow:0 8px 20px rgba(0,0,0,.22)}.pm-aorb .cd.on b{color:var(--acc)}
.pm-aorb .cd.b2{background:var(--acc);color:var(--onacc)}.pm-aorb .cd.b2.on{border-color:var(--acc2)}.pm-aorb .cd.b2.on b{color:var(--onacc)}`, (el, c) => {
    const w = h('div', 'w'); (c.options || []).slice(0, 2).map(O).forEach((o, i) => w.appendChild(btn(o, 'cd' + (i ? ' b2' : ''), `<span class="im">${artHTML(o)}</span><b>${esc(o.l)}</b>${o.s ? `<span>${esc(o.s)}</span>` : ''}`)));
    el.appendChild(w); selectable(el, c, w);
  });

  reg('Slider', `.pm-slider .lb{display:flex;justify-content:space-between;font-size:13px;font-weight:800;margin-bottom:4px}
.pm-slider .r{display:flex;align-items:center;gap:14px}
.pm-slider input{-webkit-appearance:none;appearance:none;flex:1;min-width:0;height:44px;background:transparent;margin:0}
.pm-slider input::-webkit-slider-runnable-track{height:14px;border-radius:7px;background:linear-gradient(90deg,var(--acc) var(--p,50%),rgba(0,0,0,.14) var(--p,50%))}
.pm-slider input::-webkit-slider-thumb{-webkit-appearance:none;width:34px;height:34px;margin-top:-10px;border-radius:50%;background:var(--card);border:4px solid var(--acc);box-shadow:0 3px 10px rgba(0,0,0,.25)}
.pm-slider input::-moz-range-track{height:14px;border-radius:7px;background:rgba(0,0,0,.14)}.pm-slider input::-moz-range-progress{height:14px;border-radius:7px;background:var(--acc)}
.pm-slider input::-moz-range-thumb{width:26px;height:26px;border-radius:50%;background:var(--card);border:4px solid var(--acc)}
.pm-slider .go{flex:none;min-width:64px;border-radius:999px;background:var(--acc);color:var(--onacc);padding:0 20px;font-size:15px}
.pm-slider .val{text-align:center;font-size:13px;opacity:.7;min-height:18px}`, (el, c) => {
    const lo = c.lo || '', hi = c.hi || '', min = c.min || 0, max = c.max || 100;
    el.innerHTML = `<div class="lb"><span>${esc(lo)}</span><span>${esc(hi)}</span></div><div class="r"><input type="range" min="${min}" max="${max}" step="${c.step || 1}" value="${c.value != null ? c.value : (min + max) / 2}" aria-label="${esc(c.label || 'Value')}"><button class="go" type="button">${esc(c.confirm || 'Set')}</button></div><div class="val"></div>`;
    const i = el.querySelector('input'), v = el.querySelector('.val');
    const say = x => c.say ? c.say(+x) : (x <= min + (max - min) * .33 ? lo : x >= min + (max - min) * .67 ? hi : 'Balanced');
    const upd = () => { i.style.setProperty('--p', ((i.value - min) / (max - min) * 100) + '%'); v.textContent = say(i.value); };
    i.oninput = upd; upd();
    el.querySelector('.go').onclick = () => el.answer(+i.value, say(i.value));
    el.pick = x => { i.value = x; upd(); el.querySelector('.go').click(); };
    el._fz = () => { i.disabled = true; };
  });

  reg('Stepper', `.pm-stepper .r{display:flex;align-items:center;gap:10px;background:var(--card);border-radius:999px;padding:4px}
.pm-stepper .s{width:48px;height:48px;border-radius:50%;background:var(--acc);color:var(--onacc);font-size:26px;line-height:1;flex:none}
.pm-stepper .n{flex:1;text-align:center;font-size:22px;font-weight:800}.pm-stepper .n small{font-size:13px;opacity:.65;font-weight:700;margin-left:4px}
.pm-stepper .go{flex:none;border-radius:999px;background:#111;color:#fff;padding:0 16px;font-size:15px;margin-right:2px}`, (el, c) => {
    let n = c.value != null ? c.value : 1; const min = c.min != null ? c.min : 1, max = c.max || 99, st = c.step || 1;
    el.innerHTML = `<div class="r"><button class="s m" type="button" aria-label="Less">−</button><div class="n"></div><button class="s p" type="button" aria-label="More">+</button><button class="go" type="button">${esc(c.confirm || 'Done')}</button></div>`;
    const t = el.querySelector('.n'), upd = () => { t.innerHTML = n + `<small>${esc(c.unit || '')}</small>`; };
    el.querySelector('.m').onclick = () => { n = Math.max(min, n - st); upd(); }; el.querySelector('.p').onclick = () => { n = Math.min(max, n + st); upd(); };
    el.querySelector('.go').onclick = () => el.answer(n, n + (c.unit ? ' ' + c.unit : ''));
    el.pick = x => { n = x; upd(); el.querySelector('.go').click(); }; upd();
  });

  reg('Segmented', `.pm-segmented .w{display:flex;background:var(--card);border-radius:999px;padding:4px;position:relative}
.pm-segmented i{position:absolute;top:4px;bottom:4px;left:4px;background:var(--acc);border-radius:999px;transition:transform .35s cubic-bezier(.3,1.3,.5,1);box-shadow:0 3px 8px rgba(0,0,0,.2)}
.pm-segmented button{flex:1;position:relative;z-index:1;font-size:15px;padding:0 6px;min-width:0;border-radius:999px}.pm-segmented button.on{color:var(--onacc)}`, (el, c) => {
    const opts = (c.options || []).map(O), w = h('div', 'w'), ind = h('i'); w.appendChild(ind); ind.style.width = `calc((100% - 8px)/${opts.length})`;
    opts.forEach((o, k) => { const b = btn(o, '', esc(o.l)); b.addEventListener('click', () => { if (el.frozen) return; ind.style.transform = `translateX(${k * 100}%)`; }); w.appendChild(b); });
    el.appendChild(w); selectable(el, c, w); ind.style.opacity = 0;
    w.addEventListener('click', () => { ind.style.opacity = 1; }, true);
    if (c.value != null) { const k = opts.findIndex(o => o.v === c.value); if (k >= 0) { ind.style.opacity = 1; ind.style.transform = `translateX(${k * 100}%)`; w.children[k + 1].classList.add('on'); } }
  });

  reg('Carousel', `.pm-carousel .tr{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:12px calc(50% - 75px) 16px;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin:0 -2px}
.pm-carousel .tr::-webkit-scrollbar{display:none}
.pm-carousel .cd{flex:none;width:150px;scroll-snap-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 12px 14px;border-radius:var(--r);background:var(--card);border:3px solid transparent;box-shadow:0 6px 16px rgba(0,0,0,.1);transform:scale(.88);opacity:.7;transition:transform .3s,opacity .3s,border-color .3s}
.pm-carousel .cd.mid{transform:scale(1);opacity:1;border-color:var(--acc)}.pm-carousel .cd .im{width:100%}.pm-carousel .cd b{font-size:15px;text-align:center;line-height:1.15}.pm-carousel .cd>span:not(.im){font-size:12px;opacity:.65}
.pm-carousel .dots{display:flex;gap:8px;justify-content:center;margin:-4px 0 12px}.pm-carousel .dots i{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.25;transition:all .3s}.pm-carousel .dots i.on{opacity:1;width:18px;background:var(--acc);border-radius:4px}
.pm-carousel .go{width:100%;border-radius:999px;background:var(--acc);color:var(--onacc);font-size:16px}
.pm-frozen .pm-carousel .cd.mid,.pm-carousel.pm-frozen .cd.mid{border-color:transparent}.pm-carousel.pm-frozen .cd.on{border-color:var(--acc);opacity:1}`, (el, c) => {
    const opts = (c.items || c.options || []).map(O), tr = h('div', 'tr'), dots = h('div', 'dots');
    opts.forEach(o => { tr.appendChild(btn(o, 'cd', `<span class="im">${artHTML(o)}</span><b>${esc(o.l)}</b>${o.s ? `<span>${esc(o.s)}</span>` : ''}`)); dots.appendChild(h('i')); });
    const go = h('button', 'go', ''); go.type = 'button';
    el.append(tr, dots, go); let mid = 0, raf;
    const detect = () => { const r = tr.getBoundingClientRect(), cx = r.left + r.width / 2; let best = 1e9;
      [...tr.children].forEach((k, i) => { const q = k.getBoundingClientRect(), d = Math.abs(q.left + q.width / 2 - cx); if (d < best) { best = d; mid = i; } });
      [...tr.children].forEach((k, i) => k.classList.toggle('mid', i === mid)); [...dots.children].forEach((k, i) => k.classList.toggle('on', i === mid));
      el.mid = opts[mid] && opts[mid].v; go.textContent = (c.confirm || 'Pick') + ' · ' + (opts[mid] ? opts[mid].l : ''); c.onCentre && opts[mid] && c.onCentre(opts[mid].v, el); };
    tr.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(detect); }, { passive: true });
    tr.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => { if (el.frozen) return; tr.querySelectorAll('.cd').forEach(x => x.classList.remove('on')); b.classList.add('on'); el.answer(b._o.v, b._o.l); }));
    go.onclick = () => { const b = tr.children[mid]; b && b.click(); };
    setTimeout(detect, 0); requestAnimationFrame(detect); new ResizeObserver(detect).observe(tr);
    el.scrollTo = i => { const k = tr.children[i]; k && tr.scrollTo({ left: k.offsetLeft - (tr.clientWidth - k.offsetWidth) / 2, behavior: 'smooth' }); };
  });

  reg('Swatch', `.pm-swatch .w{display:flex;gap:8px;justify-content:space-between;padding-top:6px}
.pm-swatch .sw{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:4px 0;min-height:96px;position:relative}
.pm-swatch .dot{width:64px;height:64px;overflow:hidden;border-radius:50%;background:var(--sc);border:4px solid var(--card);box-shadow:0 4px 10px rgba(0,0,0,.2);transition:transform .3s cubic-bezier(.3,1.5,.5,1),box-shadow .3s;position:relative}
.pm-swatch .dot::after{content:"";position:absolute;inset:0;border-radius:50%;border:3px solid var(--acc);opacity:0;transform:scale(.8);transition:all .25s}
.pm-swatch .sw.on .dot{transform:scale(1.08)}.pm-swatch .sw.on .dot::after{opacity:1;transform:none}
.pm-swatch .sw span{font-size:13px;line-height:1.2;text-align:center}.pm-swatch .sw .tg{position:absolute;top:-6px;right:0;font-size:10px;padding:3px 8px;border-radius:9px;background:#111;color:#fff;font-weight:800}`, (el, c) => {
    const w = h('div', 'w'); (c.options || []).map(O).forEach(o => { const b = btn(o, 'sw', `<span class="dot" style="--sc:${esc(o.c)}">${o.product || o.img ? artHTML(o) : ''}</span><span>${esc(o.l)}</span>${o.tag ? `<i class="tg">${esc(o.tag)}</i>` : ''}`); w.appendChild(b); });
    el.appendChild(w); selectable(el, c, w);
  });

  reg('Toggle', `.pm-toggle .tg{display:flex;align-items:center;gap:12px;width:100%;padding:8px 16px;min-height:60px;border-radius:var(--r);background:var(--card);text-align:left;font-size:16px}
.pm-toggle .t{flex:1;min-width:0}.pm-toggle small{display:block;font-size:12px;opacity:.6;font-weight:600}
.pm-toggle .sw{flex:none;width:56px;height:32px;border-radius:16px;background:rgba(0,0,0,.2);position:relative;transition:background .25s}
.pm-toggle .sw::after{content:"";position:absolute;top:3px;left:3px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.3);transition:transform .3s cubic-bezier(.3,1.5,.5,1)}
.pm-toggle .tg.on .sw{background:var(--acc)}.pm-toggle .tg.on .sw::after{transform:translateX(24px)}
.pm-toggle .nb{margin-top:8px}.pm-toggle .nb.on{background:var(--acc);color:var(--onacc)}`, (el, c) => {
    const b = h('button', 'pm-o tg', `<span class="t">${esc(c.text || c.title || 'Yes?')}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</span><span class="sw"></span>`); b.type = 'button'; b.dataset.v = 'toggle';
    if (c.value) b.classList.add('on');
    b.onclick = () => { if (el.frozen) return; b.classList.toggle('on'); const on = b.classList.contains('on'); el.answer(on, on ? (c.yes || 'Yes') : (c.no || 'No')); };
    el.appendChild(b);
    if (c.noChip) { const n = h('button', 'pm-o pm-chip nb', esc(c.no || 'No')); n.type = 'button'; n.dataset.v = 'no'; n.onclick = () => { if (el.frozen) return; b.classList.remove('on'); n.classList.add('on'); el.answer(false, c.no || 'No'); }; el.appendChild(n); }
    el.pick = v => { if (b.classList.contains('on') !== !!v) b.click(); else el.answer(!!v, v ? (c.yes || 'Yes') : (c.no || 'No')); };
  });

  /* ======================= PRODUCTS ======================= */
  reg('ProductHero', `.pm-producthero .hero{background:var(--card);border-radius:calc(var(--r)*1.1);padding:14px;display:flex;align-items:center;gap:16px;box-shadow:0 8px 20px rgba(0,0,0,.12)}
.pm-producthero .im{width:124px;flex:none}.pm-producthero .hi{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:4px}
.pm-producthero .im{animation:pm-drop .6s .25s cubic-bezier(.3,1,.5,1) both}
@keyframes pm-drop{0%{opacity:0;transform:translateY(-36px)}60%{opacity:1;transform:translateY(6px)}80%{transform:translateY(-3px)}100%{transform:none}}`, (el, c) => {
    el.innerHTML = `<div class="hero"><div class="im">${artHTML(c)}</div><div class="hi">${c.badge ? `<span class="pm-badge">${esc(c.badge)}</span>` : ''}<div class="pm-nm">${esc(c.name)}</div><div class="pm-pr">${c.price != null ? won(c.price) : ''}</div>${c.sub ? `<div class="pm-sm">${esc(c.sub)}</div>` : ''}</div></div>`;
  });

  reg('ProductRow', `.pm-productrow .row{display:flex;align-items:center;gap:14px;width:100%;padding:12px 14px 12px 12px;border-radius:var(--r);background:var(--card);text-align:left;min-height:88px;border:3px solid transparent;box-shadow:0 4px 12px rgba(0,0,0,.08)}
.pm-productrow .im{width:64px;flex:none}.pm-productrow .t{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;align-items:flex-start}.pm-productrow .pm-nm{font-size:14px}.pm-productrow .pm-pr{font-size:16px}
.pm-productrow .go{flex:none;width:34px;height:34px;border-radius:50%;background:var(--acc);color:var(--onacc);display:grid;place-items:center;font-size:18px}
.pm-productrow .row.on{border-color:var(--acc)}`, (el, c) => {
    const inner = `<span class="im">${artHTML(c)}</span><span class="t">${c.badge ? `<span class="pm-badge">${esc(c.badge)}</span>` : ''}<span class="pm-nm">${esc(c.name)}</span><span class="pm-pr">${c.price != null ? won(c.price) : ''}${c.sub ? ` <span class="pm-sm">${esc(c.sub)}</span>` : ''}</span></span>`;
    if (c.tap) { const o = O({ v: c.value !== undefined ? c.value : 'row', l: c.say || c.name }); const b = btn(o, 'row', inner + `<span class="go">›</span>`); b.addEventListener('click', () => { if (el.frozen) return; b.classList.add('on'); el.answer(o.v, o.l); }); el.appendChild(b); }
    else el.appendChild(h('div', 'row', inner));
  });

  reg('ProductGrid', `.pm-productgrid .w{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pm-productgrid .tl{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 10px 14px;border-radius:var(--r);background:var(--card);border:3px solid transparent;box-shadow:0 4px 12px rgba(0,0,0,.08);min-width:0;position:relative}
.pm-productgrid .tl .im{width:100%;margin-bottom:6px}.pm-productgrid .tl .pm-nm{text-align:center;font-size:14px}.pm-productgrid .tl .pm-pr{font-size:15px}.pm-productgrid .tl.on{border-color:var(--acc)}
.pm-productgrid .tl .pm-badge{position:absolute;top:18px;left:18px;font-size:10px;padding:3px 8px;z-index:1;box-shadow:0 2px 6px rgba(0,0,0,.18)}`, (el, c) => {
    const w = h('div', 'w'); (c.items || c.options || []).map(O).forEach(o => w.appendChild(btn(o, 'tl', `${o.badge ? `<span class="pm-badge">${esc(o.badge)}</span>` : ''}<span class="im">${artHTML(o)}</span><span class="pm-nm">${esc(o.l)}</span>${o.price != null ? `<span class="pm-pr">${won(o.price)}</span>` : ''}${o.s ? `<span class="pm-sm">${esc(o.s)}</span>` : ''}`)));
    el.appendChild(w); selectable(el, c, w);
  });

  reg('Compare', `.pm-compare .w{display:grid;gap:12px;grid-template-columns:repeat(var(--n,2),minmax(0,1fr))}
.pm-compare .col{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;border-radius:var(--r);background:var(--card);box-shadow:0 4px 12px rgba(0,0,0,.08);position:relative;border:3px solid transparent;transition:border-color .25s}
.pm-compare .col.on{border-color:var(--acc)}.pm-compare .im{width:100%}.pm-compare .pm-nm{text-align:center;font-size:13px}.pm-compare .pm-pr{font-size:17px}
.pm-compare .sp{display:flex;flex-direction:column;gap:4px;align-items:center;margin:2px 0 8px}.pm-compare .sp i{font-style:normal;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.07)}
.pm-compare .go{width:100%;border-radius:999px;background:var(--acc);color:var(--onacc);font-size:14px;margin-top:auto}
.pm-compare .col .pm-badge{position:absolute;top:20px;left:20px;z-index:1;box-shadow:0 2px 6px rgba(0,0,0,.18)}`, (el, c) => {
    const w = h('div', 'w'); const items = (c.items || []).map(O); w.style.setProperty('--n', items.length);
    items.forEach(o => { const col = h('div', 'col');
      col.innerHTML = `${o.badge ? `<span class="pm-badge">${esc(o.badge)}</span>` : ''}<span class="im">${artHTML(o)}</span><span class="pm-nm">${esc(o.l)}</span><span class="pm-pr">${o.price != null ? won(o.price) : ''}</span><span class="sp">${(o.specs || []).map(s => `<i>${esc(s)}</i>`).join('')}</span>`;
      const b = btn(o, 'go', esc(c.cta || 'Pick')); b.addEventListener('click', () => { if (el.frozen) return; w.querySelectorAll('.col').forEach(x => x.classList.remove('on')); col.classList.add('on'); el.answer(o.v, o.say || o.l); });
      col.appendChild(b); w.appendChild(col); });
    el.appendChild(w);
  });

  reg('Bundle', `.pm-bundle .bx{background:var(--card);border-radius:var(--r);padding:8px 14px;box-shadow:0 4px 12px rgba(0,0,0,.08)}
.pm-bundle .it{display:flex;align-items:center;gap:14px;padding:10px 0;min-height:72px}.pm-bundle .it+.it{border-top:1px dashed rgba(128,128,128,.35)}
.pm-bundle .im{width:52px;flex:none}.pm-bundle .t{flex:1;min-width:0}.pm-bundle .pm-nm{font-size:14px}.pm-bundle .pm-pr{font-size:15px}
.pm-bundle .tt{display:flex;justify-content:space-between;align-items:baseline;padding:4px 14px 0;font-weight:800}.pm-bundle .tt b{font-size:24px;letter-spacing:-.5px;color:var(--acc)}`, (el, c) => {
    const bx = h('div', 'bx'), tt = h('div', 'tt'); el.append(bx, tt);
    el.set = (items, total) => { bx.innerHTML = items.map(i => `<div class="it"><span class="im">${artHTML(i)}</span><span class="t"><div class="pm-nm">${esc(i.name)}</div>${i.sub ? `<div class="pm-sm">${esc(i.sub)}</div>` : ''}</span><span class="pm-pr">${won(i.price)}</span></div>`).join('');
      tt.innerHTML = `<span>${esc(c.totalLabel || 'Total')}</span><b>${won(total != null ? total : items.reduce((a, i) => a + i.price, 0))}</b>`; };
    el.set(c.items || [], c.total);
  });

  /* ======================= SIGNALS ======================= */
  reg('RatingTap', `.pm-ratingtap .r{display:flex;align-items:center;gap:12px;background:var(--card);border-radius:var(--r);padding:12px 14px}
.pm-ratingtap .im{width:56px;flex:none}.pm-ratingtap .t{flex:1;min-width:0}.pm-ratingtap .b{flex:none;width:52px;height:52px;border-radius:50%;font-size:24px;display:grid;place-items:center;background:rgba(0,0,0,.08);transition:all .3s cubic-bezier(.3,1.6,.5,1)}
.pm-ratingtap .b.love{color:#e8337a}.pm-ratingtap .b.love.on{background:#e8337a;color:#fff;transform:scale(1.15)}.pm-ratingtap .b.nope.on{background:#111;color:#fff;transform:scale(1.15)}`, (el, c) => {
    const r = h('div', 'r', `<span class="im">${artHTML(c)}</span><span class="t"><div class="pm-nm">${esc(c.name)}</div>${c.sub ? `<div class="pm-sm">${esc(c.sub)}</div>` : ''}</span>`);
    const b1 = btn(O({ v: 'nope', l: 'Nope' }), 'b nope', '✕'), b2 = btn(O({ v: 'love', l: 'Love' }), 'b love', '♥'); b1.setAttribute('aria-label', 'Nope'); b2.setAttribute('aria-label', 'Love');
    r.append(b1, b2); el.appendChild(r); selectable(el, c, r);
  });

  reg('TierList', `.pm-tierlist .w{display:flex;flex-direction:column;gap:8px}
.pm-tierlist .tr{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border-radius:var(--r);background:var(--card);padding:0 14px 0 0;min-height:56px;overflow:hidden;border:3px solid transparent}
.pm-tierlist .bd{flex:none;width:56px;align-self:stretch;display:grid;place-items:center;font-size:24px;background:var(--tc,var(--acc))}.pm-tierlist .t{flex:1;min-width:0;font-size:16px}.pm-tierlist small{display:block;font-size:12px;opacity:.6;font-weight:600}
.pm-tierlist .tr.on{border-color:var(--tc,var(--acc))}`, (el, c) => {
    const w = h('div', 'w'); (c.options || []).map(O).forEach(o => { const b = btn(o, 'tr', `<span class="bd">${o.e || ''}</span><span class="t">${esc(o.l)}${o.s ? `<small>${esc(o.s)}</small>` : ''}</span>`); if (o.c) b.style.setProperty('--tc', o.c); w.appendChild(b); });
    el.appendChild(w); selectable(el, c, w);
  });

  reg('ThisOrThat', `.pm-thisorthat .w{position:relative;display:flex;flex-direction:column;gap:12px}
.pm-thisorthat .tt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border-radius:var(--r);padding:12px 16px 12px 12px;min-height:80px;background:var(--card);border:3px solid transparent;box-shadow:0 4px 12px rgba(0,0,0,.08)}
.pm-thisorthat .tt.b2{background:var(--acc);color:var(--onacc)}.pm-thisorthat .im{width:56px;flex:none}.pm-thisorthat .t{flex:1;min-width:0;font-size:16px}.pm-thisorthat small{display:block;font-size:12px;opacity:.7;font-weight:600}
.pm-thisorthat .tt.on{border-color:var(--acc2);transform:scale(1.02)}
.pm-thisorthat .vs{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:var(--acc2);color:#111;font-size:11px;font-weight:900;display:grid;place-items:center;border:3px solid #fff;pointer-events:none;z-index:2}`, (el, c) => {
    const w = h('div', 'w'); (c.options || []).slice(0, 2).map(O).forEach((o, i) => w.appendChild(btn(o, 'tt' + (i ? ' b2' : ''), `<span class="im">${artHTML(o)}</span><span class="t">${esc(o.l)}${o.s ? `<small>${esc(o.s)}</small>` : ''}</span>`)));
    w.appendChild(h('span', 'vs', 'VS')); el.appendChild(w); selectable(el, c, w);
  });

  reg('PathTrail', `.pm-pathtrail .w{display:flex;align-items:flex-start}
.pm-pathtrail .st{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;font-size:12px;font-weight:800;min-width:0;text-align:center}
.pm-pathtrail .st::before{content:"";position:absolute;top:13px;right:50%;width:100%;height:4px;background:rgba(0,0,0,.15);z-index:0}.pm-pathtrail .st:first-child::before{display:none}
.pm-pathtrail .st.on::before{background:var(--acc)}
.pm-pathtrail .d{width:28px;height:28px;border-radius:50%;background:var(--card);border:4px solid rgba(0,0,0,.15);position:relative;z-index:1;display:grid;place-items:center;font-size:12px;transition:all .4s}
.pm-pathtrail .st.on .d{background:var(--acc);border-color:var(--acc);color:var(--onacc)}.pm-pathtrail .st.cur .d{box-shadow:0 0 0 5px rgba(255,255,255,.55)}.pm-pathtrail .st span{padding:0 2px;overflow-wrap:anywhere}`, (el, c) => {
    const w = h('div', 'w'); el.appendChild(w);
    el.set = i => { w.innerHTML = (c.steps || []).map((s, k) => `<div class="st${k <= i ? ' on' : ''}${k === i ? ' cur' : ''}"><i class="d">${k < i ? '✓' : ''}</i><span>${esc(s)}</span></div>`).join(''); el.at = i; };
    el.set(c.at || 0);
  });

  reg('ProgressMeter', `.pm-progressmeter .tp{display:flex;justify-content:space-between;font-size:13px;font-weight:800;margin-bottom:6px}
.pm-progressmeter .bar{height:16px;border-radius:8px;background:rgba(0,0,0,.14);overflow:hidden}.pm-progressmeter .bar i{display:block;height:100%;width:0;border-radius:8px;background:linear-gradient(90deg,var(--acc),var(--acc2));transition:width .6s cubic-bezier(.3,1.2,.5,1)}`, (el, c) => {
    const max = c.max || 100, fmt = c.fmt || (v => v + ' / ' + max); el.innerHTML = `<div class="tp"><span>${esc(c.text || '')}</span><span class="v"></span></div><div class="bar"><i></i></div>`;
    el.set = v => { el.querySelector('i').style.width = Math.min(100, v / max * 100) + '%'; el.querySelector('.v').textContent = fmt(v, max); el.valueNow = v; };
    setTimeout(() => el.set(c.value || 0), 30);
  });

  /* ======================= COMMERCE ======================= */
  const shipCss = `.pm-shipit .ship{position:relative;overflow:hidden;width:100%;min-height:62px;border-radius:31px;background:linear-gradient(180deg,#ff4a4f,#e52528);color:#fff;font-weight:900;font-size:20px;letter-spacing:-.3px;box-shadow:0 8px 18px rgba(229,37,40,.4);display:flex;align-items:center;justify-content:center;animation:pm-pulse 2.2s ease-in-out infinite}
.pm-shipit .ship:disabled{opacity:.4;animation:none;box-shadow:none}
@keyframes pm-pulse{50%{box-shadow:0 8px 26px rgba(229,37,40,.62)}}
.pm-shipit .rk{position:absolute;left:18px;top:50%;margin-top:-12px;width:24px;height:24px;transform:rotate(45deg)}
.pm-shipit .tr{position:absolute;left:0;top:50%;height:6px;margin-top:-3px;width:0;background:linear-gradient(90deg,transparent,#fff);border-radius:3px;opacity:0}
.pm-shipit .ship.fly{animation:none;pointer-events:none}.pm-shipit .ship.fly .t{opacity:0;transition:opacity .15s}
.pm-shipit .ship.fly .rk{animation:pm-zoom .6s cubic-bezier(.6,0,.9,.5) forwards}.pm-shipit .ship.fly .tr{animation:pm-tr .6s ease-out forwards}
@keyframes pm-zoom{0%{left:18px;transform:rotate(45deg)}30%{left:24px;transform:rotate(90deg) scale(1.3)}100%{left:calc(100% + 30px);transform:rotate(90deg) scale(1.3)}}
@keyframes pm-tr{0%{width:0;opacity:.9}100%{width:100%;opacity:0}}
.pm-shipit .cap{text-align:center;font-size:12px;font-weight:700;opacity:.75;margin-top:10px}
.pm-shipit.gone{display:none}
.pm-receipt .rc{background:#0b2f29;color:#fff;border-radius:22px;padding:12px 12px 12px 14px;display:flex;align-items:center;gap:14px;animation:pm-fade .4s both;min-width:0;transition:opacity .3s}
@keyframes pm-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.pm-receipt .ths{display:flex;flex:none}.pm-receipt .th{width:44px;height:44px;border-radius:12px;background:#f5f5f7;box-shadow:0 0 0 2px #0b2f29;display:block;overflow:hidden;position:relative}.pm-receipt .th+.th{margin-left:-8px}.pm-receipt .th>.pm-art{padding:4px}
.pm-receipt .ri{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.pm-receipt .ri b{font-size:18px;letter-spacing:-.3px}.pm-receipt .ri span{font-size:12px;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pm-receipt .undo{flex:none;padding:0 18px;border-radius:22px;background:rgba(255,255,255,.16);font-weight:700;color:#fff}
.pm-receipt.undone .ri b{text-decoration:line-through;opacity:.6}.pm-receipt.undone .th{opacity:.5}`;
  const mkReceipt = (c, onUndo) => {
    const r = h('div', 'pm pm-receipt'); const th = (c.items || []).map(i => `<span class="th">${artHTML(i)}</span>`).join('');
    r.innerHTML = `<div class="rc"><div class="ths">${th}</div><div class="ri"><b>${won(c.total)}${c.note ? ' · ' + esc(c.note) : ''}</b><span>${esc(c.eta || 'Rocket · tomorrow 7am')}</span></div><button class="undo" type="button">${esc(c.undo || 'Undo')}</button></div>`;
    r.querySelector('.undo').onclick = () => onUndo && onUndo(r); return r;
  };
  reg('Receipt', shipCss, (el, c) => {
    el.innerHTML = mkReceipt(c).innerHTML; el.classList.add('pm-receipt');
    const u = el.querySelector('.undo'); el.undone = false;
    el.setUndone = f => { el.undone = f; el.classList.toggle('undone', f); u.textContent = f ? (c.redo || 'Redo') : (c.undo || 'Undo'); };
    u.onclick = () => { const f = !el.undone; el.setUndone(f); c.onAnswer && c.onAnswer(f ? 'undo' : 'redo', f ? 'Undo' : 'Redo', el); c.onUndo && c.onUndo(f, el); el.dispatchEvent(new CustomEvent('pm-answer', { detail: { value: f ? 'undo' : 'redo' }, bubbles: true })); };
    el.pick = () => u.click();
    el.answer = () => {}; // receipt toggles itself; not frozen by answers
  });
  reg('ShipIt', shipCss, (el, c) => {
    let total = c.total || 0, items = c.items || [];
    el.innerHTML = `<button class="ship" type="button"><i class="tr"></i>${ROCKET}<span class="t"></span></button><div class="cap"></div>`;
    const b = el.querySelector('.ship'), t = el.querySelector('.t'), cap = el.querySelector('.cap');
    const paint = () => { t.textContent = items.length || total ? 'Ship it · ' + won(total) : 'Ship it'; b.disabled = !total; cap.textContent = total ? (c.caption || (items.length + (items.length > 1 ? ' items' : ' item') + ' · tomorrow 7am')) : ''; };
    el.set = (tot, its) => { total = tot; if (its) items = its; paint(); }; paint();
    let busy = false;
    b.onclick = () => {
      if (el.frozen || busy || b.disabled) return; busy = true; b.classList.add('fly');
      const snap = { items, total };
      el.answer('ship', 'Ship it');
      setTimeout(() => {
        const note = c.note && (typeof c.note === 'function' ? c.note() : c.note);
        if (c.morph === false) { el.classList.add('gone'); c.onShipped && c.onShipped(snap, el); return; }
        const built = [...el.childNodes];
        const rc = mkReceipt({ items: snap.items, total: snap.total, eta: c.eta, note }, () => { el.replaceChildren(...built); el.classList.remove('done'); busy = false; b.classList.remove('fly'); c.onUndo && c.onUndo(); });
        el.replaceChildren(rc); el.classList.add('done'); c.onShipped && c.onShipped(snap, el);
      }, 620);
    };
    el.reset = () => { busy = false; b.classList.remove('fly'); el.classList.remove('gone'); };
    el.pick = () => b.click();
  });

  reg('Subscription', `.pm-subscription .w{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pm-subscription .w .pm-chip{padding:0 18px}.pm-subscription .nx{margin-top:10px;font-size:12px;font-weight:700;opacity:.7;min-height:16px}`, (el, c) => {
    const w = h('div', 'w'), nx = h('div', 'nx', esc(c.hint || '')); const opts = (c.options || [4, 6, 8]).map(x => typeof x === 'number' ? { v: x, l: x + 'w' } : O(x));
    opts.forEach(o => {const b=btn(o, 'pm-chip', esc(o.l));if(o.v===c.value){b.classList.add('on');b.setAttribute('aria-pressed','true')}w.appendChild(b)});
    el.append(w, nx);
    w.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => {
      if (el.frozen) return; w.querySelectorAll('[data-v]').forEach(x => x.classList.remove('on')); b.classList.add('on');
      const d = new Date(); d.setDate(d.getDate() + 1 + b._o.v * 7); nx.textContent = 'Next · ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      el.answer(b._o.v, 'Every ' + b._o.l); }));
  });

  reg('PriceTag', `.pm-pricetag{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap}
.pm-pricetag .p{font-size:26px;font-weight:800;letter-spacing:-.6px}.pm-pricetag s{font-size:14px;opacity:.55}
.pm-pricetag .d{font-size:13px;font-weight:800;padding:4px 10px;border-radius:999px;color:#fff;background:#12a150}.pm-pricetag .d.up{background:#e5500b}`, (el, c) => {
    const dl = c.delta; el.innerHTML = `<span class="p">${won(c.price)}</span>${c.was ? `<s>${won(c.was)}</s>` : ''}${dl ? `<span class="d${dl > 0 ? ' up' : ''}">${dl > 0 ? '▲ +' : '▼ −'}${won(Math.abs(dl)).replace('₩', '₩')}</span>` : ''}`;
  });

  reg('DiffList', `.pm-difflist .w{background:var(--card);border-radius:var(--r);padding:6px 14px}
.pm-difflist .rw{display:flex;align-items:center;gap:12px;min-height:52px}.pm-difflist .rw+.rw{border-top:1px dashed rgba(128,128,128,.35)}
.pm-difflist .k{flex:none;width:26px;height:26px;border-radius:9px;display:grid;place-items:center;font-weight:900;color:#fff;background:#12a150}.pm-difflist .k.m{background:#e53e3e}.pm-difflist .k.c{background:#f0a000}
.pm-difflist .l{flex:1;min-width:0;font-size:14px;font-weight:700;overflow-wrap:anywhere}.pm-difflist .m .l,.pm-difflist .l.m{text-decoration:line-through;opacity:.6}.pm-difflist .r{font-size:14px;font-weight:800;flex:none}`, (el, c) => {
    const w = h('div', 'w'); el.appendChild(w);
    el.set = rows => { w.innerHTML = rows.map(r => { const k = r.k === '-' ? 'm' : r.k === '~' ? 'c' : 'p'; return `<div class="rw"><span class="k ${k}">${r.k === '-' ? '−' : r.k}</span><span class="l ${k === 'm' ? 'm' : ''}">${esc(r.l)}</span><span class="r">${esc(r.r || '')}</span></div>`; }).join(''); };
    el.set(c.rows || []);
  });

  /* ======================= FEEDBACK ======================= */
  reg('FeedbackBar', `.pm-feedbackbar .w{display:flex;flex-wrap:wrap;gap:8px}
.pm-feedbackbar .pm-chip{background:transparent;border:2px solid currentColor;box-shadow:none;font-size:14px;opacity:.85;padding:0 18px}.pm-feedbackbar .pm-chip.on{background:var(--acc);border-color:var(--acc);opacity:1}`, (el, c) => {
    const w = h('div', 'w'); (c.options || []).map(O).forEach(o => w.appendChild(btn(o, 'pm-chip', (o.i ? `<span>${o.i}</span>` : '') + esc(o.l)))); el.appendChild(w); selectable(el, c, w);
  });

  reg('NotThis', `.pm-notthis .it{display:flex;align-items:center;gap:14px;margin-bottom:12px}.pm-notthis .im{width:52px;flex:none}.pm-notthis .t{flex:1;min-width:0}
.pm-notthis .w{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pm-notthis .w .pm-chip{justify-content:center;padding:0 8px;font-size:14px}.pm-notthis .w .pm-chip:last-child{color:#d93636}.pm-notthis .w .pm-chip.on{color:var(--onacc)}`, (el, c) => {
    el.innerHTML = `<div class="it"><span class="im">${artHTML(c)}</span><span class="t"><div class="pm-nm">${esc(c.name)}</div>${c.sub ? `<div class="pm-sm">${esc(c.sub)}</div>` : ''}</span></div>`;
    const w = h('div', 'w'); (c.actions || ['Swap', 'Cheaper', 'Remove']).map(O).forEach(o => { const b = btn(o, 'pm-chip', esc(o.l)); w.appendChild(b); b._o = Object.assign({}, o, { l: o.l + (c.noun ? ' ' + c.noun : '') }); });
    el.appendChild(w); selectable(el, c, w);
  });

  reg('UndoToast', `.pm-undotoast .tt{display:flex;align-items:center;gap:8px;background:#161616;color:#fff;border-radius:999px;padding:0 6px 0 18px;min-height:48px;position:relative;overflow:hidden;animation:pm-fade .35s both}
.pm-undotoast .tt span{flex:1;min-width:0;font-size:14px;font-weight:700}.pm-undotoast .tt button{flex:none;padding:0 16px;border-radius:999px;color:var(--acc2);font-size:14px}
.pm-undotoast .cd{position:absolute;left:0;bottom:0;height:3px;background:var(--acc2);width:100%}`, (el, c) => {
    el.innerHTML = `<div class="tt"><span>${esc(c.text || 'Removed')}</span><button class="pm-o" type="button" data-v="undo">${esc(c.action || 'Undo')}</button>${c.ms ? '<i class="cd"></i>' : ''}</div>`;
    el.querySelector('button')._o = { v: 'undo', l: c.action || 'Undo' };
    el.querySelector('button').onclick = () => { el.answer('undo', c.action || 'Undo'); el.remove(); };
    if (c.ms) { const bar = el.querySelector('.cd'); bar.style.transition = `width ${c.ms}ms linear`; requestAnimationFrame(() => requestAnimationFrame(() => bar.style.width = '0')); setTimeout(() => { if (!el.frozen && el.isConnected) { el.remove(); c.onExpire && c.onExpire(); } }, c.ms); }
  });

  /* ======================= LAYOUT ======================= */
  reg('SceneHeader', `.pm-sceneheader{height:var(--sh,64px);overflow:hidden;position:relative}
.pm-sceneheader svg{position:absolute;inset:0;width:100%;height:100%}.pm-sceneheader b{position:absolute;left:16px;bottom:8px;font-size:20px;font-weight:900;letter-spacing:-.4px}
.pm-sceneheader.t svg{-webkit-mask-image:linear-gradient(to top,transparent 0 38px,#000 50px),linear-gradient(to right,transparent 0 210px,#000 240px);mask-image:linear-gradient(to top,transparent 0 38px,#000 50px),linear-gradient(to right,transparent 0 210px,#000 240px)}`, (el, c) => {
    if (c.height) el.style.setProperty('--sh', c.height + 'px');
    const s = (P.scenes[c.scene] || P.scenes.bubbles)(); el.innerHTML = s + (c.title ? `<b>${esc(c.title)}</b>` : ''); el.classList.toggle('t', !!c.title);
  });

  reg('Block', `.pm-block{--bl-r:0px;padding:16px;margin:12px 0;background:var(--bg);color:var(--fg);border-radius:var(--bl-r);overflow:hidden;opacity:0;animation:pm-in .45s cubic-bezier(.22,1,.36,1) forwards;display:flex;flex-direction:column;gap:16px;transition:opacity .4s}
@keyframes pm-in{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:none}}
.pm-block.noanim{animation:none;opacity:1}
.pm-block.l-bleed{margin-left:calc(-1*var(--pad,14px));margin-right:calc(-1*var(--pad,14px));max-width:none;width:calc(100% + 2*var(--pad,14px))}
.pm-block.l-card{--bl-r:28px;box-shadow:0 10px 26px rgba(0,0,0,.14)}
.pm-block.l-blob{--bl-r:28px;box-shadow:0 10px 26px rgba(0,0,0,.12)}
.pm-block.l-ticket{--bl-r:18px;border:2px dashed var(--acc)}
.pm-block.l-plain{background:transparent;padding:0;--bl-r:0}
.pm-block>.pm-sceneheader{margin:-16px -16px 0;flex:none;max-width:none;width:calc(100% + 32px)}.pm-block.l-ticket>.pm-sceneheader{margin:-16px -16px 0}.pm-block.l-plain>.pm-sceneheader{margin:0;width:100%}
.pm-block>.pm-lbl{margin:0 0 -6px}
.pm-block.pm-frozen{opacity:.82}
.pm-block>*{flex:none}`, (el, c) => {
    el.classList.add('l-' + (c.layout || 'bleed'));
    P.theme(el, c.theme || 'paper'); if (c.anim === false) el.classList.add('noanim');
    if (c.scene) el.appendChild(P.SceneHeader({ scene: c.scene, title: c.title, height: c.sceneHeight }));
    else if (c.title) el.appendChild(h('p', 'pm-lbl', esc(c.title)));
    el.kids = [];
    el.add = k => { el.appendChild(k); el.kids.push(k); return el; };
    (c.children || []).forEach(el.add);
    el._fz = () => el.kids.forEach(k => k.freeze && k.freeze());
  });

  reg('UserBubble', `.pm-userbubble{display:flex;justify-content:flex-end;margin:16px 0 8px;animation:pm-fade .3s both}
.pm-userbubble span{background:#f1f1f3;color:#111;border-radius:18px 18px 4px 18px;padding:10px 16px;font-size:15px;line-height:1.35;max-width:80%;overflow-wrap:anywhere}`, (el, c) => { el.innerHTML = '<span></span>'; el.firstChild.textContent = c.text || ''; });
})();
