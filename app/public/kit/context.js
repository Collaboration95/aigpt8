/* Context kit: visible, attributable inferences. No saved memory is mutated here. */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list = (v, max = 5) => Array.isArray(v) ? v.slice(0, max) : [];
  const text = v => typeof v === 'object' && v ? v.label || v.text || '' : String(v ?? '');
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function shell(cls, html) {
    const el = document.createElement('section'); el.className = `kx-root kx-${cls}`; el.innerHTML = html;
    el.freeze = () => { el.classList.add('kit-frozen'); el.querySelectorAll('button,input,summary').forEach(b => { b.disabled = true; b.setAttribute('aria-disabled','true'); if (b.tagName === 'SUMMARY') b.tabIndex = -1; }); el.getAnimations({subtree:true}).forEach(a => a.cancel()); };
    return el;
  }
  const eyebrow = s => `<div class="kx-eyebrow">${esc(s)}</div>`;
  const head = (small, big) => `${eyebrow(small)}<h3>${esc(big)}</h3>`;
  function button(action, key, label, title) { return `<button type="button" class="kx-action" data-action="${action}" data-key="${esc(key)}" aria-label="${esc(title || label)}">${esc(label)}</button>`; }
  const sourceIds = {bed:'bed-king',baby:'baby-monitor',room:'bed-curtain',toothpasteUsual:'tp-median'};
  function facts(args, ctx) {
    return list(args.facts).map(f => {
      const saved = ctx.memory?.explain?.(f.key) || {};
      return {...f, key:String(f.key || f.label || 'context'), label:String(f.label || saved.value || 'Saved preference'), because:String(f.because || saved.because || 'From this conversation'), source_product_id:f.source_product_id || sourceIds[f.key]};
    });
  }
  function photo(f, ctx) { const p = ctx.product(f.source_product_id); return p ? ctx.img(p, 'kx-photo') : '<span class="kx-symbol" aria-hidden="true">✦</span>'; }
  function provenance(f, ctx, img = false) {
    const p = ctx.product(f.source_product_id);
    const order = ctx.memory?.pastOrders?.find(o => o.items.some(i => i.id === f.source_product_id));
    return `<div class="kx-provenance">${img ? photo(f,ctx) : ''}<div><small>${esc(f.because)}</small>${p ? `<small class="kx-source">${esc(p.brand)} · ${esc(p.name)}${order ? `<br>${esc(order.source)}` : ''}</small>` : ''}</div></div>`;
  }
  function bind(el, ctx) {
    el.addEventListener('click', e => {
      if (el.classList.contains('kit-frozen')) { e.preventDefault(); return; }
      const b = e.target.closest('button[data-action]'); if (!b || b.disabled) return;
      const key = b.dataset.key, action = b.dataset.action;
      if (action === 'forget') {
        ctx.answer({forget:key}, `Forget ${b.dataset.label || key}`);
        const row = b.closest('[data-fact]'); if (row) { row.classList.add('kx-removed'); row.querySelectorAll('button').forEach(x => x.disabled = true); const status = row.querySelector('.kx-forgotten'); if (status) status.textContent = 'Forgotten'; }
      } else if (action === 'change') ctx.answer({change:key}, `Change ${b.dataset.label || key}`);
      else if (action === 'expand') { const detail = el.querySelector('.kx-detail'); detail.hidden = !detail.hidden; b.setAttribute('aria-expanded', String(!detail.hidden)); }
    });
    el.querySelectorAll('button[data-key]').forEach(b => { const row = b.closest('[data-fact]'); b.dataset.label = row?.dataset.label || b.dataset.key; });
    return el;
  }
  function register(name, description, renderers) { KIT.register(name, {group:'context',description,variants:renderers}); }

  const thinking = {};
  for (const variant of ['checklist','terminal','orbit','ring','scanner','toasts']) thinking[variant] = args => {
    const steps = list(args.steps?.length ? args.steps : ['Checking past orders','Connecting your context','Finding your fit']);
    const rows = steps.map((s,i) => `<div class="kx-step" style="--i:${i}"><span class="kx-step-mark" aria-hidden="true">${variant === 'terminal' ? '›' : variant === 'orbit' ? '✦' : '✓'}</span><span>${esc(text(s))}</span></div>`).join('');
    const ring = '<div class="kx-ring" aria-hidden="true"><span>✦</span></div>';
    const el = shell(`thinking kx-thinking-${variant}`, `${head('CONTEXT IN MOTION','Connecting the dots')}${variant === 'ring' || variant === 'orbit' ? ring : ''}<div class="kx-steps">${rows}</div><div class="kx-thinking-status" role="status" aria-live="polite">Using your context…</div>`);
    el.setAttribute('aria-busy','true');
    const duration = Math.max(800,Math.min(1500,Number(args.duration ?? args.ms) || 1100));
    el.style.setProperty('--kx-duration',`${duration}ms`);
    const timers = []; let finish;
    el.done = new Promise(resolve => {
      let completed = false;
      finish = () => { if (completed) return; completed = true; timers.forEach(clearTimeout); el.querySelectorAll('.kx-step').forEach(r => r.classList.add('kx-ready')); el.classList.add('kx-complete'); el.setAttribute('aria-busy','false'); el.querySelector('.kx-thinking-status').textContent = 'Context connected'; resolve(); };
      if (reduced()) { queueMicrotask(finish); return; }
      el.querySelectorAll('.kx-step').forEach((r,i) => timers.push(setTimeout(() => r.classList.add('kx-ready'), (i+1)*duration/(steps.length+1))));
      timers.push(setTimeout(finish,duration));
    });
    const freeze = el.freeze; el.freeze = () => { finish(); freeze(); };
    return el;
  };
  register('thinking_steps','Show a brief context-checking animation while preparing the next shopping turn.',thinking);

  const inference = {};
  for (const variant of ['badge','sticky','banner','bubble','chip','receipt']) inference[variant] = (args,ctx) => {
    const f = facts(args,ctx)[0] || facts({facts:[{key:args.key,label:args.label,because:args.because,source_product_id:args.source_product_id}]},ctx)[0];
    const edit = button('change',f.key,'Change',`Change ${f.label}`), forget = button('forget',f.key,'×',`Forget ${f.label}`);
    let html;
    if (variant === 'badge') html = `<div class="kx-row"><span class="kx-spark">✦</span><strong>${esc(f.label)}</strong>${edit}</div>${provenance(f,ctx)}`;
    if (variant === 'sticky') html = `${eyebrow('A LITTLE CONTEXT')}<h3>${esc(f.label)}</h3>${provenance(f,ctx)}<div class="kx-actions">${edit}${forget}</div>`;
    if (variant === 'banner') html = `<div class="kx-row"><span class="kx-symbol">✦</span><div>${eyebrow('WE ASSUMED')}<strong>${esc(f.label)}</strong></div>${edit}</div>${provenance(f,ctx)}`;
    if (variant === 'bubble') html = `${eyebrow('WHY THIS DEFAULT?')}<h3>${esc(f.label)}</h3>${provenance(f,ctx)}${edit}`;
    if (variant === 'chip') html = `<div class="kx-row"><span class="kx-spark">✦</span><strong>${esc(f.label)}</strong>${forget}</div>${provenance(f,ctx)}${edit}`;
    if (variant === 'receipt') html = `${eyebrow('FROM YOUR ORDER HISTORY')}${provenance(f,ctx,true)}<div class="kx-row kx-receipt-bottom"><strong>↳ ${esc(f.label)}</strong>${edit}${forget}</div>`;
    const el = shell(`inference kx-inference-${variant}`,`<div data-fact data-label="${esc(f.label)}">${html}<span class="kx-forgotten" role="status"></span></div>`);
    return bind(el,ctx);
  };
  register('note_inference','Use when applying one inferred default; show the source and let the customer correct or forget it.',inference);

  const recap = {};
  for (const variant of ['profile','sources','cloud','timeline','home']) recap[variant] = (args,ctx) => {
    const fs = facts(args,ctx);
    const rows = fs.map((f,i) => `<div class="kx-fact" data-fact data-label="${esc(f.label)}"><div class="kx-fact-body">${variant === 'home' ? `<span class="kx-room-icon" aria-hidden="true">${({bed:'🛏',baby:'🧸',room:'🪟',toothpasteUsual:'🪥'})[f.key] || '✦'}</span>` : variant === 'sources' ? photo(f,ctx) : variant === 'timeline' ? `<span class="kx-node">${String(i+1).padStart(2,'0')}</span>` : ''}<div><strong>${esc(f.label)}</strong>${provenance(f,ctx)}</div></div>${button('forget',f.key,'×',`Forget ${f.label}`)}<span class="kx-forgotten" role="status"></span></div>`).join('');
    return bind(shell(`recap kx-recap-${variant}`,`${variant === 'profile' ? '<div class="kx-avatar" aria-hidden="true">G<span>✦</span></div>' : ''}${head('YOUR CONTEXT',variant === 'home' ? 'A little map of home' : variant === 'timeline' ? 'Past orders, present fit' : 'Remembered for this turn')}<div class="kx-facts">${rows}</div><small class="kx-footnote">You decide what stays.</small>`),ctx);
  };
  register('memory_recap','Use when two to five saved facts materially affect this turn; show sources and individual forget controls.',recap);

  const moods = [
    [/night|bed|sleep/i,'A softer night','Your bedroom, considered.','☾','bed-king','bed-curtain','night'],
    [/camp|sun|outdoor/i,'A little further out','Make room for the outdoors.','☀','net-single','kitchen-3','camp'],
    [/bath|fresh|tooth/i,'A fresh little reset','Everyday, made effortless.','✧','tp-median','tb-soft','fresh'],
    [/snack|cozy/i,'Stay in. Settle in.','Small comforts, all yours.','☕','snack-1','drink-7','cozy'],
    [/rain/i,'Rain outside. Cozy inside.','A good day to stay in.','☂','bed-curtain','bed-king','rain'],
    [/winter|snow/i,'Warm up your winter','A warmer kind of everyday.','❄','bed-curtain','bed-king','winter'],
    [/gift/i,'For someone special','A little thought goes a long way.','🎁','kitchen-8','beauty-6','gift']
  ];
  function illustration(kind) {
    const common = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    const drawing = kind === 'night' || kind === 'cozy' ? '<path d="M38 117V77q0-9 9-9h80q9 0 9 9v40M38 96h98M48 117v10m78-10v10M49 79h26v13H49zM99 79h26v13H99z"/><path d="M149 21a18 18 0 1 0 20 22 17 17 0 0 1-20-22Z"/><path d="M164 67v9m-4-5h8"/>' : kind === 'camp' ? '<path d="m30 122 62-83 62 83Zm62-83v83m0-50 36 50M20 123h153M134 56l13-27 14 27m-14-27v67"/><circle cx="48" cy="30" r="13"/>' : kind === 'gift' ? '<path d="M48 70h92v57H48zM42 54h104v19H42zM94 54v73M94 54C55 54 60 20 79 30q15 8 15 24Zm0 0c39 0 34-34 15-24Q94 38 94 54Z"/>' : kind === 'fresh' ? '<path d="M46 73h105q-2 44-52 44T46 73ZM57 118v9m84-9v9M83 68V43q0-23 22-23 20 0 20 20m-9 0h18"/><path d="m40 25 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z"/>' : '<path d="M34 78q55-89 112 0H34Zm56 0v40q0 18 16 9M47 96l-5 9m93-9-5 9M61 116l-5 9"/><path d="m142 26 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z"/>';
    return `<svg class="kx-illustration" viewBox="0 0 190 150" aria-hidden="true"><circle cx="95" cy="75" r="69" fill="currentColor" opacity=".055"/><g ${common}>${drawing}</g></svg>`;
  }
  const scenes = {};
  for (const variant of ['illustration','emoji','particles','collage','poster']) scenes[variant] = (args,ctx) => {
    const mood = moods.find(m => m[0].test(args.scene || '')) || moods[0];
    const [,title,subtitle,emoji,p1,p2,kind] = mood;
    let art = '';
    if (variant === 'illustration') art = illustration(kind);
    if (variant === 'emoji') art = `<span class="kx-big-emoji" aria-hidden="true">${emoji}</span>`;
    if (variant === 'particles') art = `<div class="kx-particles" aria-hidden="true">${Array.from({length:9},(_,i) => `<span style="--i:${i};left:${8+(i*29)%85}%;top:${8+(i*17)%77}%">${emoji}</span>`).join('')}</div>`;
    if (variant === 'collage') { const products = [ctx.product(p1),ctx.product(p2)].filter(Boolean); art = `<div class="kx-collage">${products.map(p => `<figure>${ctx.img(p,'kx-scene-photo')}<figcaption>${esc(p.brand)}<br>${esc(p.name)} · ${ctx.won(p.price)}</figcaption></figure>`).join('')}</div>`; }
    if (variant === 'poster') art = '<div class="kx-accent-shape" aria-hidden="true">✳</div>';
    return shell(`scene kx-scene-${variant}`,`${eyebrow(String(args.scene || 'night bedroom').replace(/[_-]/g,' '))}<h2>${esc(args.title || title)}</h2><p>${esc(args.subtitle || subtitle)}</p>${art}`);
  };
  register('scene_header','Use at the start of a shopping turn to set a relevant mood from a scene keyword, without adding a question.',scenes);

  const paths = {};
  for (const variant of ['trail','stepper','map','breadcrumbs','battery']) paths[variant] = args => {
    const stages = list(args.stages?.length ? args.stages : ['Weather','Vibe','Size','Done'],8).map(text);
    const stage = typeof args.stage === 'number' ? Math.max(0,Math.min(stages.length-1,Math.floor(args.stage))) : Math.max(0,stages.indexOf(args.stage));
    const rows = stages.map((s,i) => `<li class="${i < stage ? 'kx-past' : i === stage ? 'kx-current' : ''}" ${i === stage ? 'aria-current="step"' : ''}><span class="kx-path-node">${i < stage ? '✓' : i+1}</span><span>${esc(s)}</span></li>`).join('');
    const html = `${eyebrow(`YOUR PATH · ${stage+1} OF ${stages.length}`)}${variant === 'battery' ? `<div class="kx-battery" role="progressbar" aria-label="Shopping journey" aria-valuemin="0" aria-valuemax="${stages.length}" aria-valuenow="${stage+1}">${stages.map((s,i) => `<span class="${i <= stage ? 'kx-charged' : ''}"></span>`).join('')}</div><h3>${esc(stages[stage])}</h3>` : ''}<ol class="kx-path">${rows}</ol>`;
    return shell(`journey kx-journey-${variant}`,html);
  };
  register('path_progress','Use during a multi-step clarification journey to show the current stage; stage is a zero-based index or an exact stage label.',paths);

  const insights = {};
  for (const variant of ['pros','accordion','bars','verdict','grid']) insights[variant] = (args,ctx) => {
    const points = list(args.points?.length ? args.points : ['Fits your preferences','Based on your context'],6).map(text);
    let body = '';
    if (variant === 'pros') body = `<ul class="kx-pros">${points.map(p => `<li><span>✓</span>${esc(p)}</li>`).join('')}</ul>`;
    if (variant === 'accordion') body = `<button type="button" class="kx-expand" data-action="expand" aria-expanded="false">See the reasoning <span>＋</span></button><div class="kx-detail" hidden>${points.map((p,i) => `<p><b>0${i+1}</b> ${esc(p)}</p>`).join('')}</div>`;
    if (variant === 'bars') body = `<div class="kx-evidence-label">CONTEXT MATCHES · NOT PRODUCT SCORES</div>${points.map((p,i) => `<div class="kx-evidence"><span>${esc(p)}</span><span class="kx-evidence-track" aria-hidden="true">${Array.from({length:i+2},()=>'<i></i>').join('')}</span><small>Matched</small></div>`).join('')}`;
    if (variant === 'verdict') body = `<div class="kx-stamp">YOUR<br>MATCH <span>✦</span></div><div class="kx-verdict-copy">${points.map(p => `<p>✓ ${esc(p)}</p>`).join('')}</div>`;
    if (variant === 'grid') body = `<div class="kx-reasons-grid">${points.map((p,i) => `<div><span aria-hidden="true">${['✦','◎','♡','⌂','✓','↗'][i]}</span><strong>${esc(p)}</strong></div>`).join('')}</div>`;
    return bind(shell(`insight kx-insight-${variant}`,`${head('THE REASONING',args.title || 'Why this fits')}${body}`),ctx);
  };
  register('insight_card','Use beside a recommendation to explain its fit with known needs. Only state supported reasons; do not invent safety claims or numeric scores.',insights);

  KIT.css('context', `
  .kx-root,.kx-root *{box-sizing:border-box}.kx-root{position:relative;width:100%;max-width:100%;min-width:0;padding:20px;border-radius:var(--r);background:var(--card);border:1px solid color-mix(in srgb,var(--sub) 18%,transparent);font-size:14px;line-height:1.45;overflow-wrap:anywhere;isolation:isolate}.kx-root h2,.kx-root h3,.kx-root p{margin:0}.kx-root h3{font-size:21px;line-height:1.2;letter-spacing:-.6px;margin:5px 0 16px}.kx-root small{display:block;color:var(--sub);font-size:12px;line-height:1.5}.kx-root strong{font-weight:650}.kx-eyebrow{color:var(--sub);font-size:10px;letter-spacing:1.5px;font-weight:750;text-transform:uppercase}.kx-row{display:flex;align-items:center;gap:10px;min-width:0}.kx-row>strong,.kx-row>div{flex:1;min-width:0}.kx-spark{color:var(--acc);font-size:24px}.kx-action{min-width:44px;min-height:44px;border:0;background:var(--soft);border-radius:12px;padding:10px 12px;font-size:12px!important;font-weight:650!important;flex:none}.kx-action[data-action=forget]{font-size:23px!important;line-height:1}.kx-action:focus-visible,.kx-expand:focus-visible{outline:2px solid var(--acc);outline-offset:3px}.kx-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.kx-provenance{display:flex;align-items:center;gap:12px;margin-top:8px;min-width:0}.kx-provenance>div{min-width:0}.kx-source{margin-top:4px;font-size:10px!important}.kx-photo{width:52px;height:52px;border-radius:12px!important}.kx-symbol{width:44px;height:44px;display:grid;place-items:center;background:var(--soft);border-radius:50%;font-size:22px;color:var(--acc);flex:none}.kx-receipt-bottom{border-top:1px dashed var(--sub);padding-top:13px;margin-top:15px}.kx-forgotten:empty{display:none}.kx-forgotten{display:block;color:var(--sub);font-size:12px;margin-top:6px}.kx-removed .kx-fact-body,.kx-removed .kx-provenance,.kx-removed strong{opacity:.45;text-decoration:line-through}.kx-footnote{margin-top:16px;font-size:11px!important}.kx-inference{padding:15px 17px}.kx-inference h3{margin-bottom:8px}.kx-inference-badge{border-radius:32px;background:var(--soft)}.kx-inference-badge .kx-provenance{margin:0 0 0 34px}.kx-inference-sticky{border-radius:3px 3px 28px 3px;background:color-mix(in srgb,var(--soft) 85%,var(--acc) 4%);box-shadow:4px 5px 0 color-mix(in srgb,var(--sub) 10%,transparent);border-top:5px solid color-mix(in srgb,var(--acc) 35%,var(--soft))}.kx-inference-banner{border-left:4px solid var(--acc)}.kx-inference-bubble{margin-bottom:12px;border-radius:24px 24px 24px 4px}.kx-inference-bubble:after{content:'';position:absolute;bottom:-9px;left:20px;width:16px;height:16px;background:var(--card);border-bottom:1px solid color-mix(in srgb,var(--sub) 18%,transparent);border-right:1px solid color-mix(in srgb,var(--sub) 18%,transparent);transform:rotate(45deg)}.kx-inference-bubble .kx-action{margin-top:12px}.kx-inference-chip{border-radius:var(--r);background:var(--soft)}.kx-inference-chip>.kx-action{margin-top:12px}.kx-inference-receipt{border-radius:2px 2px 14px 14px;border-top:4px solid var(--acc)}
  .kx-thinking{overflow:hidden}.kx-thinking-status{font-size:11px;color:var(--sub);margin-top:16px}.kx-step{display:flex;align-items:center;gap:10px;margin-top:10px;color:var(--sub);transition:color .2s,transform .2s,opacity .2s;opacity:.35}.kx-step-mark{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--soft);flex:none}.kx-ready{opacity:1;color:var(--ink)}.kx-ready .kx-step-mark{color:var(--acc)}.kx-thinking-terminal{font-family:ui-monospace,SFMono-Regular,monospace;background:var(--soft);border-radius:8px}.kx-thinking-terminal h3{font-family:inherit;font-size:17px}.kx-thinking-terminal .kx-step-mark{background:transparent}.kx-thinking-terminal .kx-steps{border-left:1px solid var(--sub);padding-left:7px}.kx-ring{width:90px;height:90px;border:5px solid var(--soft);border-top-color:var(--acc);border-right-color:var(--acc);border-radius:50%;display:grid;place-items:center;position:relative;flex:none;animation:kx-spin var(--kx-duration) linear}.kx-ring span{font-size:32px;color:var(--acc)}.kx-thinking-ring .kx-ring{float:left;margin:10px 18px 12px 0}.kx-thinking-ring .kx-thinking-status{clear:both}.kx-thinking-orbit .kx-ring{margin:20px auto;background:var(--soft);border:1px dashed var(--acc)}.kx-thinking-orbit .kx-steps{display:flex;justify-content:center;flex-wrap:wrap;gap:7px}.kx-thinking-orbit .kx-step{border-radius:24px;background:var(--soft);padding:8px;font-size:12px;margin:0;transform:translateY(8px)}.kx-thinking-orbit .kx-ready{transform:none}.kx-thinking-orbit .kx-thinking-status{text-align:center}.kx-thinking-scanner{background:linear-gradient(120deg,var(--card),var(--soft));border:0}.kx-thinking-scanner:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--acc) 12%,transparent),transparent);transform:translateX(-100%);animation:kx-scan var(--kx-duration) ease-in-out}.kx-thinking-scanner .kx-step{border-bottom:1px solid color-mix(in srgb,var(--sub) 15%,transparent);padding-bottom:8px}.kx-thinking-toasts{background:transparent;border:0;padding:0 8px 0 0}.kx-thinking-toasts .kx-step{padding:12px 14px;background:var(--card);border:1px solid color-mix(in srgb,var(--sub) 15%,transparent);box-shadow:0 4px 12px #00000008;border-radius:14px;transform:translateX(8px);margin-left:calc(var(--i)*5px)}.kx-thinking-toasts .kx-ready{transform:none}.kx-complete .kx-ring{border-color:var(--acc);animation:none}.kx-complete:before{animation:none;background:none}
  .kx-fact{position:relative;display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px;padding:14px 0;border-bottom:1px solid color-mix(in srgb,var(--sub) 15%,transparent)}.kx-fact:last-child{border-bottom:0}.kx-fact .kx-forgotten{flex-basis:100%}.kx-fact-body{display:flex;align-items:center;gap:12px;flex:1;min-width:0}.kx-fact-body>div{min-width:0}.kx-fact .kx-provenance{margin-top:3px}.kx-avatar{float:right;position:relative;width:48px;height:48px;display:grid;place-items:center;background:var(--soft);border-radius:16px;font-size:24px;font-weight:700}.kx-avatar span{font-size:15px;color:var(--acc);position:absolute;right:-4px;bottom:-4px}.kx-recap-profile h3{padding-right:45px}.kx-recap-cloud .kx-facts{display:flex;flex-wrap:wrap;gap:10px}.kx-recap-cloud .kx-fact{width:100%;border:0;padding:10px 12px;background:var(--soft);border-radius:24px}.kx-recap-cloud .kx-fact:nth-child(even){margin-left:20px;width:calc(100% - 20px)}.kx-recap-cloud .kx-source{display:none}.kx-recap-cloud .kx-fact{width:auto;max-width:100%}.kx-recap-cloud .kx-fact-body{max-width:180px}.kx-recap-cloud .kx-fact:nth-child(even){width:auto;margin-left:auto}.kx-recap-timeline .kx-fact{border-bottom:0;padding:12px 0}.kx-recap-timeline .kx-fact:not(:last-child):before{content:'';position:absolute;top:47px;bottom:-12px;left:17px;border-left:1px dashed var(--sub);z-index:-1}.kx-node{width:36px;height:36px;border-radius:50%;background:var(--soft);color:var(--acc);display:grid;place-items:center;flex:none;font-size:11px;font-weight:700}.kx-recap-home .kx-facts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.kx-recap-home .kx-fact{padding:12px;border:1px solid color-mix(in srgb,var(--sub) 15%,transparent);border-radius:12px;flex-wrap:wrap;background:var(--soft)}.kx-recap-home .kx-fact:first-child{grid-column:1/-1}.kx-recap-home .kx-fact-body{display:block;min-width:65px}.kx-room-icon{font-size:29px;display:block;margin-bottom:8px}.kx-recap-home .kx-fact .kx-action{margin-left:auto;background:var(--card)}.kx-recap-home .kx-source{font-size:10px!important}.kx-recap-home .kx-fact .kx-action{position:absolute;right:10px;top:10px}.kx-recap-home .kx-room-icon{min-height:44px;padding-right:46px}
  .kx-scene{overflow:hidden;min-height:225px;background:var(--soft);border:0;padding:24px}.kx-scene h2{position:relative;font-size:32px;line-height:1.04;letter-spacing:-1.4px;max-width:240px;margin:12px 0;z-index:2}.kx-scene p{position:relative;color:var(--sub);font-size:12px;z-index:2}.kx-illustration{display:block;width:180px;height:142px;margin:0 0 -12px auto;color:var(--acc)}.kx-scene-illustration h2{max-width:270px}.kx-scene-emoji{background:radial-gradient(ellipse at 80% 80%,color-mix(in srgb,var(--acc) 17%,var(--soft)),var(--soft))}.kx-big-emoji{font-size:104px;line-height:1;display:block;text-align:right;margin-top:12px;color:var(--acc);transform:rotate(-12deg)}.kx-scene-particles{min-height:260px;display:flex;flex-direction:column;justify-content:center}.kx-scene-particles h2{max-width:230px}.kx-particles{position:absolute;inset:0;pointer-events:none;z-index:-1}.kx-particles span{position:absolute;font-size:calc(14px + var(--i)*3px);color:var(--acc);opacity:.18;animation:kx-float 3s ease-in-out infinite alternate;animation-delay:calc(var(--i)*-300ms)}.kx-scene-collage h2{max-width:100%;font-size:28px}.kx-collage{display:flex;gap:12px;margin-top:24px}.kx-collage figure{margin:0;flex:1;min-width:0;transform:rotate(-4deg);background:var(--card);padding:8px;border-radius:12px}.kx-collage figure+figure{transform:rotate(4deg)}.kx-scene-photo{width:100%;border-radius:8px!important}.kx-collage figcaption{font-size:9px;color:var(--sub);margin:6px 0 0;line-height:1.4}.kx-scene-poster{min-height:260px;background:var(--card);border:2px solid var(--acc)}.kx-scene-poster h2{font-size:44px;max-width:260px;margin-top:28px}.kx-accent-shape{position:absolute;bottom:-55px;right:-20px;font-size:190px;line-height:1;color:var(--acc);opacity:.12;transform:rotate(20deg)}
  .kx-path{list-style:none;margin:20px 0 0;padding:0;display:flex;gap:8px;justify-content:space-between}.kx-path li{flex:1;min-width:0;position:relative;color:var(--sub);font-size:11px}.kx-path-node{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--soft);color:var(--sub);margin-bottom:8px;font-size:11px;font-weight:700}.kx-current{color:var(--ink)!important;font-weight:700}.kx-current .kx-path-node{background:var(--acc);color:var(--card);outline:4px solid var(--soft)}.kx-past .kx-path-node{color:var(--acc)}.kx-journey-trail .kx-path li:not(:last-child):after{content:'';position:absolute;top:15px;left:36px;right:0;border-top:2px dotted var(--sub)}.kx-journey-stepper .kx-path-node{width:100%;height:5px;border-radius:4px;color:transparent;margin-bottom:12px}.kx-journey-stepper .kx-past .kx-path-node{background:var(--acc);color:transparent}.kx-journey-stepper .kx-current .kx-path-node{color:transparent;outline:0}.kx-journey-map{background:var(--soft)}.kx-journey-map .kx-path{display:grid;grid-template-columns:1fr 1fr;gap:24px}.kx-journey-map li{display:flex;align-items:center;gap:10px}.kx-journey-map .kx-path-node{width:40px;height:40px;margin:0;background:var(--card);flex:none}.kx-journey-map .kx-current .kx-path-node{background:var(--acc)}.kx-journey-map li:nth-child(even){transform:translateY(15px)}.kx-journey-map .kx-path{padding-bottom:16px}.kx-journey-breadcrumbs .kx-path{flex-wrap:wrap;justify-content:flex-start}.kx-journey-breadcrumbs li{flex:0 1 auto;display:flex;align-items:center;gap:6px;padding:8px 10px;background:var(--soft);border-radius:20px}.kx-journey-breadcrumbs .kx-path-node{width:20px;height:20px;margin:0}.kx-battery{display:flex;gap:5px;padding:7px;border:2px solid var(--sub);border-radius:12px;margin:20px 6px 16px 0;height:52px;position:relative}.kx-battery:after{content:'';position:absolute;right:-7px;top:12px;width:4px;height:20px;border-radius:0 3px 3px 0;background:var(--sub)}.kx-battery span{flex:1;background:var(--soft);border-radius:4px}.kx-battery .kx-charged{background:var(--acc)}.kx-journey-battery .kx-path-node{display:none}.kx-journey-battery .kx-path{margin-top:10px}
  .kx-pros{padding:0;list-style:none;margin:0}.kx-pros li{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--soft)}.kx-pros li:last-child{border:0}.kx-pros li span{color:var(--acc);font-weight:800}.kx-expand{width:100%;min-height:48px;text-align:left;background:var(--soft);border:0;border-radius:12px;padding:12px 14px;font-size:13px!important;display:flex;justify-content:space-between;gap:10px}.kx-detail p{padding:15px 0;border-bottom:1px solid var(--soft)}.kx-detail b{font-size:11px;color:var(--acc);margin-right:10px}.kx-evidence-label{font-size:9px;letter-spacing:.7px;color:var(--sub);margin-bottom:16px}.kx-evidence{margin-top:16px;display:grid;grid-template-columns:1fr auto;gap:7px}.kx-evidence>span:first-child{grid-column:1/-1}.kx-evidence-track{display:flex;gap:4px;align-items:center}.kx-evidence-track i{display:block;height:8px;flex:1;border-radius:4px;background:var(--acc)}.kx-evidence small{font-size:10px}.kx-insight-verdict{border:2px solid var(--acc)}.kx-stamp{float:right;margin:4px 0 12px 16px;padding:13px 10px;border:2px solid var(--acc);border-radius:50%;font-size:12px;font-weight:900;line-height:1.1;transform:rotate(12deg);color:var(--acc);text-align:center}.kx-stamp span{display:block;font-size:24px}.kx-verdict-copy p{margin:14px 0;font-size:13px}.kx-reasons-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.kx-reasons-grid>div{border-radius:14px;background:var(--soft);padding:16px 12px;min-height:110px}.kx-reasons-grid span{display:block;font-size:30px;color:var(--acc);margin-bottom:12px}.kx-reasons-grid strong{font-size:13px}.kx-root.kit-frozen{pointer-events:none}
  @keyframes kx-spin{from{transform:rotate(-30deg)}to{transform:rotate(0)}}@keyframes kx-scan{to{transform:translateX(100%)}}@keyframes kx-float{to{transform:translateY(-10px) rotate(8deg)}}@media(prefers-reduced-motion:reduce){.kx-root *,.kx-root:before{animation:none!important;transition:none!important}}
  `);
})();
