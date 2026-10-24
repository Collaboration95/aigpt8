(() => {
  'use strict';
  const params = new URLSearchParams(location.search), mock = params.get('mock') === '1';
  const feed = document.querySelector('#feed'), messages = document.querySelector('#messages'), spacer = document.querySelector('#spacer');
  const input = document.querySelector('#prompt'), send = document.querySelector('#send'), debug = document.querySelector('#debug');
  const sid = localStorage.getItem('t8-sid') || crypto.randomUUID(); localStorage.setItem('t8-sid', sid);
  let busy = false, anchor = null, thinking = null, activeBubble = null, accepted = false, finished = false, currentTurn = null, mockTurn = 0;
  let originalGoal = params.get('q') || '', calls = new Map(), proof = {}, raw = [];
  debug.hidden = params.get('debug') !== '1';
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  function updateProof(data = {}) { proof = {...proof, ...data}; debug.querySelector('pre').textContent = JSON.stringify({...proof, tools:raw.slice(-12)}, null, 2).slice(0, 12000); }
  function badge() { const n = Orders.list().filter(o=>!o.cancelled&&!o.canceled&&!['cancelled','canceled'].includes(o.status)&&Orders.status(o)!=='Delivered').length; document.querySelector('#badge').hidden = !n; document.querySelector('#badge').textContent = n; }
  Orders.onChange(badge); badge();
  function align() {
    if (!anchor?.isConnected) return;
    spacer.style.height = '12px';
    const top = anchor.offsetTop - messages.offsetTop;
    // Supply only the space needed to put this user turn beneath the fixed chrome.
    const missing = top - (feed.scrollHeight - feed.clientHeight);
    spacer.style.height = Math.max(12, missing + 12) + 'px';
    feed.scrollTop = top;
  }
  new ResizeObserver(() => { requestAnimationFrame(align); }).observe(messages);
  window.visualViewport?.addEventListener('resize', () => { document.querySelector('#app').style.height = window.visualViewport.height + 'px'; align(); });
  function bubble(label) { const n = el('div', 'user', label); messages.append(n); anchor = n; align(); return n; }
  function clearThinking() { thinking?.freeze?.(); thinking?.remove(); thinking = null; }
  function status(steps) {
    clearThinking(); const args = {steps:steps.map(s => typeof s === 'string' ? s : s.label)};
    if (KIT.tools().includes('thinking_steps')) { thinking = KIT.render('thinking_steps', args); thinking.querySelectorAll('.kx-step').forEach(n => n.classList.add('kx-ready')); }
    else { thinking = el('div', 'status-card'); args.steps.forEach(s => thinking.append(el('div', '', s))); }
    thinking.setAttribute('role', 'status'); messages.append(thinking);
  }
  function freezePrevious() { for (const c of calls.values()) if (c.committed) { c.node.firstElementChild?.freeze?.(); c.node.inert = true; c.frozen = true; } }
  function adapted(e) {
    const a = {...e.args};
    // The kit's current schema uses snake_case. Preserve all model variant/theme arguments.
    if (a.selected != null && a.preselect == null) a.preselect = a.selected;
    if (a.value != null && a.preselect == null) a.preselect = a.value;
    if (a.reason?.because && !a.because) a.because = a.reason.because;
    if (a.productId && !a.product_ids) a.product_ids = [a.productId];
    if (a.products && !a.product_ids) a.product_ids = a.products.map(p => p.productId || p.product_id || p.id);
    if (a.items) a.items = a.items.map(i => typeof i === 'string' ? i : {...i, product_id:i.product_id || i.productId || i.id, qty:i.qty ?? i.quantity ?? 1});
    if (a.options) a.options = a.options.map(o => ({...o, description:o.description || o.hint, product_id:o.product_id || o.productId}));
    if (a.lowLabel) a.min_label = a.lowLabel; if (a.highLabel) a.max_label = a.highLabel;
    if (e.name === 'note_inference' && !a.facts) a.facts = [{key:a.factKey, label:a.label, because:a.because}];
    if (a.actions && !a.options) a.options = a.actions.map(value => ({value,label:({too_pricey:'Too pricey',other_brand:'Other brand',not_for_me:'Not for me',more_like_this:'More like this'})[value] || value}));
    return a;
  }
  function answer(e, value, label) {
    const c = calls.get(e.toolCallId); if (busy || !c?.committed || c.frozen) return;
    if (e.name === 'ship_it') value = 'ship';
    return submit({event:{toolCallId:e.toolCallId, value, label:String(label || value).slice(0,200)}});
  }
  function renderTool(e) {
    clearThinking(); const a = adapted(e), wrapper = el('div','tool');
    wrapper.dataset.call = e.toolCallId; wrapper.dataset.turn = e.turnId || currentTurn; wrapper.dataset.provisional = 'true'; wrapper.inert = true;
    let node;
    try { node = KIT.tools().includes(e.name) ? KIT.render(e.name,a,{onAnswer:(v,l)=>answer(e,v,l)}) : el('div','status-card','This option is getting ready.'); }
    catch { node = el('div','status-card','This option is temporarily unavailable.'); }
    wrapper.append(node);
    if(e.name==='play_game'&&!KIT.tools().includes('play_game')) {
      const token=a.launchToken||a.launch_token;
      const game=['price','rapid','swipe','basket','bracket'].includes(a.game)?a.game:'price';
      const url=new URL('/games.html',location.origin);url.searchParams.set('sid',sid);url.searchParams.set('game',game);
      if(token && /^[a-zA-Z0-9_-]{1,256}$/.test(token)) {
        url.searchParams.set('launchToken',token);url.searchParams.set('rounds',String(a.rounds||4));url.searchParams.set('productIds',JSON.stringify(a.productIds||a.product_ids||[]));
        const frame=el('iframe','game-frame');frame.title=a.title||'Shopping game';frame.src=url.href;wrapper.append(frame);
      } else {const link=el('a','','Continue to games →');link.href=url.pathname+url.search;node.className='notice';node.append(el('br'),link);}
    }
    // Older commerce variants commit to localStorage on click. Capture live checkout
    // before their handlers run; only the server's order event creates a receipt.
    if (e.name === 'ship_it') {
      const intercept = ev => {
        const target = ev.target.closest('button,input[type=range]'); if (!target) return;
        ev.stopImmediatePropagation();
        if (ev.type === 'click' && target.tagName === 'BUTTON') { ev.preventDefault(); answer(e,'ship','Ship it'); }
        if (ev.type === 'change' && Number(target.value) >= 95) answer(e,'ship','Ship it');
      };
      ['click','pointerdown','pointerup','change'].forEach(type=>wrapper.addEventListener(type,intercept,true));
    }
    calls.get(e.toolCallId)?.node.remove(); calls.set(e.toolCallId,{event:e,node:wrapper,committed:false,frozen:false}); messages.append(wrapper);
    raw.push({name:e.name,args:JSON.stringify(e.args).slice(0,1800)}); updateProof();
  }
  function reset(turnId = currentTurn) { for (const [id,c] of calls) if (!c.committed && (!turnId || c.node.dataset.turn === String(turnId))) { c.node.remove(); calls.delete(id); } }
  function safeFallback(url) { try { const u = new URL(url,location.origin); if (u.origin !== location.origin || !['/toothpaste.html','/mosquito.html','/games.html','/camping.html'].includes(u.pathname)) return null; u.searchParams.set('q',originalGoal); u.searchParams.set('sid',sid); return u.pathname + u.search; } catch { return null; } }
  function fallback(data) { clearThinking(); reset(); const n=el('div','notice','Scripted fallback'); const url=safeFallback(data.url); if(url){const a=el('a','','Continue →');a.href=url;n.append(el('br'),a);}else n.append(el('div','','Try a different shopping request.'));messages.append(n);updateProof({source:'scripted'}); }
  function receipt(data, toolCallId) {
    const o = data.order; if (!o?.id) return;
    if (!mock) Orders.upsertServer(o);
    const n=el('section','receipt'), cancelled = o.cancelled || o.canceled || ['cancelled','canceled'].includes(o.status);
    n.append(el('strong','',cancelled?'Order cancelled':'You’re all set'),el('small','',mock?'Mock order · not saved':'Demo order · simulated delivery'));
    const photos=el('div','receipt-items'); (o.items || []).forEach(i=>{const p=CATALOG.get(i.productId || i.product_id || i.id);if(p){const d=el('div');d.innerHTML=CATALOG.imgHTML(p);photos.append(d);}}); n.append(photos);
    if(Number.isFinite(Number(o.total))) n.append(el('strong','','₩'+Number(o.total).toLocaleString('en-US')));
    const track=el('a','','Track order →');track.href='/orders.html#'+encodeURIComponent(o.id);if(!mock)n.append(track);
    if(toolCallId){const b=el('button','',cancelled?'Redo':'Undo');b.type='button';b.onclick=()=>submit({event:{toolCallId,value:{action:cancelled?'redo':'undo',orderId:o.id},label:cancelled?'Redo order':'Undo order'}});n.append(b);}
    messages.querySelectorAll('.receipt button').forEach(b=>b.disabled=true); messages.append(n);
  }
  function handle(type,data) {
    if(type==='meta'){currentTurn=data.turnId;updateProof({source:mock?'mock':data.source,turnId:data.turnId,attempt:data.attempt});}
    if(type==='accepted'){accepted=true;if(activeBubble&&data.label)activeBubble.textContent=data.label;freezePrevious();}
    if(type==='thinking')status(data.steps || ['Matching catalogue']);
    if(type==='tool')renderTool(data);
    if(type==='reset')reset(data.turnId);
    if(type==='commit'){accepted=true;freezePrevious();for(const id of data.toolCallIds || []){const c=calls.get(id);if(c){c.committed=true;c.node.inert=false;c.node.dataset.provisional='false';}}clearThinking();}
    if(type==='order'){accepted=true;freezePrevious();clearThinking();receipt(data,activeRequest?.event?.toolCallId);}
    if(type==='fallback')fallback(data);
    if(type==='debug')updateProof(data);
    if(type==='error')throw Error(data.message || 'Could not finish this turn.');
    if(type==='done'){finished=true;clearThinking();}
  }
  async function readSSE(body) {
    const reader=body.getReader(),decoder=new TextDecoder();let pending='',event='message',lines=[];
    const line=s=>{if(s===''){if(lines.length){handle(event,JSON.parse(lines.join('\n')));}event='message';lines=[];}else if(s.startsWith('event:'))event=s.slice(6).trim();else if(s.startsWith('data:'))lines.push(s.slice(5).replace(/^ /,''));};
    const consume=final=>{let match;while((match=/\r\n|\r(?!$)|\n/.exec(pending))){line(pending.slice(0,match.index));pending=pending.slice(match.index+match[0].length);}if(final){if(pending)line(pending.replace(/\r$/,''));line('');pending='';}};
    try{while(true){const {value,done}=await reader.read();pending+=decoder.decode(value || new Uint8Array(),{stream:!done});consume(done);if(done)break;}}finally{reader.releaseLock();}
  }
  let activeRequest=null;
  async function submit(request) {
    if(busy)return;busy=true;accepted=false;finished=false;currentTurn=null;activeRequest=request;send.disabled=true;
    const previous=[...calls.values()].filter(c=>c.committed&&!c.frozen);previous.forEach(c=>c.node.inert=true);
    activeBubble=bubble(request.text || request.event.label);input.value='';input.blur();status(['Connecting…']);
    messages.dataset.busy='true';raw=[];proof={source:mock?'mock':'connecting'};updateProof(); const started=performance.now();
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);
    try {
      if(mock) await replay(request);
      else {
        const query=new URLSearchParams();for(const key of ['fresh','debug'])if(params.get(key)==='1')query.set(key,'1');const url='/api/turn'+(query.size?'?'+query:'');
        const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({sid,...request,...(params.get('fresh')==='1'?{fresh:true}:{})}),signal:controller.signal});
        if(!response.ok)throw Error(response.status===409?'Another turn is finishing. Try again.':'Shopping is temporarily unavailable.');
        if(!response.headers.get('content-type')?.includes('text/event-stream'))throw Error('Shopping is temporarily unavailable.');
        await readSSE(response.body); if(!finished)throw Error('Connection interrupted. Please try again.');
      }
    } catch(error) {
      clearThinking();reset();const n=el('div','notice',error.name==='AbortError'?'This is taking too long. Try again.':error.message);
      if(!accepted){activeBubble.remove();previous.forEach(c=>{if(c.node.isConnected){const old=c.node;renderTool(c.event);const restored=calls.get(c.event.toolCallId);restored.committed=true;restored.node.dataset.provisional='false';restored.node.inert=false;old.replaceWith(restored.node);}});const retry=el('button','','Try again');retry.onclick=()=>{n.remove();submit(request);};n.append(el('br'),retry);}
      messages.append(n);updateProof({error:'Turn failed'});
    } finally {clearTimeout(timeout);busy=false;send.disabled=false;messages.dataset.busy='false';updateProof({clientTotalMs:Math.round(performance.now()-started)});align();}
  }
  async function replay(request) {
    mockTurn++;messages.dataset.busy='true';const turnId='mock-'+mockTurn;
    handle('meta',{turnId,source:'mock'});handle('accepted',{label:request.text||request.event.label});handle('thinking',{steps:['Demo fixture · not a live model','Matching catalogue']});
    let fixture=[];
    if(request.event?.value==='ship'||request.event?.value?.action){handle('order',{order:{id:'MOCK-ORDER',createdAt:Date.now(),items:[{productId:/mosquit/i.test(originalGoal)?'net-king':'tp-median',quantity:1}],total:8900,cancelled:request.event?.value?.action==='undo'}});}
    else {
      if(/surprise/i.test(originalGoal))fixture=[['play_game',{game:'price',title:'Find your next favourite',productIds:['tp-median'],rounds:3}]];
      else if(/mosquit/i.test(originalGoal)&&mockTurn===1)fixture=[['ask_a_or_b',{question:'How about a quieter night?',options:[{value:'net',label:'A canopy net'},{value:'plug',label:'Plug-in repellent'}],theme:'grape',variant:'split'}]];
      else fixture=[['show_usual',{productId:/mosquit/i.test(originalGoal)?'net-king':'tp-median',variant:'compact',theme:'mint'}],['ship_it',{items:[{productId:/mosquit/i.test(originalGoal)?'net-king':'tp-median',quantity:1}],variant:'rocket',theme:'mint'}]];
      const toolCallIds=fixture.map((f,index)=>{const toolCallId=turnId+'-'+index;handle('tool',{turnId,index,toolCallId,name:f[0],args:f[1],provisional:true});return toolCallId;});handle('commit',{turnId,toolCallIds});
    }
    handle('debug',{model:'recorded fixture',source:'mock',ttftMs:0,totalMs:0,usage:{total_tokens:0},retries:0});handle('done',{turnId});
  }
  document.querySelector('#composer').onsubmit=e=>{e.preventDefault();const text=input.value.trim();if(text){if(!originalGoal)originalGoal=text;submit({text});}};
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.data?.type!=='game_complete')return;
    const c=[...calls.values()].find(c=>c.event.name==='play_game'&&c.committed&&!c.frozen&&c.node.querySelector('iframe')?.contentWindow===e.source);
    const token=c?.event.args?.launchToken || c?.event.args?.launch_token;
    if(!c||!token||e.data.token!==token||!Array.isArray(e.data.eventIds)||!e.data.eventIds.every(id=>typeof id==='string'&&id.length<=160))return;
    answer(c.event,{action:'complete',eventIds:e.data.eventIds},'Game complete');
  });
  if(originalGoal)submit({text:originalGoal});else input.focus();
})();
