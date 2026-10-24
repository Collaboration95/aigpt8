import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Readable} from 'node:stream';
import route from './routes.mjs';

test('completion, price bonuses, cap, streak, persistence and reversible spend',async()=>{
 const sid='reward-test-'+process.pid+'-'+Date.now(),ml=new URL('../data/ml/'+sid+'.json',import.meta.url),reward=new URL('../data/rewards/'+sid+'.json',import.meta.url);
 const realNow=Date.now;let now=Date.parse('2026-10-25T04:00:00Z'),serial=0,events=[];Date.now=()=>now;
 fs.mkdirSync(new URL('../data/ml/',import.meta.url),{recursive:true});
 async function call(path,data){let status,body;const req=Readable.from(data?[JSON.stringify({sid,...data})]:[]);req.method=data?'POST':'GET';const res={writeHead(s){status=s;},end(v){body=JSON.parse(v);}};assert.equal(await route(req,res,new URL('http://localhost/api/rewards'+path+(data?'':'?sid='+sid))),true);return {status,...body};}
 async function finish(game='rapid',guess=1500){const key='complete-'+serial++,ids=[];for(let i=0;i<(game==='price'?5:10);i++){if(game==='price'){const event_id=key+'-g'+i;ids.push(event_id);events.push({event_id,game,item_id:'snack-2',stage:'guess',guess});}const event_id=key+'-'+i;ids.push(event_id);events.push({event_id,game,...(game==='price'?{stage:'verdict'}:{})});}fs.writeFileSync(ml,JSON.stringify({events}));const payload={kind:'game_complete',game,meta:{completionId:key,eventIds:ids,rounds:game==='price'?5:10}};return {payload,result:await call('/earn',payload)};}
 try{
  const a=await finish();assert.equal(a.result.earned,45);assert.equal((await call('/earn',a.payload)).earned,0);
  const product=JSON.parse(fs.readFileSync(new URL('../public/data/products.json',import.meta.url))).find(p=>p.id==='snack-2');
  const price=await finish('price',product.price);assert.equal(price.result.earned,50);assert.equal(price.result.breakdown.filter(x=>x.kind==='price_close').length,5);
  for(let i=0;i<10;i++)await finish();assert.equal((await call('')).balance,150);
  assert.equal((await call('/spend',{orderId:'test-order',coins:100})).balance,50);
  assert.equal((await call('/spend',{orderId:'test-order',coins:100})).balance,50);
  assert.equal((await call('/refund',{orderId:'test-order'})).balance,150);assert.equal((await call('/refund',{orderId:'test-order'})).balance,150);
  assert.equal((await finish()).result.earned,0); // refunds do not reopen daily earning allowance
  now+=86400000;assert.equal((await finish()).result.earned,30);
  now+=86400000;assert.equal((await finish()).result.earned,45);
  for(let i=0;i<4;i++){now+=86400000;await finish();}
  assert.equal((await call('')).streak,7);assert.equal((await finish()).result.earned,20);
  assert.equal((await call('/earn',{kind:'first_today',game:'rapid',meta:{completionId:'fake'}})).status,409);
  assert.equal((await call('/earn',{kind:'game_complete',game:'rapid',meta:{completionId:'fake',eventIds:['missing'],rounds:1}})).status,409);
  const persisted=JSON.parse(fs.readFileSync(reward));assert.equal(persisted.balance,(await call('')).balance);
 }finally{Date.now=realNow;for(const file of [ml,reward])if(fs.existsSync(file))fs.unlinkSync(file);}
});
