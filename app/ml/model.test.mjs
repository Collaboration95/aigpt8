import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createPreferenceEngine} from './model.mjs';
const catalogue=JSON.parse(fs.readFileSync(new URL('../public/data/products.json',import.meta.url)));
const engine=createPreferenceEngine(catalogue);
const event=(s,id,label)=>({sid:s.sid,run_id:s.run_id,event_id:id,game:'rapid',item_id:'snack-2',label});
test('seeded fit, fixed baseline, explanations and gradient direction',()=>{
 const a=engine.reset('test'), b=createPreferenceEngine(catalogue).reset('test');
 assert.deepEqual(a.weights,b.weights);assert.equal(a.weights.length,79);
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
