import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from './retrieve.mjs';
import * as M from './memory.mjs';
import * as V from './validate.mjs';
import {registry} from './tools.mjs';
const cat=R.catalogue(),prefs={top:[]};
const session=goal=>({sid:'unit',goal,answers:[],forgotten:[]});
test('current category and latest budget constrain candidates',()=>{const s=session('snacks under ₩20,000');s.answers.push({label:'under ₩5,000'});const c=R.retrieve(cat,s,prefs);assert.ok(c.candidates.length);assert.ok(c.candidates.every(p=>p.category==='snacks'&&p.price<=5000));});
test('kitchen gift retrieval stays relevant',()=>{const c=R.retrieve(cat,session('a kitchen gift under ₩30,000'),prefs);assert.ok(c.candidates.length);assert.ok(c.candidates.every(p=>p.category==='kitchen'&&p.price<=30000&&/gift/i.test(p.name+' '+p.tags.join(' '))));});
test('unsupported desk lamp is explicitly unavailable',()=>{assert.match(R.retrieve(cat,session('desk lamp'),prefs).noMatch,/No desk lamp/);});
test('confirmed correction wins over seeded facts across new goals',()=>{const s=session('mosquito');M.confirm(s,'single bed, not King');assert.equal(M.memory(s).facts.bed.value,'Single');s.goal='snacks';assert.equal(M.memory(s).facts.bed.value,'Single');s.goal='mosquito';assert.ok(R.retrieve(cat,s,prefs).candidates.every(p=>!/king|queen|double/i.test(p.id+' '+p.name)));});
test('concrete selection requires immediate checkout',()=>{const ctx={...R.retrieve(cat,session('kitchen gift'),prefs),cat,selectedProductId:'kitchen-mug',facts:{},answers:[],turn:2};const c={id:'a',name:'product_spotlight',args:{title:'Mug',product_ids:['kitchen-mug']}};assert.throws(()=>V.validateBatch([c],registry(),ctx),/checkout-required/);});
test('source prose cannot contradict the confirmed fact label',()=>{const s=session('mosquito');M.confirm(s,'single bed, not King');const ctx={...R.retrieve(cat,s,prefs),cat,facts:M.memory(s).facts,answers:[]};assert.throws(()=>V.validateCall({name:'note_inference',args:{facts:[{key:'bed',because:ctx.facts.bed.because,label:'King bed'}]}},registry(),ctx));});

test('a refinement prefix cannot retain a different product category',()=>{assert.equal(R.refinement('another toothbrush','toothpaste'),false);assert.equal(R.refinement('cheaper','mosquito'),true);});

const {decorate}=await import('./turn.mjs');
for(const action of ['change','forget'])test(action+' removes a selected/confirmed bed and re-asks neutrally',()=>{
 const s=session('mosquito net');M.confirm(s,'King bed');s.selectedProductId='net-king';M.removeFact(s,'bed',action);
 assert.equal(M.memory(s).facts.bed,undefined);assert.equal(s.selectedProductId,undefined);
 const neutral=R.retrieve(cat,s,prefs);const king=neutral.candidates.findIndex(p=>p.id==='net-king');
 assert.ok(king>0,'removed King must not keep its inference boost');
 const ctx={...neutral,cat,facts:M.memory(s).facts,answers:s.answers,factCorrection:s.factCorrection};
 const calls=decorate([{id:'old',name:'ship_it',args:{items:[{product_id:'net-king',qty:1}]}}],ctx,registry());
 assert.equal(calls.length,1);assert.equal(calls[0].name,'ask_choice');assert.equal(calls[0].args.preselect,undefined);assert.equal(calls[0].args.because,undefined);
 assert.deepEqual(calls[0].args.options.map(o=>o.label),['Single','Queen','King']);
 if(action==='forget')assert.match(calls[0].args.question,/Not using your bed sheet order/);
 V.validateBatch(calls,registry(),ctx);
});
test('lookup tools follow intent and removed bedding stays removed',()=>{
 const ctx=goal=>({...R.intent(goal),facts:M.memory(session(goal)).facts});
 assert.deepEqual(R.lookupPlan(ctx('Surprise me')).map(c=>c.name),['get_preferences']);
 assert.deepEqual(R.lookupPlan(ctx('Reorder toothpaste')).map(c=>c.name),['search_orders','get_reorder_pattern']);
 assert.deepEqual(R.lookupPlan(ctx('mosquito net')).map(c=>c.name),['check_bought_before','search_orders']);
 assert.deepEqual(R.lookupPlan({...ctx('mosquito net'),facts:{}}),[]);
});
test('in-card inference is not repeated as a separate pill',()=>{
 const s=session('mosquito net'),ctx={...R.retrieve(cat,s,prefs),cat,facts:M.memory(s).facts,answers:[]};
 const calls=decorate([{id:'q',name:'ask_choice',args:{question:'Size?',preselect:'king',because:ctx.facts.bed.because,options:[{label:'King',value:'king',product_id:'net-king'}]}},{id:'n',name:'note_inference',args:{facts:[{key:'bed',...ctx.facts.bed}]}}],ctx,registry());
 assert.deepEqual(calls.map(c=>c.name),['ask_choice']);
});
