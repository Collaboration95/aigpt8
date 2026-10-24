# Tiny ML preferences: a fitted model, visible before → after

**Decision:** one logistic model fitted on a disclosed synthetic population, plus a small per-session coefficient update from real game actions. Pure Node.js, no packages, no LLM in training or scoring. Build the Rapid fire path first; complete the other game adapters next.

**Probability contract:** return `p_buy` for every item, but label it **“Buy-intent probability · demo model”**. It predicts a positive preference response under this model. Synthetic outcomes and Want/Nope responses do not establish a calibrated probability of a real Coupang purchase. Keep “synthetic prior · live game learning” visible beside the numbers. Never invent a conversion rate, probability, weight delta, or uplift.

## 1. Current code and integration facts

Inspected 25 Oct 2026: `PLAN.md`, `ARCHITECTURE.md`, `HANDOFF.md`, `app/server.mjs`, `app/public/{games,dashboard}.html`, `app/public/data/products.json`, `app/public/memory.js`, and the catalogue adapter. Current code takes precedence over older architecture/handoff descriptions.

| Existing behaviour | Required change |
|---|---|
| `/api/prefs` adds client-supplied constants and stores before/after history in `app/data/prefs.json` | Keep as a legacy endpoint during migration; never use those constants as fitted coefficients or training labels |
| Dashboard `rank()` sums those constants and calls the result affinity | Read probabilities, ranks, coefficients and explanations from the model API |
| Games `emit()` sends category/brand/tag deltas | Send observed actions and canonical product IDs; the server computes gradients |
| `P` has aliases such as `chips`; `syncCatalog()` attaches the actual catalogue record | Post `p.item.id`, never the alias; disable learning if no actual item is attached |
| Rapid fire has **8** cards; Meh and timeout currently emit zero deltas | Build a **10-card** canonical catalogue deck; log Meh/timeout without fitting |
| Real game art/names are rebound from the catalogue | Use those actual names, prices and tags, not the aliases' original snack/pet stories |
| Games use localStorage `t8-sid`; dashboard also accepts `?sid=` | Both honour query `sid`, then localStorage, then `demo`; display “Guru · demo profile” |
| Live reload is `/__reload` in the current server | Keep it separate from `POST /api/events`; poll the model every 1.5 seconds |

There are **76 products, 10 categories, 19 brands and 42 usable tags** after excluding `game`, `history`, `usual`. Those three describe fixture/provenance, not taste. All four order IDs in `memory.js` exist in the catalogue.

## 2. Features, user context and snapshots

Build one stable, sorted feature dictionary from the catalogue at startup. Include all one-hot columns; L2 regularisation stabilises the redundant encoding. Coefficients are descriptive model parameters, not causal effects; correlated brands/categories/tags share credit.

| Feature block | Encoding |
|---|---|
| Intercept | `1`; learned globally and frozen during personal updates |
| Category | 10 one-hot `cat:<category>` columns |
| Price | `price:log = clip(log(price / 10000) / 2.5, -1, 1)` |
| Price band | `band:low` for <₩5,000; `mid` for ₩5,000–<₩20,000; `high` otherwise |
| Tags / traits | Multi-hot `trait:<tag>` from the actual catalogue; ignore the three provenance tags |
| Brand | 19 one-hot `brand:<lowercase-hyphenated-brand>` columns |
| User × item | `hist:category`, `hist:tags`, `hist:repeat`, each in [0,1] |

Total: **79 coefficients**, including the intercept. No item-ID or user-ID one-hot, sensitive demographics, guessed pet ownership or LLM-invented traits.

For order `o`, use recency mass `a_o = exp(-max(0, ageDays_o) / 180)`. Normalise masses to sum to one. `hist:category` is the historical mass in the candidate's category; `hist:tags` is the mean historical tag mass over the candidate's usable tags; `hist:repeat` is the mass for its exact item ID. These three interactions are user features conditioned on the candidate. The personal coefficient vector is the remaining user representation. Freeze history/context for one demo run.

Keep three distinct states:

1. **Population cold start:** fitted `w_G`, zero history features. A user with no orders starts here.
2. **Guru before games:** history from `memory.js` plus one weak positive update per past order, chronological, with weight 0.35 and learning rate 0.20. IDs/dates: `bed-king` (8 Mar), `bed-curtain` (11 Jul), `baby-monitor` (15 Aug), `tp-median` (13 Sep), all 2026. These are explicitly **demo orders**, not real customer records. Unordered items are unknown, not negative examples.
3. **Guru after games:** start from an immutable copy `b_Guru` of state 2 and fit live actions. Dashboard before/after always means state 2 → state 3; each event also records its immediate pre/post states.

Copy the four ID/date pairs into a small server fixture; do not execute browser `memory.js` in the server. Check the fixture against that file during integration. Pin the recency reference date, catalogue hash, feature dictionary, seed and model version so Reset reproduces the baseline exactly.

## 3. Learning rules and game labels

For features `x = f(user, item)`, `z = θᵀx`, `p = sigmoid(z) = 1 / (1 + exp(-z))`. The learner fits binary cross-entropy with SGD; this is standard logistic regression. See [SGD documentation](https://scikit-learn.org/stable/modules/sgd.html) and the [log-loss definition](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html).

For one live binary observation `(x,y)` with reliability weight `r`:

```text
L = r[-y log(p) - (1-y) log(1-p)] + (λ/2) Σ[j>0](θ_j - b_j)²
θ_j ← θ_j + η[r(y-p)x_j - λ(θ_j-b_j)]     for j > 0
θ_0 remains the fitted global intercept
η = 0.25, λ = 0.025, anchor b = immutable Guru-before vector
```

One SGD step per accepted observation; no repeated epochs over live taps. These hyperparameters are fixed demo choices, not a claim of optimal tuning. All features are bounded. Separate regularisation from the data gradient when explaining an event delta.

For Bracket winner `a` over loser `b`, let `d = f(u,a) - f(u,b)`, `q = sigmoid(θᵀd)`. Fit the same loss/update with `x=d`, `y=1`, `r=1`. This is a feature-based Bradley–Terry model: it learns relative preference, not that the loser would never be bought. Shared features and the intercept cancel in the data gradient; L2 can still shrink previously changed coefficients towards the baseline. See [paired-comparison research](https://arxiv.org/abs/2308.08644).

| Game/action | Observation used for fitting |
|---|---|
| Swipe ♥ / ✕ | Binary `1 / 0`, `r=1`, after a settled action |
| Rapid Want / Nope | Binary `1 / 0`, `r=1`; Meh and timeout use `label:null`, log only |
| Bracket | One pair `{winner, loser}` per duel; do not also fit winner=1 and loser=0 |
| Price guess | Record signed `q_g = clip(log(guess / actual), -1, 1)` and absolute relative error; guessing accurately measures price knowledge, not willingness to pay |
| Price “Worth it” / “Pass” | Binary `1 / 0` at the actual catalogue price, `r=1`; this updates the learned price coefficient as well as item attributes |
| Budget | On Done, selected items are positives with `r=0.5/k` each for `k` items; unselected items and toggled removals are unknown. One final basket is one event |

For Budget, sum those weighted data gradients at the same pre-basket vector, then apply one learning step and one L2 penalty. Its loss is `(0.5/k)Σ BCE(item,1) + (λ/2)||θ-b||²`. This makes the result independent of selection order and caps one basket's total data weight at 0.5.

A tiny auxiliary ridge estimate captures price expectations: `a ← a - 0.1[(a-q_g) + 0.1a]`, initially zero. Positive `a` means guesses exceed actual prices; negative means guesses fall below them. Show mean absolute relative error separately. Guess-only events leave buy-intent predictions unchanged. **Price sensitivity comes from acceptance/rejection across prices, not from awarding +0.3 “price-savvy” for an accurate guess.**

## 4. Synthetic platform prior and evaluation

Generate **2,000 synthetic shoppers × 20 exposed-item outcomes = 40,000 rows**, plus up to four synthetic positive history observations per shopper. Independently give about 25% of shoppers no history, so fitting and evaluation include cold starts. Sample five archetypes equally: value snacks/drinks, family/home, beauty/premium, practical kitchen/home, broad explorer. Their explicit generator coefficients and Bernoulli draws encode assumptions; they are never presented as learned facts about Coupang.

Each shopper has a latent teacher vector with category/tag preferences, price slope, small brand preference and random variation. For shoppers with history, sample four historical positives by rejection sampling from uniformly exposed catalogue items. Generate subsequent binary buy-intent outcomes from the teacher with that fixed history. Actual training sees only feature vectors and sampled 0/1 outcomes, never the teacher vector or its probabilities.

Split **by shopper** before fitting: first 1,600 shoppers / 32,000 rows train; remaining 400 / 8,000 rows test. All 20 rows from one shopper stay together. Historical positives precede these exposures. The test population never supplies gradients, epoch selection or threshold tuning. This evaluates known-catalogue generalisation across synthetic shoppers, not unseen products or real humans.

Fit global coefficients from zero for **5 shuffled epochs**, learning rate `0.04 / (1 + epoch)`, L2 `0.001` towards zero except the intercept. Use a seeded PRNG and Fisher–Yates shuffle. Generate/fit once before listening; record actual startup milliseconds. A few hundred milliseconds is a target to measure on the demo laptop, not a promised result. Personal inference and one update score only 76 × 79 features.

Report frozen global test metrics:

- Log loss: `-mean[y log(p) + (1-y)log(1-p)]`, clipping only metric probabilities to `[1e-12, 1-1e-12]`.
- Constant-prevalence baseline log loss using the **training** positive rate.
- Ten equal-width reliability bins with count, mean prediction and observed positive rate; `ECE = Σ(n_bin/N)|mean(p)_bin - mean(y)_bin|`. Empty bins have null means.
- Label all of these **held-out synthetic**. They do not improve when Guru plays and do not validate Guru's post-game probabilities. Do not display “real-user accuracy”. Calibration compares predicted probabilities with observed frequencies; log loss also reflects discrimination. See [calibration documentation](https://scikit-learn.org/stable/modules/calibration.html).

## 5. API contract and compatibility

| Endpoint | Contract |
|---|---|
| `POST /api/events` | `{sid, run_id, event_id, game, item_id, label, ts}`; binary label is 0/1/null. Bracket replaces item/label with `pair:{winner,loser}`. Price guess adds `stage:"guess", guess`; price verdict uses `stage:"verdict", label`. Budget uses `game:"budget", selected_ids, budget:30000` |
| Event response | `{event_id, seq, before, after, learned}`; before/after are immediate snapshots. Each includes the frozen pre-game values for cumulative comparison. No update for a retry |
| `GET /api/model?sid=demo` | `{sid, run_id, seq, profile, version, target, weights:[{feature,before,after,delta}], predictions:[...all 76], top:[...5], segment, history, priceExpectation, priceError}` |
| Prediction row | `{item_id,p_buy,beforeP,deltaP,rank,beforeRank,rankDelta,logit,terms}`; `rankDelta=beforeRank-rank`, positive means ↑. Tie-break by item ID |
| Explanation | Every active term `{feature,value,weight,contribution}` including intercept; expose top three by absolute contribution in the UI, with the remainder available |
| `GET /api/model/global` | Synthetic provenance, seed/version/hash/date, row/user counts, training time, coefficients, cold-start predictions, log loss, baseline, ECE and reliability bins |
| `POST /api/model/reset` | `{sid, profile:"guru"|"cold"}` → fresh run ID, sequence zero, deterministic baseline and empty game history. Default `guru`; `cold` has no past orders |

Add exact-path/method routes above the static handler. Keep `/__reload` intact. Require bounded `sid`, event IDs, valid run ID, known game/items, distinct pair IDs, finite positive guesses, and a unique nonempty budget selection whose catalogue-price sum is within budget. Reject inconsistent fields or forged learning weights/signals; never accept coefficients from clients. Limit JSON body size. `ts` is observational; server receipt order and monotonic `seq` determine updates.

Deduplicate by `(sid,run_id,event_id)` and return the original receipt; the same ID with changed payload is 409. A previous run's event is 409 after Reset. Queue writes per session; use one client Promise queue and retain an event's ID during retries. A failed submission stays visibly pending until retried. Dashboard ignores older sequences and changes its run ID on Reset. This prevents double-taps, polling races and late pre-reset requests from fabricating learning.

Keep model state and receipts in memory for the first two-hour build; page refresh preserves them, **server restart clears live game learning**. Optional persistence belongs under already-ignored `app/data/sessions/`, with model/version checks and atomic writes. Do not store this runtime data in the public catalogue or source tree commits.

Migrate games' `initialPrefs`, `emit`, `tasteHTML` and recommendation portion of `learn()` together, then dashboard fetch/reset. Keep cosmetic game-summary chips separate from learned coefficients. Funnel product picks use the same model probabilities as the dashboard. Leave `/api/prefs` available for old callers, labelled legacy if shown; do not dual-train or import its additive totals. Remove/rename dashboard “Seed demo” as an explicitly labelled synthetic replay; it is not live user evidence.

## 6. Executable JS sketch (single module; split during implementation)

This is the numerical core, not HTTP validation/persistence code. Route validation must run before `event()`. Dates/IDs below mirror `memory.js`. No external dependencies.

```js
import { createHash, randomUUID } from 'node:crypto';
const GURU = [
  ['bed-king','2026-03-08'], ['bed-curtain','2026-07-11'],
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
  const semantic=items.map(({id,price,category,tags,brand})=>({id,price,category,tags,brand}));
  const hash=createHash('sha256').update(JSON.stringify(semantic)).digest('hex');
  const version=`ml-demo-v1:${hash.slice(0,12)}:${seed}:${asOf}`;
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
  function step(w,x,y,anchor,eta=.25,lambda=.025,r=1,freezeBias=true) {
    const p=sig(dot(w,x)), g=r*(p-y);
    for(let j=freezeBias?1:0;j<D;j++)
      w[j]-=eta*(g*x[j]+(j?lambda*(w[j]-anchor[j]):0));
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
    const safe=p=>clip(p,1e-12,1-1e-12), ll=(y,p)=>-y*Math.log(p)-(1-y)*Math.log(1-p);
    for(const {x,y} of rows) {
      const p=sig(dot(w,x)), b=bins[Math.min(9,Math.floor(p*10))];
      b.n++; b.p+=p; b.y+=y; loss+=ll(y,safe(p)); baseLoss+=ll(y,safe(baseRate));
    }
    const reliability=bins.map((b,k)=>({bin:k,n:b.n,
      prediction:b.n?b.p/b.n:null,observed:b.n?b.y/b.n:null}));
    return {n:rows.length,logLoss:loss/rows.length,baselineLogLoss:baseLoss/rows.length,
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
  function snapshot(s) {
    const baseline=new Map(ranked(s.anchor,s.h).map(p=>[p.item_id,p]));
    const predictions=ranked(s.w,s.h).map(p=>{const b=baseline.get(p.item_id);
      return {...p,beforeP:b.p_buy,deltaP:p.p_buy-b.p_buy,beforeRank:b.rank,rankDelta:b.rank-p.rank};});
    return {sid:s.sid,run_id:s.run,seq:s.seq,profile:s.profile,version,target:'buy-intent-proxy',
      weights:names.map((feature,j)=>({feature,before:s.anchor[j],after:s.w[j],delta:s.w[j]-s.anchor[j]})),
      predictions,top:predictions.slice(0,5),segment:segment(s),learned:s.learned,
      history:s.log.slice(-20),priceExpectation:s.expectation,priceError:s.guesses?s.error/s.guesses:null};
  }
  function reset(sid,profile='guru') {
    const orders=(profile==='guru'?GURU:[]).filter(o=>byId.has(o.item_id)), h=history(orders), w=globalW.slice();
    for(const o of orders) step(w,encode(byId.get(o.item_id),h),1,globalW,.20,.025,.35);
    const s={sid,profile,h,w,anchor:w.slice(),run:randomUUID(),seq:0,learned:0,
      log:[],receipts:new Map(),expectation:0,error:0,guesses:0};
    sessions.set(sid,s); return snapshot(s);
  }
  function session(sid) {if(!sessions.has(sid))reset(sid); return sessions.get(sid);}
  function event(e) {
    const s=session(e.sid);
    if(e.run_id!==s.run) throw Error('409 stale run');
    if(s.receipts.has(e.event_id)) return s.receipts.get(e.event_id);
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
        for(let j=1;j<D;j++) g[j]+=error*x[j];
      }
      for(let j=1;j<D;j++) s.w[j]-=.25*(g[j]+.025*(s.w[j]-s.anchor[j]));
      learned=true;
    } else if(e.label===0||e.label===1) {
      step(s.w,encode(byId.get(e.item_id),s.h),e.label,s.anchor); learned=true;
    }
    s.seq++; if(learned)s.learned++;
    const deltas=names.map((feature,j)=>({feature,delta:s.w[j]-before.weights[j].after}));
    s.log.push({seq:s.seq,receivedAt:Date.now(),event:{...e},learned,deltas});
    const receipt={event_id:e.event_id,seq:s.seq,before,after:snapshot(s),learned};
    s.receipts.set(e.event_id,receipt); return receipt;
  }
  return {reset,event,model:sid=>snapshot(session(sid)),global:()=>({
    version,catalogueHash:hash,asOf,seed,synthetic:true,target:'buy-intent-proxy',
    users:2000,trainUsers:1600,testUsers:400,trainRows:train.length,testRows:test.length,
    trainColdRows:train.filter(r=>r.cold).length,testColdRows:test.filter(r=>r.cold).length,
    epochs:5,trainMs,features:names,weights:Array.from(globalW),metrics:heldout,
    predictions:ranked(globalW,history())})};
}
```

`terms` are additive **log-odds** contributions: their sum equals `logit`, and `sigmoid(logit)` equals the returned probability. Do not add contribution values as percentages. For the latest event, compute `Δθ = after.weights.after - before.weights.after`; cumulative dashboard bars compare against `weights.before`. In a split implementation, keep encoding and SGD in `app/ml/model.mjs`; export synthetic generation/metrics from `app/ml/synth.mjs` through injected encoder/step helpers.

## 7. Dashboard and judge story

Use a mobile single-column layout at 390×844: Guru/profile and data-source badge → before/after top five with actual photos → signed coefficient bars → expandable event explanation → compact held-out synthetic metrics. Keep both states on the same numerical scales and animate only after a newer accepted sequence. Respect reduced motion.

- Return all 76 predictions; show top five plus “all items”. Keep a visible immutable “Before games” state. Rank movement is over the full catalogue, even when an item enters the top five.
- Bars show signed before/after coefficients on a fixed symmetric scale for that comparison, plus exact delta. Include price/history groups. A negative coefficient extends left of zero.
- “Explain” shows baseline intercept plus the strongest active terms, remainder and total. For Pepero, derive the line from the receipt: **“Because you wanted Pepero almond → snacks [actual signed coefficient delta]”**. A requested example such as `+0.31` is never a literal fixture or guaranteed outcome.
- Segment is a transparent heuristic over fitted coefficients, not a separately trained clustering model. `Price-savvy snacker` means snacks has the largest category coefficient and the model's ₩3,000-vs-₩30,000 price-only logit difference exceeds 0.3. Wait for three informative game actions; otherwise say “Still learning”. Price knowledge remains a separate metric.
- Metric label: “8,000 held-out synthetic exposures · 400 shoppers”. Show actual log loss against the prevalence baseline and ECE/reliability bins. Avoid “calibrated” as a success badge.

Suggested judge narration: “When I know what I need, the app gets out of the way. When I don't, Surprise me offers a short game that also leads to a purchasable basket. Want/Nope gives an explicit signal; Bracket gives a comparison; Budget adds a constraint. These complement clicks and reveal context quickly. Here is the same fitted model before and after those choices. Every probability and bar comes from its calculation. Our population is synthetic and Guru's history is a demo fixture; these are real parameter updates, and real purchase calibration is future work.”

Do not claim games have already improved sales or that every click is a purchase label. The funnel is the implemented path from discovery to product picks/cart; conversion impact is unmeasured. Correlated catalogue attributes and ten observations limit identifiability and certainty. There is no replenishment/timing model: history affinity is not a forecast of the next real order. A top item need not change after every tap; show the actual ranks and deltas even when it stays first.

## 8. Live demo (about 60–90 seconds)

1. Set both phone games and dashboard to `sid=demo`. Reset to `profile:"guru"`; wait for the returned new run ID. Show population → four demo orders → immutable Guru-before predictions, including each actual `p_buy`.
2. Open Rapid fire. Use ten actual IDs, for example `snack-2, beauty-1, snack-7, home-4, drink-7, kitchen-8, snack-3, beauty-6, drink-6, home-2`. The first card is Pepero almond. Build the deck from canonical records, not undefined `P['snack-2']` aliases.
3. Make **ten live choices**. For a clear rehearsal, Want the snacks/drinks and Nope the other items; also test that Meh/timeout remains neutral. Never prewrite the resulting coefficients or probabilities.
4. Dashboard polling receives increasing sequences and animates the actual top-five/rank changes. Open Pepero's latest receipt to show its observed action, computed snacks delta and probability change. The pre-game snapshot remains unchanged.
5. Show the frozen synthetic log-loss/calibration panel and its data-source label. End on game recommendations → add a chosen product to the existing basket/order flow, demonstrating the funnel. Reset and replay only if clearly labelled as a new run.

## 9. Build ownership and two-hour priority order

**One integration owner, no review agents.** Confirm the API shape first. With two builders, A owns numerical/backend files and B owns the two HTML clients; neither edits the other's files. Existing builders must hand those areas to the named owner before implementation starts. With one builder, complete P0 in the same order before P1.

| Priority / time | Owner | Files | Concrete delivery |
|---|---|---|---|
| P0 · 0–15 min | A | `app/ml/model.test.mjs` then `app/ml/model.mjs` | Focused checks for gradient direction, immutable baseline, pairwise shared-feature cancellation and deterministic reset; 79-feature encoder and logistic SGD |
| P0 · 15–40 min | A | `app/ml/synth.mjs`, `app/ml/model.mjs` | Seeded population, shopper split, fitted global model, Guru fixture/bootstrap, held-out metrics |
| P0 · 40–60 min | A, integration owner | `app/server.mjs` | Four API routes, validation, run IDs, deduplication, per-session serialisation and observable failures; leave other routes/services intact |
| P0 · 0–60 min, parallel | B | `app/public/games.html` | Shared sid/run lifecycle, queued raw events, ten-card Rapid deck, actual item IDs and Want/Nope/null; replace old preference result ranking |
| P0 · 60–85 min | B | `app/public/dashboard.html` | Frozen-before/current probabilities, top-five rank movement, signed coefficient bars, actual event deltas and metrics; responsive at 390×844 |
| P1 · 60–90 min | A/B in owned files | Engine/routes / `games.html` respectively | Bracket pairs, final Budget positives, Price guess auxiliary record plus acceptance labels, Swipe; inspect request payloads, not just animations |
| P0 · 90–120 min | A integrates; B fixes clients | Existing owned files; targeted tests | End-to-end ten-action run, retry/reset races, meaningful numeric assertions, touch Playwright check and immediate screenshots/results |
| Stretch | A | `app/data/sessions/` runtime files | Optional restart persistence with version checks; defer if it threatens the core demo |

**Doable in two hours:** global fit, Guru baseline, live Rapid fire, all-item probabilities, ranks, coefficient deltas, explanations, synthetic metrics, reset; the other four adapters are small once the API works. No deployment, GPU, Python service, vector database, learned embeddings, real conversion calibration or production identity layer is required for this build.

Validation contract for builders:

- Numerical: held-out shoppers disjoint from training; all probabilities finite in [0,1]; explanations reconstruct logits; changed labels change fitted results; global coefficients/metrics never mutate when Guru plays. Report measured startup time and event latency; target startup <1 s and event compute <10 ms on this laptop.
- State: a retry has the same receipt and no second update; another sid is isolated; Reset reproduces baseline exactly and rejects the previous run; Meh/timeout/guess-only changes no preference coefficient. Budget toggle churn and rejected requests teach nothing.
- UI: Playwright at 390×844 with touch, no page errors or horizontal overflow; ten card actions post ten receipts, pending saves finish, full-catalogue rank arrows match the API, dashboard before remains fixed. Capture before/after screenshots immediately. These are local browser checks, not physical-iPhone or public-endpoint proof.
- Commands: `node --test app/ml/model.test.mjs`; start a separate local test server with `PORT=8827 HOST=127.0.0.1 node app/server.mjs`, then use the repository's Playwright workflow against that port. Record exact commands, results and failures; stop only the test server you started. Never stop the other challenge's services.

| Risk | Minimum response |
|---|---|
| Synthetic calibration mistaken for real buying accuracy | Keep source/target labels beside probabilities and metrics; use the stated judge narration |
| All snacks share Lotte and similar tags | Show shared-feature explanations; retain L2; don't claim independent causal category/brand discovery |
| Different products have identical encoded features | Return equal probabilities with ID tie-breaks; the model cannot distinguish those products yet |
| Sparse positives push preferences too strongly | Weak historical/basket weights, one pass per action, fixed intercept, baseline anchor; expose actual movement |
| Stale game tab or duplicate request | New run ID on reset, idempotent event ID, serial processing and pending-save state |
| App files changing under other agents | One owner per area and a frozen API contract; this document alone does not transfer active file ownership |
| Startup slower than the target | Measure; move identical seeded fitting to a local JS pretraining script/artifact if necessary, keeping version/hash/metrics provenance |
| Server restart loses live learning | Disclose process-local state; rehearse without restart or implement ignored persistence as stretch |

## 10. Design-pass evidence and next action

This pass writes this document only. No `app/` edits, commits, service restarts or endpoint/UI verification. Source inspection confirms the counts, fixture IDs, additive store and eight-card Rapid deck above. Numerical-sketch validation results are recorded below after execution; they establish only a local reference calculation, not an implemented API or demo result.

**Executed locally:** `node --input-type=module` with a read-only stdin assertion harness that extracted the JS block above, imported it through a data URL and read the actual catalogue. Result: PASS for finite probabilities, explanation reconstruction, positive-label direction, immutable baseline/global model, deterministic second-engine fit/reset, duplicate receipt, stale-run rejection, neutral/guess-only actions, pairwise shared-feature cancellation, basket-order invariance, session isolation and full-catalogue rank deltas. No numerical failures. HTTP validation and browser behaviour remain untested.

Measured reference run: engine initialisation **118.5 ms**, generator/training/metrics **113.2 ms**, maximum of ten in-memory event calls **0.72 ms**. These are single local measurements, including snapshot construction but excluding HTTP/UI. Held-out synthetic log loss **0.54295**, prevalence baseline **0.56480**, ECE **0.03781**. Cold-start rows: 8,160 train and 2,000 test, included in the totals above. Do not copy these measurements into a live metric response; recompute them.

For the exact ten rehearsed choices in section 8: Guru-before top item was `baby-net` at **0.46428**; afterwards Pepero almond (`snack-2`) ranked first at **0.83106**, up **27 places** from **0.32788**. Its first Want changed the snacks coefficient by **+0.16803**, not a prewritten +0.31. These are computed synthetic-prior/demo-sequence results; they are not live judge input or observed purchases.

Minimal repeat command from `team8/` (the larger assertion harness above was run in memory and not saved):

```sh
node --input-type=module <<'NODE'
import fs from 'node:fs';
const doc=fs.readFileSync('plans/ml-preferences.md','utf8');
const code=doc.match(/```js\n([\s\S]*?)\n```/)[1];
const {createPreferenceEngine}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const model=createPreferenceEngine(JSON.parse(fs.readFileSync('app/public/data/products.json','utf8')));
const before=model.reset('demo'), ids=['snack-2','beauty-1','snack-7','home-4','drink-7','kitchen-8','snack-3','beauty-6','drink-6','home-2'];
for(const [i,item_id] of ids.entries()) model.event({sid:'demo',run_id:before.run_id,
  event_id:'rehearsal-'+i,game:'rapid',item_id,label:/^(snack|drink)-/.test(item_id)?1:0});
console.log({metrics:model.global().metrics,before:before.top,after:model.model('demo').top});
NODE
```

**Next action:** integration owner assigns A/B ownership and implements P0, starting with the focused numerical checks and the event contract.
