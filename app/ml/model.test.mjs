import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createPreferenceEngine,GURU} from './model.mjs';
const catalogue=JSON.parse(fs.readFileSync(new URL('../public/data/products.json',import.meta.url)));
const engine=createPreferenceEngine(catalogue);
const event=(s,id,label)=>({sid:s.sid,run_id:s.run_id,event_id:id,game:'rapid',item_id:'snack-2',label});
test('seeded fit, fixed baseline, explanations and gradient direction',()=>{
 const a=engine.reset('test'), b=createPreferenceEngine(catalogue).reset('test');
 assert.deepEqual(a.weights,b.weights);assert.deepEqual(a.segment,b.segment);assert.equal(a.weights.length,engine.global().features.length);
 const r=engine.event(event(a,'want',1));
 assert.ok(r.after.predictions.find(p=>p.item_id==='snack-2').p_buy>a.predictions.find(p=>p.item_id==='snack-2').p_buy);
 assert.deepEqual(r.after.weights.map(w=>w.before),a.weights.map(w=>w.before));
 for(const p of r.after.predictions){assert.ok(p.p_buy>=0&&p.p_buy<=1);assert.ok(Math.abs(p.logit-p.terms.reduce((s,t)=>s+t.contribution,0))<1e-10)}
 assert.deepEqual(engine.reset('test').weights,a.weights);
});
test('neutral, guesses, retries, stale runs and isolation',()=>{
 const s=engine.reset('state');const r=engine.event(event(s,'neutral',null));assert.deepEqual(r.before.weights,r.after.weights);
 assert.deepEqual(engine.event(event(s,'neutral',null)),r);
 assert.throws(()=>engine.event({...event(s,'neutral',null),label:1}),/409/);
 const g=engine.event({...event(s,'guess',null),game:'price',stage:'guess',guess:5000});assert.deepEqual(g.before.weights,g.after.weights);
 assert.equal(engine.model('other').seq,0);engine.reset('state');assert.throws(()=>engine.event(event(s,'old',1)),/409/);
});
test('pair shared features cancel; basket order is invariant; global remains frozen',()=>{
 const global=engine.global();const a=engine.reset('a'),b=engine.reset('b');
 const r=engine.event({sid:'a',run_id:a.run_id,event_id:'pair',game:'bracket',pair:{winner:'snack-2',loser:'snack-7'}});
 assert.equal(r.after.weights.find(w=>w.feature==='cat:snacks').delta,0);
 engine.reset('a');const aa=engine.model('a');
 const basket={event_id:'basket',game:'budget',budget:30000,selected_ids:['snack-2','drink-7']};
 const x=engine.event({...basket,sid:'a',run_id:aa.run_id});const y=engine.event({...basket,sid:'b',run_id:b.run_id,selected_ids:[...basket.selected_ids].reverse()});
 assert.deepEqual(x.after.weights,y.after.weights);assert.deepEqual(global,engine.global());
});

test('fresh history, replay removal, context, comparison and catalogue migration',()=>{
 const e=createPreferenceEngine(catalogue),g=e.reset('guru'),n=e.reset('fresh','new');
 assert.equal(n.demoOrders.length,0);assert.notDeepEqual(g.predictions.map(p=>p.p_buy),n.predictions.map(p=>p.p_buy));
 assert.deepEqual(n.predictions.map(p=>p.p_buy),e.global().predictions.map(p=>p.p_buy));
 const events=[event(g,'one',1),{...event(g,'two',0),item_id:'beauty-1'},event(g,'three',1)];
 events.forEach(x=>e.event(x));const remaining=[events[0],events[2]];
 const replay=e.replay(g.sid,'guru',g.run_id,remaining);
 const f=createPreferenceEngine(catalogue);f.reset(g.sid);f.restoreRun(g.sid,g.run_id);remaining.forEach(x=>f.event(x));
 assert.deepEqual(replay.weights,f.model(g.sid).weights);assert.deepEqual(replay.predictions,f.model(g.sid).predictions);
 const before=e.model(g.sid);assert.notDeepEqual(e.compare(g.sid).guru.top,e.compare(g.sid).new.top);assert.deepEqual(e.model(g.sid),before);
 assert.ok(Buffer.byteLength(JSON.stringify(e.contextFor(g.sid)))<1536);
 assert.ok(replay.summary.claims.every(c=>c.evidence.every(r=>remaining.some(x=>x.event_id===r.event_id))));
 const expanded=[...catalogue,{...catalogue[0],id:'test-new-item',brand:'Unique test brand',tags:['unique-test-tag']}];
 const upgraded=createPreferenceEngine(expanded),again=createPreferenceEngine(expanded);
 assert.notEqual(upgraded.global().catalogueHash,e.global().catalogueHash);
 const a=upgraded.replay(g.sid,'guru',g.run_id,remaining),b=again.replay(g.sid,'guru',g.run_id,remaining);
 assert.deepEqual(a.weights,b.weights);assert.deepEqual(a.segment,b.segment);assert.equal(a.predictions.length,expanded.length);
});

test('snack reactions move related items more than unrelated home history',()=>{
 const e=createPreferenceEngine(catalogue),s=e.reset('locality');
 const r=e.event(event(s,'snack-want',1));
 const snack=r.after.predictions.find(p=>p.item_id==='snack-2');
 const bed=r.after.predictions.find(p=>p.item_id==='bed-sheet-king');
 assert.ok(snack.deltaP>0);
 assert.ok(snack.deltaP>Math.abs(bed.deltaP)*3);
 for(const w of r.after.weights.filter(w=>/^(bias|price:|band:|hist:)/.test(w.feature)))assert.equal(w.delta,0);
});

test('Guru history contains a King sheet cover, not a bed frame',()=>{
 assert.deepEqual(GURU[0],{item_id:'bed-sheet-king',date:'2026-03-12'});
 assert.ok(catalogue.some(p=>p.id===GURU[0].item_id));
 assert.ok(!GURU.some(o=>o.item_id==='bed-king'));
 assert.deepEqual(engine.reset('history-check').demoOrders,GURU);
});

const assertDistribution = rows => {
 assert.equal(rows.length,6);assert.equal(new Set(rows.map(r=>r.id)).size,6);
 assert.ok(rows.every(r=>Number.isFinite(r.p)&&r.p>=0&&r.p<=1));
 assert.ok(Math.abs(rows.reduce((n,r)=>n+r.p,0)-1)<1e-12);
};
test('learned segment shares and held-out archetype accuracy use a disjoint user split',()=>{
 const p=engine.segments(),h=p.heldout;
 assert.equal(p.synthetic,true);assert.equal(p.train_users,1600);assert.equal(h.users,400);assert.equal(h.events_per_user,10);assert.equal(h.history_used,false);
 assert.equal(p.segments.length,6);assert.equal(new Set(p.segments.map(s=>s.id)).size,6);
 assert.equal(p.segments.reduce((n,s)=>n+s.size_users,0),p.population_users);
 assert.ok(Math.abs(p.segments.reduce((n,s)=>n+s.share,0)-1)<1e-12);
 for(const s of p.segments){assert.equal(s.share,s.size_users/1600);assert.equal(s.top_traits.length,3);}
 assert.equal(h.accuracy,h.correct/h.users);assert.equal(h.baseline,h.baseline_correct/h.users);assert.ok(h.accuracy>h.baseline);
 assert.equal(h.per_archetype.reduce((n,a)=>n+a.users,0),400);assert.equal(h.per_archetype.reduce((n,a)=>n+a.correct,0),h.correct);
 assert.match(h.baseline_method,/training-majority/);
 p.segments[0].share=999;assert.notEqual(engine.segments().segments[0].share,999);
});
test('segment posterior starts from population or history and explains tempered event shifts',()=>{
 const fresh=engine.reset('seg-new','new'),guru=engine.reset('seg-guru');
 assertDistribution(fresh.segment.before);assertDistribution(guru.segment.after);
 for(const c of engine.segments().segments)assert.ok(Math.abs(fresh.segment.before.find(r=>r.id===c.id).p-c.share)<1e-12);
 assert.deepEqual(guru.segment.before,guru.segment.after);assert.notDeepEqual(guru.segment.before,fresh.segment.before);
 assert.equal(guru.segment.history_count,4);assert.equal(guru.segment.evidence_count,4);assert.equal(fresh.segment.evidence_count,0);
 const r=engine.event({...event(fresh,'seg-want',1)}),a=r.after.segment;
 assertDistribution(a.after);assert.deepEqual(a.before,fresh.segment.before);assert.equal(a.confidence,'low');assert.equal(a.game_evidence_count,1);assert.equal(a.evidence_count,1);
 const snack=row=>row.find(x=>x.id==='snack-bargain').p;
 assert.ok(snack(a.after)>snack(fresh.segment.after));
 assert.equal(a.evidence[0].event_id,'seg-want');assert.equal(a.evidence[0].product_id,'snack-2');assert.match(a.evidence[0].label,/Want.*Pepero/);
 for(const row of a.after){const d=row.p-fresh.segment.after.find(x=>x.id===row.id).p;assert.equal(a.evidence[0].shift[row.id],d);assert.ok(Math.abs(d)<.15);}
 assert.ok(Math.abs(Object.values(a.evidence[0].shift).reduce((n,d)=>n+d,0))<1e-12);
 assert.equal(a.normalized_entropy,1-a.confidence_score);
 assert.deepEqual(engine.event(event(fresh,'seg-want',1)).after.segment,a);
 const neutral=engine.event(event(fresh,'seg-skip',null)).after.segment;
 assert.deepEqual(neutral.after,a.after);assert.equal(neutral.evidence_count,1);assert.equal(neutral.evidence.at(-1).informative,false);
 const guess=engine.event({...event(fresh,'seg-guess',null),game:'price',stage:'guess',guess:4000}).after.segment;
 assert.deepEqual(guess.after,a.after);assert.equal(guess.evidence_count,1);
});
test('segment undo/replay restores exactly and event explanations telescope to before/after',()=>{
 const s=engine.reset('seg-undo');
 const events=[event(s,'s1',1),event(s,'s2',0),{...event(s,'s3',1),item_id:'drink-7'}];
 const first=engine.event(events[0]).after.segment;engine.event(events[1]);
 const all=engine.event(events[2]).after.segment;
 assertDistribution(all.after);
 for(const row of all.after){const start=all.before.find(x=>x.id===row.id).p;assert.ok(Math.abs(row.p-start-all.evidence.reduce((n,e)=>n+e.shift[row.id],0))<1e-12);}
 const undo=engine.replay(s.sid,'guru',s.run_id,[events[0]]);
 assert.deepEqual(undo.segment,first);assert.deepEqual(undo.segment.before,s.segment.before);
 assert.deepEqual(engine.replay(s.sid,'guru',s.run_id,[]).segment,s.segment);
 const ctx=engine.contextFor(s.sid);assert.deepEqual(ctx.segment,{...s.segment.top,confidence:'low',evidence_count:4});
});
test('segment pair and basket observations are informative; basket order is invariant',()=>{
 const a=engine.reset('seg-basket-a'),b=engine.reset('seg-basket-b');
 const basket={event_id:'basket',game:'budget',budget:30000,selected_ids:['snack-2','drink-7']};
 const x=engine.event({...basket,sid:a.sid,run_id:a.run_id}).after.segment;
 const y=engine.event({...basket,sid:b.sid,run_id:b.run_id,selected_ids:[...basket.selected_ids].reverse()}).after.segment;
 assert.deepEqual(x,y);assert.equal(x.game_evidence_count,1);assertDistribution(x.after);
 const pair=engine.event({sid:a.sid,run_id:a.run_id,event_id:'pair',game:'bracket',pair:{winner:'snack-2',loser:'drink-7'}}).after.segment;
 assertDistribution(pair.after);assert.equal(pair.game_evidence_count,2);assert.match(pair.evidence.at(-1).label,/Picked.*over/);
});
