import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createPreferenceEngine} from './model.mjs';
const catalogue=JSON.parse(fs.readFileSync(new URL('../public/data/products.json',import.meta.url)));
const engine=createPreferenceEngine(catalogue);
const event=(s,id,label)=>({sid:s.sid,run_id:s.run_id,event_id:id,game:'rapid',item_id:'snack-2',label});
test('seeded fit, fixed baseline, explanations and gradient direction',()=>{
 const a=engine.reset('test'), b=createPreferenceEngine(catalogue).reset('test');
 assert.deepEqual(a.weights,b.weights);assert.equal(a.weights.length,engine.global().features.length);
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
 assert.deepEqual(a.weights,b.weights);assert.equal(a.predictions.length,expanded.length);
});
