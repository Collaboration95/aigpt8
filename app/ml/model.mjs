import { createHash, randomUUID } from 'node:crypto';
export const GURU = [
  ['bed-sheet-king','2026-03-12'], ['bed-curtain','2026-07-11'],
  ['baby-monitor','2026-08-15'], ['tp-median','2026-09-13']
].map(([item_id,date]) => ({item_id,date}));
const clip = (v,a,b) => Math.max(a,Math.min(b,v));
const sig = z => z >= 0 ? 1/(1+Math.exp(-z)) : Math.exp(z)/(1+Math.exp(z));
const dot = (a,b) => { let z=0; for(let j=0;j<a.length;j++) z+=a[j]*b[j]; return z; };
const rng = seed => () => {
  let t=seed+=0x6D2B79F5; t=Math.imul(t^(t>>>15),t|1);
  t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296;
};
const slug = s => s.toLowerCase().replace(/\s+/g,'-');
export function catalogueHash(catalogue) {
  const semantic=[...catalogue].sort((a,b)=>a.id.localeCompare(b.id)).map(({id,price,category,tags,brand})=>({id,price,category,tags:[...tags].sort(),brand}));
  return createHash('sha256').update(JSON.stringify(semantic)).digest('hex');
}
export function createPreferenceEngine(catalogue, asOf=Date.parse('2026-10-25T00:00:00+08:00')) {
  const items=[...catalogue].sort((a,b)=>a.id.localeCompare(b.id));
  const byId=new Map(items.map(p=>[p.id,p])), seed=20261025;
  const tags=p=>p.tags.filter(t=>!['game','history','usual'].includes(t));
  const unique=a=>[...new Set(a)].sort();
  const cats=unique(items.map(p=>p.category));
  const names=['bias','price:log','band:low','band:mid','band:high',
    ...cats.map(c=>'cat:'+c), ...unique(items.flatMap(tags)).map(t=>'trait:'+t),
    ...unique(items.map(p=>slug(p.brand))).map(b=>'brand:'+b),
    'hist:category','hist:tags','hist:repeat'];
  const J=new Map(names.map((n,j)=>[n,j])), D=names.length, zero=()=>new Float64Array(D);
  const hash=catalogueHash(items);
  const version=`ml-demo-v3:${hash.slice(0,12)}:${seed}:${asOf}`;
  function history(orders=[]) {
    const h={c:new Map(),t:new Map(),r:new Map()}; let total=0;
    const add=(m,k,v)=>m.set(k,(m.get(k)||0)+v);
    for(const o of orders) {
      const p=byId.get(o.item_id); if(!p) continue;
      const a=Math.exp(-Math.max(0,(asOf-Date.parse(o.date))/864e5)/180); total+=a;
      add(h.c,p.category,a); tags(p).forEach(t=>add(h.t,t,a)); add(h.r,p.id,a);
    }
    for(const m of Object.values(h)) for(const [k,v] of m) m.set(k,v/(total||1));
    return h;
  }
  function encode(p,h) {
    const x=zero(), put=(k,v=1)=>{if(J.has(k)) x[J.get(k)]=v;}, tt=tags(p);
    put('bias'); put('price:log',clip(Math.log(p.price/10000)/2.5,-1,1));
    put('band:'+(p.price<5000?'low':p.price<20000?'mid':'high'));
    put('cat:'+p.category); tt.forEach(t=>put('trait:'+t)); put('brand:'+slug(p.brand));
    put('hist:category',h.c.get(p.category)||0);
    put('hist:tags',tt.reduce((s,t)=>s+(h.t.get(t)||0),0)/(tt.length||1));
    put('hist:repeat',h.r.get(p.id)||0); return x;
  }
  // Personal feedback teaches category/trait/brand affinity. Global price and
  // history coefficients stay fixed: one snack reaction is not a new price prior.
  const personal=j=>/^(cat:|trait:|brand:)/.test(names[j]);
  function step(w,x,y,anchor,eta=.25,lambda=.025,r=1,freezeBias=true) {
    const p=sig(dot(w,x)), g=r*(p-y);
    const norm=freezeBias?Math.max(1,Math.sqrt(x.reduce((n,v,j)=>n+(personal(j)?v*v:0),0))):1;
    for(let j=freezeBias?1:0;j<D;j++) {
      if(freezeBias&&!personal(j))continue;
      w[j]-=eta*(g*x[j]/norm+(j?lambda*(w[j]-anchor[j]):0));
    }
    return p;
  }
  function synth() {
    const random=rng(seed), train=[], test=[], empty=history();
    const A=[
      [['snacks','drinks'],['sweet','value'],-.8],
      [['baby','bedding','home'],['baby','family'],-.4],
      [['beauty'],['premium','care'],.35],
      [['kitchen','home'],['cooking','value'],-.6],
      [['snacks','drinks','mosquito'],['outdoors','refreshing'],-.15]
    ];
    for(let u=0;u<2000;u++) {
      const [cc,tt,cost]=A[u%5], teacher=zero(), put=(k,v)=>{if(J.has(k))teacher[J.get(k)]=v;};
      put('bias',-1.8+(random()-.5)*.8); put('price:log',cost+(random()-.5)*.2);
      cats.forEach(c=>put('cat:'+c,(cc.includes(c)?1.5:0)+(random()-.5)*.3));
      tt.forEach(t=>put('trait:'+t,.5));
      put('brand:'+slug(items[Math.floor(random()*items.length)].brand),.3);
      put('hist:category',.65); put('hist:tags',.35); put('hist:repeat',.7);
      const orders=[], historyCount=random()<.25?0:4;
      for(let tries=0;orders.length<historyCount&&tries<1000;tries++) {
        const p=items[Math.floor(random()*items.length)];
        if(random()<sig(dot(teacher,encode(p,empty))))
          orders.push({item_id:p.id,date:new Date(asOf-(1+random()*179)*864e5).toISOString()});
      }
      const h=history(orders);
      for(let k=0;k<20;k++) {
        const p=items[Math.floor(random()*items.length)], x=encode(p,h);
        const y=Number(random()<sig(dot(teacher,x)));
        (u<1600?train:test).push({user:u,cold:historyCount===0,x,y});
      }
    }
    return {train,test};
  }
  function metrics(w,rows,baseRate) {
    const bins=Array.from({length:10},()=>({n:0,p:0,y:0})); let loss=0,baseLoss=0;
    const scored=rows.map(({x,y})=>({p:sig(dot(w,x)),y})).sort((a,b)=>a.p-b.p);
    let rankSum=0,positives=0;
    for(let i=0;i<scored.length;){let k=i+1;while(k<scored.length&&scored[k].p===scored[i].p)k++;for(let j=i;j<k;j++)if(scored[j].y){positives++;rankSum+=(i+1+k)/2;}i=k;}
    const auc=(rankSum-positives*(positives+1)/2)/(positives*(rows.length-positives));
    const safe=p=>clip(p,1e-12,1-1e-12), ll=(y,p)=>-y*Math.log(p)-(1-y)*Math.log(1-p);
    for(const {x,y} of rows) {
      const p=sig(dot(w,x)), b=bins[Math.min(9,Math.floor(p*10))];
      b.n++; b.p+=p; b.y+=y; loss+=ll(y,safe(p)); baseLoss+=ll(y,safe(baseRate));
    }
    const reliability=bins.map((b,k)=>({bin:k,n:b.n,
      prediction:b.n?b.p/b.n:null,observed:b.n?b.y/b.n:null}));
    return {n:rows.length,auc,logLoss:loss/rows.length,baselineLogLoss:baseLoss/rows.length,
      ece:reliability.reduce((s,b)=>s+(b.n?b.n*Math.abs(b.prediction-b.observed):0),0)/rows.length,
      reliability};
  }
  const started=performance.now(), {train,test}=synth(), globalW=zero(), origin=zero(), random=rng(seed+1);
  for(let epoch=0;epoch<5;epoch++) {
    for(let i=train.length-1;i>0;i--) {const j=Math.floor(random()*(i+1)); [train[i],train[j]]=[train[j],train[i]];}
    for(const row of train) step(globalW,row.x,row.y,origin,.04/(1+epoch),.001,1,false);
  }
  const heldout=metrics(globalW,test,train.reduce((s,r)=>s+r.y,0)/train.length);
  const trainMs=performance.now()-started, sessions=new Map();
  function ranked(w,h) {
    return items.map(p=>{
      const x=encode(p,h), logit=dot(w,x);
      const terms=names.flatMap((feature,j)=>x[j]?[{feature,value:x[j],weight:w[j],contribution:w[j]*x[j]}]:[]);
      terms.sort((a,b)=>Math.abs(b.contribution)-Math.abs(a.contribution));
      return {item_id:p.id,p_buy:sig(logit),logit,terms};
    }).sort((a,b)=>b.p_buy-a.p_buy||a.item_id.localeCompare(b.item_id)).map((p,k)=>({...p,rank:k+1}));
  }
  function segment(s) {
    if(s.learned<3) return 'Still learning';
    const category=cats.slice().sort((a,b)=>s.w[J.get('cat:'+b)]-s.w[J.get('cat:'+a)])[0];
    const tilt=s.w[J.get('band:low')]-s.w[J.get('band:high')]
      +s.w[J.get('price:log')]*(Math.log(.3)/2.5-Math.log(3)/2.5);
    return category==='snacks'?(tilt>.3?'Price-savvy snacker':'Snack explorer'):category+' explorer';
  }
  function summary(s) {
    const refs=(feature,positive)=>s.log.filter(h=>h.learned&&h.deltas.some(d=>d.feature===feature&&(positive?d.delta-(h.regularization?.find(r=>r.feature===feature)?.delta||0)>1e-8:d.delta-(h.regularization?.find(r=>r.feature===feature)?.delta||0)< -1e-8))).map(h=>({event_id:h.event.event_id,seq:h.seq}));
    const candidates=names.map((feature,j)=>({feature,weight:s.w[j]})).filter(w=>/^(cat:|band:|trait:)/.test(w.feature));
    const describe=w=>w.feature.replace('cat:','').replace('band:','').replace('trait:','').replace(/^low$/,'low prices').replace(/^mid$/,'mid prices').replace(/^high$/,'high prices');
    const claims=[];
    for(const positive of [true,false]) {
      const ranked=candidates.filter(w=>positive?w.weight>0:w.weight<0).sort((a,b)=>positive?b.weight-a.weight:a.weight-b.weight);
      // Personal claims require observed supporting gradients; population-only signals are labelled.
      const seen=new Set(claims.map(c=>c.key));const supported=ranked.filter(w=>{const k=describe(w).replace(/s$/,'');if(seen.has(k)||!refs(w.feature,positive).length)return false;seen.add(k);return true;}).slice(0,2);
      for(const w of supported)claims.push({key:describe(w).replace(/s$/,''),text:(positive?'Leans toward ':'Less inclined toward ')+describe(w),feature:w.feature,weight:w.weight,evidence:refs(w.feature,positive)});
    }
    const reactions=s.log.filter(h=>h.learned).length,orders=s.profile==='guru'?GURU.filter(o=>byId.has(o.item_id)):[];
    const text=(claims.length?claims.map(c=>c.text).join('; '):s.profile==='guru'?'History-informed baseline; awaiting game reactions':'Population model only; no personal history')+`. Based on ${reactions} game reactions + ${orders.length} past orders.`;
    return {text,claims,orders};
  }
  function snapshot(s) {
    const baseline=new Map(ranked(s.anchor,s.h).map(p=>[p.item_id,p]));
    const predictions=ranked(s.w,s.h).map(p=>{const b=baseline.get(p.item_id);
      return {...p,beforeP:b.p_buy,deltaP:p.p_buy-b.p_buy,beforeRank:b.rank,rankDelta:b.rank-p.rank};});
    return {sid:s.sid,run_id:s.run,seq:s.seq,profile:s.profile,version,target:'buy-intent-proxy',
      weights:names.map((feature,j)=>({feature,before:s.anchor[j],after:s.w[j],delta:s.w[j]-s.anchor[j]})),
      predictions,top:predictions.slice(0,5),segment:segment(s),learned:s.learned,
      summary:summary(s),catalogueHash:hash,demoOrders:s.profile==='guru'?GURU:[],history:s.log.slice(),priceExpectation:s.expectation,priceError:s.guesses?s.error/s.guesses:null};
  }
  function reset(sid,profile='guru') {
    profile=profile==='cold'?'new':profile;
    const orders=(profile==='guru'?GURU:[]).filter(o=>byId.has(o.item_id)), h=history(orders), w=globalW.slice();
    for(const o of orders) step(w,encode(byId.get(o.item_id),h),1,globalW,.20,.025,.35);
    const s={sid,profile,h,w,anchor:w.slice(),run:randomUUID(),seq:0,learned:0,
      log:[],payloads:new Map(),receipts:new Map(),expectation:0,error:0,guesses:0};
    sessions.set(sid,s); return snapshot(s);
  }
  function session(sid) {if(!sessions.has(sid))reset(sid); return sessions.get(sid);}
  function event(e) {
    const s=session(e.sid);
    if(e.run_id!==s.run) throw Error('409 stale run');
    const fingerprint=JSON.stringify(Object.fromEntries(Object.keys(e).sort().map(k=>[k,e[k]])));
    if(s.receipts.has(e.event_id)){if(s.payloads.get(e.event_id)!==fingerprint)throw Error('409 event ID payload conflict');return s.receipts.get(e.event_id);}
    const before=snapshot(s); let learned=false;
    if(e.game==='price'&&e.stage==='guess') {
      const actual=byId.get(e.item_id).price, q=clip(Math.log(e.guess/actual),-1,1);
      s.expectation-=.1*(s.expectation-q+.1*s.expectation);
      s.error+=Math.abs(e.guess-actual)/actual; s.guesses++;
    } else if(e.game==='bracket') {
      const a=encode(byId.get(e.pair.winner),s.h), b=encode(byId.get(e.pair.loser),s.h);
      step(s.w,a.map((v,j)=>v-b[j]),1,s.anchor); learned=true;
    } else if(e.game==='budget') {
      const g=zero();
      for(const id of e.selected_ids) {
        const x=encode(byId.get(id),s.h), error=.5/e.selected_ids.length*(sig(dot(s.w,x))-1);
        for(let j=1;j<D;j++) if(personal(j))g[j]+=error*x[j]/Math.max(1,Math.sqrt(x.reduce((n,v,k)=>n+(personal(k)?v*v:0),0)));
      }
      for(let j=1;j<D;j++) if(personal(j))s.w[j]-=.25*(g[j]+.025*(s.w[j]-s.anchor[j]));
      learned=true;
    } else if(e.label===0||e.label===1) {
      step(s.w,encode(byId.get(e.item_id),s.h),e.label,s.anchor); learned=true;
    }
    s.seq++; if(learned)s.learned++;
    const deltas=names.map((feature,j)=>({feature,delta:s.w[j]-before.weights[j].after}));
    const regularization=before.weights.map((w,j)=>({feature:w.feature,delta:personal(j)?-.25*.025*(w.after-w.before):0}));
    s.log.push({seq:s.seq,receivedAt:Date.now(),event:{...e},learned,deltas,regularization:learned?regularization:[],priceGuess:e.stage==='guess'?{signedLogRatio:clip(Math.log(e.guess/byId.get(e.item_id).price),-1,1),absoluteRelativeError:Math.abs(e.guess-byId.get(e.item_id).price)/byId.get(e.item_id).price}:null});
    const receipt={event_id:e.event_id,seq:s.seq,before,after:snapshot(s),learned};
    s.payloads.set(e.event_id,fingerprint);s.receipts.set(e.event_id,receipt); return receipt;
  }
  function replay(sid,profile,run,events) {
    reset(sid,profile);session(sid).run=run;
    for(const e of events)event(e);
    return snapshot(session(sid));
  }
  function contextFor(sid,limit=12) {
    const s=snapshot(session(sid)), compact=w=>({feature:w.feature,weight:Number(w.after.toFixed(3))});
    const weights=s.weights.filter(w=>w.feature!=='bias');
    return {segment:s.segment,summary:s.summary.text,
      positive:weights.filter(w=>w.after>0).sort((a,b)=>b.after-a.after).slice(0,8).map(compact),
      negative:weights.filter(w=>w.after<0).sort((a,b)=>a.after-b.after).slice(0,5).map(compact),
      top:s.predictions.slice(0,Math.max(1,Math.min(12,limit))).map(p=>({id:p.item_id,p:Number(p.p_buy.toFixed(3))})),seq:s.seq,run_id:s.run_id};
  }
  function compare(sid) {
    const original=session(sid);
    if(original.comparison?.seq===original.seq)return original.comparison.value;
    const value={};
    try {for(const profile of ['new','guru']) {
      const s=replay(sid,profile,original.run,original.log.map(h=>h.event));
      value[profile]={top:s.top.slice(0,3),segment:s.segment};
    }} finally {sessions.set(sid,original);}
    original.comparison={seq:original.seq,value};return value;
  }
  return {compare,replay,contextFor,restoreRun:(sid,run)=>{session(sid).run=run;},reset,event,model:sid=>snapshot(session(sid)),global:()=>({
    version,catalogueHash:hash,asOf,seed,synthetic:true,target:'buy-intent-proxy',
    users:2000,trainUsers:1600,testUsers:400,trainRows:train.length,testRows:test.length,
    trainColdRows:train.filter(r=>r.cold).length,testColdRows:test.filter(r=>r.cold).length,
    epochs:5,trainMs,features:names,weights:Array.from(globalW),metrics:heldout,
    predictions:ranked(globalW,history())})};
}