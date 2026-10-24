/* Commerce kit: catalogue-priced purchases, reversible receipts, and tactile refinement. */
(() => {
  'use strict';
  const K = window.KIT;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const node = (tag, cls, text) => { const e=document.createElement(tag); e.className=cls; if(text!==undefined)e.textContent=text; return e; };
  const button = (label, fn, cls='') => {const b=node('button','kc-btn '+cls,label); b.type='button';b.onclick=fn;return b;};
  function shell(a, title, variant) {
    const e=node('section','kc-root kc-'+variant);e.setAttribute('aria-label',a.title||title);
    const eyebrow=node('div','kc-eyebrow','COUPANG · FOR YOU');e.append(eyebrow,node('h3','kc-title',a.title||title));
    let frozen=false;
    e.freeze=()=>{frozen=true;e.dataset.frozen='true';e.querySelectorAll('button,input,select').forEach(b=>{if(!b.dataset.undo)b.disabled=true;});};
    e.isFrozen=()=>frozen;return e;
  }
  function lines(a,c) {return (Array.isArray(a.items)?a.items:[]).map(i=>{const p=c.product(typeof i==='string'?i:i.product_id||i.id);return p?{p,qty:Math.min(99,Math.max(1,Math.floor(Number(i.qty)||1))),checked:true}:null;}).filter(Boolean);}
  const sum=rows=>rows.filter(r=>r.checked).reduce((n,r)=>n+Number(r.p.price)*r.qty,0);
  const photo=(p,c,cls='')=>{const e=node('div','kc-photo '+cls);e.innerHTML=c.img(p,'kc-image');return e;};
  function picked(e,b){e.querySelectorAll('[data-picked]').forEach(x=>x.removeAttribute('data-picked'));b.dataset.picked='';}
  function register(name, description, ids, render) {K.register(name,{group:'commerce',description,variants:Object.fromEntries(ids.map(v=>[v,(a,c)=>render(a,c,v)]))});}

  register('bundle','Review a suggested set, adjust individual items, and see its catalogue total.', ['checklist','basket','receipt','flatlay','swipe'],(a,c,v)=>{
    const e=shell(a,'Your little essentials kit',v),rows=lines(a,c),list=node('div','kc-items'),total=node('div','kc-total');
    const update=()=>{total.textContent='Selected total · '+c.won(sum(rows));};
    if(v==='basket'){const stack=node('div','kc-stack');rows.forEach(r=>stack.append(photo(r.p,c)));e.append(stack,node('p','kc-muted',rows.length+' good finds. One happy basket.'));}
    rows.forEach(r=>{const card=node('article','kc-item');
      const head=node('div','kc-item-head'),tick=node('input','kc-check');tick.type='checkbox';tick.checked=true;tick.setAttribute('aria-label','Include '+r.p.name);
      tick.onchange=()=>{r.checked=tick.checked;card.dataset.excluded=String(!r.checked);update();};
      const info=node('div','kc-info');info.append(node('small','kc-muted',r.p.brand+' · ×'+r.qty),node('strong','kc-name',r.p.name),node('b','kc-price',c.won(r.p.price*r.qty)));
      head.append(tick,photo(r.p,c),info);card.append(head);
      const actions=node('div','kc-actions');['swap','cheaper','remove'].forEach(action=>{const label=action[0].toUpperCase()+action.slice(1);const b=button(label,()=>{if(e.isFrozen())return;if(action==='remove'){r.checked=false;tick.checked=false;card.dataset.excluded='true';update();}c.answer({action,product_id:r.p.id},'<'+label+' '+r.p.name+'>');});b.dataset.action=action;actions.append(b);});card.append(actions);list.append(card);
    });e.append(list,total);if(!rows.length)e.append(node('p','kc-muted','No available items'));update();return e;
  });

  register('ship_it','Place a confirmed set of catalogue items in one action, with delivery receipt and Undo.', ['rocket','slide','hold','stamp','truck'],(a,c,v)=>{
    const e=shell(a,'Ready when you are',v),rows=lines(a,c);let order=null,timer=null,busy=false;
    const status=node('div','kc-status');status.setAttribute('role','status');e.append(status);
    const surface=node('div','kc-ship-surface');e.append(surface);
    function ready(){surface.replaceChildren();status.textContent='';
      const stack=node('div','kc-stack kc-mini');rows.forEach(r=>stack.append(photo(r.p,c)));surface.append(stack);
      const total=sum(rows),ship=button('Ship it · '+c.won(total),place,'kc-primary kc-ship-button');ship.disabled=!rows.length||e.isFrozen();
      const icon=node('div','kc-hero',v==='truck'?'▰ →':v==='stamp'?'READY TO SHIP':'↗');surface.append(icon,ship,node('p','kc-delivery','Rocket · tomorrow 7am'));
      if(window.REWARDS?.shipRow){const rewardRow=window.REWARDS.shipRow(total);if(rewardRow instanceof HTMLElement)surface.append(rewardRow);}
      if(v==='slide'){
        ship.textContent='Ship it · '+c.won(total);const range=node('input','kc-range');range.type='range';range.min=0;range.max=100;range.value=0;range.setAttribute('aria-label','Slide to ship');range.disabled=ship.disabled;
        range.oninput=()=>{e.style.setProperty('--progress',range.value+'%');};range.onchange=()=>{if(Number(range.value)>=95)place();else range.value=0;};surface.insertBefore(range,ship);surface.append(node('small','kc-muted','Slide to send · or tap Ship it'));
      }
      if(v==='hold'){
        const hint=node('small','kc-muted','Hold for 0.6s · or tap to ship');surface.append(hint);
        ship.onpointerdown=ev=>{if(ev.button!==0||ship.disabled)return;ship.classList.add('kc-holding');timer=setTimeout(()=>{timer=null;place();},600);};
        const cancel=()=>{clearTimeout(timer);timer=null;ship.classList.remove('kc-holding');};ship.onpointerup=cancel;ship.onpointercancel=cancel;ship.onpointerleave=cancel;
      }
    }
    function place(){if(order||busy||e.isFrozen()||!rows.length)return;clearTimeout(timer);busy=true;
      try{if(!window.Orders?.add){status.textContent='Ordering is unavailable. Try again shortly.';return;}
        const items=rows.flatMap(r=>Array.from({length:r.qty},()=>({...r.p})));order=window.Orders.add({items,total:sum(rows),flow:a.flow||'live'});
        if(!order?.id)throw Error('No order ID');
        surface.replaceChildren();surface.classList.add('kc-receipt-state');const head=node('div','kc-receipt-head');head.append(node('span','kc-seal','✓'),node('strong','','You’re all set'));surface.append(head);
        const thumbs=node('div','kc-stack kc-mini');rows.forEach(r=>thumbs.append(photo(r.p,c)));surface.append(thumbs,node('b','kc-total',c.won(sum(rows))),node('p','kc-delivery','Rocket · tomorrow 7am'));
        if(window.AI?.trackLink)surface.append(window.AI.trackLink(order));
        const undo=button('Undo',()=>{try{const stored=JSON.parse(localStorage.getItem('t8-orders')||'[]');localStorage.setItem('t8-orders',JSON.stringify(stored.filter(o=>o.id!==order.id)));window.dispatchEvent(new Event('t8-orders'));order=null;surface.classList.remove('kc-receipt-state');ready();}catch{status.textContent='Could not undo. Please try again.';}},'kc-undo');undo.dataset.undo='true';surface.append(undo);
        c.answer({shipped:true,order_id:order.id},'Ship it');
      }catch{status.textContent='Could not place the order. Please try again.';}finally{busy=false;}
    }
    const freeze=e.freeze;e.freeze=()=>{clearTimeout(timer);freeze();};ready();return e;
  });

  const defaults=[{label:'Too pricey',value:'cheaper'},{label:'Other brand',value:'other_brand'},{label:'Lighter',value:'lighter'},{label:'Bigger pack',value:'bigger_pack'}];
  register('feedback_bar','Offer quick refinements when results are close but need changes; avoid another typing turn.', ['chips','reactions','reasons','tune','swipe'],(a,c,v)=>{
    const e=shell(a,'Make it more you',v),opts=(a.options?.length?a.options:defaults).map(o=>typeof o==='string'?{label:o,value:o}:o),list=node('div','kc-feedback');
    const choose=(o,b)=>{if(e.isFrozen())return;picked(e,b);c.answer(o.value??o.label,o.label);};
    if(v==='reasons'){const open=button('↙  Not quite right',()=>{list.hidden=!list.hidden;open.setAttribute('aria-expanded',String(!list.hidden));},'kc-wide');open.setAttribute('aria-expanded','false');list.hidden=true;e.append(open);}
    if(v==='swipe'){const intro=node('div','kc-swipe-intro','Almost. Let’s find your fit.');let start;intro.onpointerdown=ev=>{start=ev.clientX;};intro.onpointerup=ev=>{if(!e.isFrozen()&&start!==undefined&&Math.abs(ev.clientX-start)>50){list.hidden=false;intro.textContent='What should change?';}};e.append(intro,node('small','kc-muted','Swipe the card, or choose below'));}
    if(v==='tune'){
      const input=node('input','kc-range');input.type='range';input.min=0;input.max=opts.length-1;input.value=0;input.step=1;input.setAttribute('aria-label','Choose refinement');const label=node('b','kc-tune-label',opts[0].label);input.oninput=()=>{label.textContent=opts[Number(input.value)].label;};const apply=button('Apply refinement',()=>choose(opts[Number(input.value)],apply),'kc-wide');e.append(label,input,apply);
    }else opts.forEach((o,i)=>{const b=button((v==='reactions'?['💸','↔','🪶','📦'][i%4]+' ':'')+o.label,()=>choose(o,b));list.append(b);});e.append(list);return e;
  });

  register('subscribe','Ask how often to repeat an everyday purchase or remind the shopper; selecting cadence records a preference, not a paid subscription.', ['intervals','calendar','dial','reminder','annual'],(a,c,v)=>{
    const e=shell(a,'Keep your essentials in rhythm',v),allowed=[2,4,6,8];let cadence=allowed.includes(Number(a.cadence))?Number(a.cadence):4;
    const readout=node('div','kc-cadence'),body=node('div','kc-cadence-body');
    function update(){readout.textContent='Every '+cadence+' weeks';body.querySelectorAll('[data-weeks]').forEach(b=>{if(Number(b.dataset.weeks)===cadence)b.dataset.picked='';else b.removeAttribute('data-picked');});}
    const select=weeks=>{cadence=weeks;update();};
    if(v==='intervals'||v==='annual')allowed.forEach(w=>{const b=button(w+'w',()=>select(w));b.dataset.weeks=w;body.append(b);});
    if(v==='calendar'){allowed.forEach(w=>{const date=new Date();date.setDate(date.getDate()+w*7);const b=button(date.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' · '+w+'w',()=>select(w));b.dataset.weeks=w;body.append(b);});}
    if(v==='dial'){const input=node('input','kc-range');input.type='range';input.min=0;input.max=3;input.step=1;input.value=allowed.indexOf(cadence);input.setAttribute('aria-label','Repeat cadence');input.oninput=()=>select(allowed[Number(input.value)]);body.append(input);readout.classList.add('kc-dial-face');}
    if(v==='reminder'){const selectEl=node('select','kc-select');selectEl.setAttribute('aria-label','Reminder cadence');allowed.forEach(w=>{const o=node('option','',w+' weeks');o.value=w;o.selected=w===cadence;selectEl.append(o);});selectEl.onchange=()=>select(Number(selectEl.value));body.append(selectEl);}
    e.append(readout,body);if(v==='annual'){const spend=node('div','kc-year-summary');e.append(spend);const orig=update;update=()=>{orig();spend.textContent='About '+Math.round(52/cadence)+' deliveries / year · '+c.won(sum(lines(a,c))*Math.round(52/cadence));};}
    if(a.because)e.append(node('p','kc-muted','✦ '+a.because));
    const confirm=button(v==='reminder'?'Remind me':'Use this rhythm',()=>{if(e.isFrozen())return;confirm.textContent=v==='reminder'?'Reminder preference saved ✓':'Every '+cadence+' weeks ✓';c.answer({cadence,action:v==='reminder'?'remind':'subscribe'},'Every '+cadence+' weeks');},'kc-wide');e.append(confirm,node('small','kc-muted','Preference only · no payment today'));update();return e;
  });

  register('deal','Highlight a catalogue price or an available promotion supplied by the shopping context. Never invent a discount or change catalogue prices.', ['coupon','scratch','graph','coins','flash'],(a,c,v)=>{
    const e=shell(a,'A little extra, for you',v),rows=lines(a,c),price=c.won(sum(rows)),body=node('div','kc-deal-body');
    const preview=node('div','kc-deal-products');rows.forEach(r=>{const tile=node('div','kc-deal-product');tile.append(photo(r.p,c),node('span','kc-muted',r.p.brand+' · '+r.p.name));preview.append(tile);});e.append(preview);
    const priceEl=node('strong','kc-deal-price',price);body.append(priceEl,node('small','kc-muted','Current catalogue total'));
    if(v==='coupon')body.append(node('div','kc-perforation','✂ · · · · · · · · · · · · · · ·'));
    if(v==='graph'){const graph=node('div','kc-graph');const max=Math.max(1,...rows.map(r=>r.p.price*r.qty));rows.forEach(r=>{const row=node('div','kc-price-row');const label=node('div','kc-price-label');label.append(node('span','',r.p.brand+' ×'+r.qty),node('b','',c.won(r.p.price*r.qty)));const track=node('div','kc-price-track'),bar=node('span');bar.style.width=(r.p.price*r.qty/max*100)+'%';track.append(bar);row.append(label,track);graph.append(row);});body.append(graph,node('small','kc-muted','Price breakdown · current catalogue'));}
    if(v==='coins'){const benefit=node('div','kc-benefit');if(window.REWARDS?.shipRow && window.REWARDS.balance?.()>=100){benefit.append(window.REWARDS.shipRow(sum(rows)));}else benefit.append(node('strong','','Coins at checkout'),node('small','kc-muted','100 coins = ₩200 · subject to your balance'));body.append(benefit);}
    if(v==='flash')body.append(node('div','kc-flash-label','⚡ YOUR PRICE, RIGHT NOW'));
    if(a.because)body.append(node('p','kc-muted',a.because));e.append(body);
    const label=v==='scratch'?'✦ Tap to reveal your price':v==='coins'?'Choose this pick':'Choose this price';
    const apply=button(label,()=>{if(e.isFrozen())return;if(v==='scratch'&&!apply.dataset.revealed){apply.dataset.revealed='true';body.hidden=false;apply.textContent='Choose this price';return;}picked(e,apply);apply.textContent='Selected ✓';c.answer({action:'apply_deal',product_ids:rows.map(r=>r.p.id),...(a.code?{code:a.code}:{})},'Use this offer');},'kc-wide');
    if(v==='scratch')body.hidden=true;e.append(apply);return e;
  });

  K.css('commerce-polish', `
.kc-root.kc-graph{color:var(--ink);margin-top:0}.kc-flatlay .kc-item:last-child:nth-child(odd),.kc-reactions .kc-btn:last-child:nth-child(odd){grid-column:1/-1}.kc-deal-products{display:flex;gap:12px;overflow:auto;padding-bottom:12px}.kc-deal-product{flex:1;min-width:100px;max-width:230px}.kc-deal-product .kc-photo{width:100%;max-width:230px}.kc-deal-product .pimg{width:100%;height:175px;aspect-ratio:auto}.kc-deal-product .kc-muted{margin:8px 0 0;font-size:11px}.kc-deal-price{font-size:40px!important;letter-spacing:-1.5px!important;color:var(--ink)!important}.kc-scratch .kc-wide{background:linear-gradient(120deg,#dddce9,#f5f4fa 40%,#d0cddb)!important;color:#34323d;min-height:82px;border:1px solid #c4c0d0;box-shadow:inset 0 0 0 4px #ffffff66}.kc-scratch .kc-wide[data-revealed]{background:var(--ink)!important;color:var(--card)}.kc-price-row{margin:14px 0}.kc-price-label{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:var(--ink)}.kc-price-track{height:8px;background:var(--soft);border-radius:8px;margin-top:10px}.kc-price-track span{display:block;height:100%;background:var(--acc);border-radius:8px}.kc-benefit{padding:18px;background:var(--soft);border-radius:14px;margin-top:16px}.kc-benefit strong{font-size:18px;display:block;margin-bottom:6px}.kc-stamp .kc-hero{font-size:17px!important;letter-spacing:2px!important}
`);
  K.css('commerce', `
.kc-root,.kc-root *{box-sizing:border-box}.kc-root{padding:20px;max-width:100%;min-width:0;border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);border-radius:var(--r);background:var(--card);overflow:hidden;position:relative;line-height:1.4}.kc-root[data-frozen]{opacity:.86}.kc-root [hidden]{display:none!important}.kc-eyebrow{font-size:10px;font-weight:800;letter-spacing:2px;color:var(--sub);margin-bottom:10px}.kc-title{font-size:23px;letter-spacing:-.8px;line-height:1.12;margin:0 0 20px;overflow-wrap:anywhere}.kc-muted{color:var(--sub);font-size:12px;display:block;line-height:1.5}.kc-btn{border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);background:var(--card);border-radius:12px;min-height:44px;min-width:44px;padding:10px 13px;font-size:13px!important;font-weight:650!important;transition:transform .18s,background .18s;overflow-wrap:anywhere}.kc-btn:active{transform:scale(.97)}.kc-btn:focus-visible,.kc-range:focus-visible,.kc-check:focus-visible{outline:3px solid var(--acc);outline-offset:3px}.kc-btn:disabled{cursor:default;opacity:.6}.kc-root .kc-primary{background:var(--acc);color:var(--card);border:0;font-size:19px!important;font-weight:800!important;min-height:64px;width:100%;border-radius:18px;position:relative;overflow:hidden}.kc-wide{width:100%;background:var(--soft);margin-top:14px;min-height:50px}.kc-items{display:grid;gap:12px}.kc-item{min-width:0;border-radius:15px;padding:12px;background:var(--soft)}.kc-item-head{display:flex;gap:10px;align-items:center;min-width:0}.kc-check{width:44px;height:44px;flex:0 0 44px;margin:0;accent-color:var(--acc)}.kc-photo{width:52px;flex-shrink:0}.kc-photo .pimg{width:100%;border-radius:10px}.kc-info{min-width:0;flex:1}.kc-name{font-size:13px;display:block;overflow-wrap:anywhere;line-height:1.3;margin:3px 0}.kc-price{font-size:14px}.kc-actions{display:flex;gap:5px;margin-top:10px}.kc-actions .kc-btn{flex:1;min-width:0;padding:8px 5px;font-size:12px!important}.kc-total{padding:16px 0 0;font-size:19px;letter-spacing:-.5px;font-weight:800;display:block}.kc-item[data-excluded=true] .kc-info{text-decoration:line-through;opacity:.55}.kc-stack{display:flex;align-items:center;padding:8px 6px 12px;flex-wrap:wrap;gap:3px}.kc-stack .kc-photo{width:68px;margin-right:-16px;transform:rotate(-8deg);border:3px solid var(--card);border-radius:15px}.kc-stack .kc-photo:nth-child(even){transform:rotate(9deg);margin-top:12px}.kc-mini{justify-content:center}.kc-mini .kc-photo{width:58px}.kc-basket{background:linear-gradient(150deg,var(--soft),var(--card))}.kc-receipt{border-radius:3px;border-top:6px solid var(--acc);border-bottom:5px dotted var(--sub)}.kc-receipt .kc-eyebrow,.kc-receipt .kc-total{font-family:monospace}.kc-receipt .kc-item{background:transparent;border-bottom:1px dashed var(--sub);border-radius:0}.kc-flatlay .kc-items{grid-template-columns:repeat(2,minmax(0,1fr))}.kc-flatlay .kc-item{padding:10px}.kc-flatlay .kc-item-head{flex-wrap:wrap;gap:5px}.kc-flatlay .kc-photo{width:70px;max-width:100%}.kc-flatlay .kc-info{flex-basis:100%}.kc-flatlay .kc-check{width:44px;flex-basis:44px}.kc-flatlay .kc-actions{flex-direction:column}.kc-swipe .kc-items{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding:3px 3px 12px}.kc-swipe .kc-item{flex:0 0 92%;scroll-snap-align:start}.kc-swipe .kc-item-head{flex-wrap:wrap}.kc-swipe .kc-photo{width:100px}.kc-swipe .kc-info{flex-basis:100%}.kc-ship-surface{text-align:center}.kc-hero{font-size:68px;font-weight:900;color:var(--acc);line-height:1.2;margin-bottom:16px}.kc-delivery{font-size:12px;color:var(--sub);font-weight:650;margin:10px 0}.kc-status:empty{display:none}.kc-status{color:var(--ink);padding:10px 0}.kc-rocket{background:linear-gradient(145deg,var(--soft),var(--card) 75%)}.kc-rocket .kc-hero{transform:rotate(-15deg)}.kc-stamp .kc-hero{font:800 20px monospace;letter-spacing:4px;border:3px double var(--acc);border-radius:8px;padding:18px 8px;transform:rotate(-6deg);margin:24px 0}.kc-truck .kc-hero{border-bottom:3px dashed var(--sub);text-align:left;padding-left:12px}.kc-truck .kc-ship-button:active{animation:kc-drive .5s}.kc-hold .kc-ship-button{border-radius:100px}.kc-holding:after{content:'';position:absolute;inset:0;background:color-mix(in srgb,var(--card) 30%,transparent);transform-origin:left;animation:kc-fill .6s linear}.kc-range{accent-color:var(--acc);width:100%;min-height:44px;display:block;margin:10px 0;touch-action:pan-y}.kc-slide .kc-range{height:56px;background:var(--soft);border-radius:50px}.kc-receipt-state{animation:kc-arrive .3s ease-out;text-align:left;padding:4px 0}.kc-receipt-head{display:flex;align-items:center;gap:10px;font-size:20px}.kc-seal{display:grid;place-items:center;width:44px;height:44px;background:var(--soft);color:var(--acc);border-radius:50%}.kc-receipt-state .kc-mini{justify-content:flex-start}.kc-receipt-state .t8-track{background:var(--acc);color:var(--card)}.kc-undo{margin-left:10px}.kc-feedback{display:flex;flex-wrap:wrap;gap:8px}.kc-reactions .kc-feedback{display:grid;grid-template-columns:1fr 1fr}.kc-reactions .kc-btn{min-height:76px;background:var(--soft);font-size:15px!important}.kc-tune-label{display:block;text-align:center;font-size:26px;padding:24px 0;color:var(--acc)}.kc-swipe-intro{padding:26px 20px;background:var(--soft);border-radius:16px;transform:rotate(-2deg);font-size:22px;font-weight:750;touch-action:pan-y;margin-bottom:18px}.kc-cadence{font-size:32px;font-weight:800;letter-spacing:-1.3px;margin-bottom:20px;color:var(--acc)}.kc-cadence-body{display:flex;flex-wrap:wrap;gap:8px}.kc-cadence-body .kc-btn{flex:1}.kc-calendar .kc-cadence-body{display:grid;grid-template-columns:1fr 1fr}.kc-calendar .kc-btn{min-height:72px;border-top:5px solid var(--acc)}.kc-dial-face{width:210px;height:210px;display:grid;place-items:center;border:14px solid var(--soft);border-bottom-color:var(--acc);border-radius:50%;font-size:25px;margin:0 auto 20px;letter-spacing:-1px}.kc-select{background:var(--soft);color:var(--ink);border:0;border-radius:12px;padding:12px;min-height:48px;width:100%;font:inherit}.kc-year-summary{background:var(--soft);font-size:22px;font-weight:700;padding:20px;border-radius:14px;margin-top:20px}.kc-deal-price{font-size:48px;letter-spacing:-2px;display:block;color:var(--acc);overflow-wrap:anywhere}.kc-deal-body{padding:16px 0}.kc-coupon{border:2px dashed var(--acc)}.kc-perforation{letter-spacing:2px;color:var(--sub);overflow:hidden;white-space:nowrap;margin-top:20px}.kc-scratch .kc-wide{background:repeating-linear-gradient(135deg,var(--soft),var(--soft) 8px,var(--card) 8px,var(--card) 16px);min-height:82px}.kc-graph{color:var(--acc);margin-top:24px}.kc-graph svg{width:100%;height:auto;display:block}.kc-coin-art{font-size:44px;letter-spacing:9px;color:var(--acc);transform:rotate(-6deg);padding:20px 0}.kc-flash{background:linear-gradient(145deg,var(--soft),var(--card));border-top:5px solid var(--acc)}.kc-flash-label{font-size:11px;letter-spacing:2px;background:var(--acc);color:var(--card);padding:12px;margin-top:16px;border-radius:9px}.kc-root .kc-btn[data-picked]{background:var(--soft)}
@keyframes kc-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes kc-arrive{from{transform:translateY(8px);opacity:.3}to{transform:none;opacity:1}}@keyframes kc-drive{to{transform:translateX(8px)}}@media(prefers-reduced-motion:reduce){.kc-root *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
  `);
})();
