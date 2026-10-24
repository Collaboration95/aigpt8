import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
const {createPreferenceEngine,GURU}=await import('./model.mjs?v='+Date.now());
const catalogue=JSON.parse(fs.readFileSync(new URL('../public/data/products.json',import.meta.url)));
// Check the small fixture against browser memory without executing browser code.
const memory=fs.readFileSync(new URL('../public/memory.js',import.meta.url),'utf8');
for(const o of GURU)if(!memory.includes(o.item_id)||!memory.includes(o.date))throw Error('Guru fixture does not match memory.js');
const state=globalThis.__t8PreferenceEngine??= {engine:createPreferenceEngine(catalogue),journals:new Map()};
const engine=state.engine, dir=new URL('../data/ml/',import.meta.url);
fs.mkdirSync(dir,{recursive:true});
function hydrate(sid){
 if(state.journals.has(sid))return;
 let j;try{j=JSON.parse(fs.readFileSync(new URL(sid+'.json',dir)));}catch{}
 if(j?.version===engine.global().version){
  const s=engine.reset(sid,j.profile);
  // Persisted run identity is restored with the validated deterministic journal.
  engine.restoreRun(sid,j.run_id);
  for(const e of j.events)engine.event(e);
 }else {const s=engine.model(sid);j={version:s.version,profile:s.profile,run_id:s.run_id,events:[]};}
 state.journals.set(sid,j);
}
function persist(sid){const f=new URL(sid+'.json',dir),tmp=new URL(sid+'.'+randomUUID()+'.tmp',dir);fs.writeFileSync(tmp,JSON.stringify(state.journals.get(sid)));fs.renameSync(tmp,f);}
const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
const id=(v,name)=>{if(typeof v!=='string'||! /^[A-Za-z0-9_-]{1,80}$/.test(v))fail(400,'Invalid '+name);return v;};
const known=new Map(catalogue.map(p=>[p.id,p]));
const item=v=>{if(!known.has(v))fail(400,'Unknown catalogue item');return v;};
function validate(e){
 if(!e||Array.isArray(e)||typeof e!=='object')fail(400,'Expected object');
 id(e.sid,'sid');id(e.run_id,'run_id');id(e.event_id,'event_id');
 if(!['rapid','swipe','bracket','price','budget'].includes(e.game))fail(400,'Unknown game');
 if(e.ts!==undefined&&!(typeof e.ts==='number'&&Number.isFinite(e.ts)))fail(400,'Invalid timestamp');
 let fields=['sid','run_id','event_id','game','ts'];
 if(e.game==='bracket'){
  fields.push('pair');if(!e.pair||Object.keys(e.pair).sort().join(',')!=='loser,winner')fail(400,'Expected winner and loser');
  item(e.pair.winner);item(e.pair.loser);if(e.pair.winner===e.pair.loser)fail(400,'Pair must be distinct');
  e.pair={winner:e.pair.winner,loser:e.pair.loser};
 }else if(e.game==='budget'){
  fields.push('selected_ids','budget');if(e.budget!==30000||!Array.isArray(e.selected_ids)||!e.selected_ids.length||e.selected_ids.length>76||new Set(e.selected_ids).size!==e.selected_ids.length)fail(400,'Invalid basket');
  const sum=e.selected_ids.reduce((s,v)=>s+known.get(item(v)).price,0);if(sum>e.budget)fail(400,'Basket exceeds budget');
 }else{
  item(e.item_id);fields.push('item_id');
  if(e.game==='price'){
   fields.push('stage');if(!['guess','verdict'].includes(e.stage))fail(400,'Price stage required');
   if(e.stage==='guess'){fields.push('guess');if(typeof e.guess!=='number'||!Number.isFinite(e.guess)||e.guess<=0)fail(400,'Guess must be finite and positive');}
   else{fields.push('label');if(e.label!==0&&e.label!==1)fail(400,'Verdict requires binary label');}
  }else{fields.push('label');if(e.label!==null&&e.label!==0&&e.label!==1)fail(400,'Expected label 0, 1 or null');}
 }
 if(Object.keys(e).some(k=>!fields.includes(k)))fail(400,'Unexpected event fields');
 return e;
}
async function body(req){let n=0,chunks=[];for await(const c of req){n+=c.length;if(n>16384)fail(413,'Body too large');chunks.push(c);}try{return JSON.parse(Buffer.concat(chunks));}catch{fail(400,'Invalid JSON');}}
function json(res,status,value){res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(value));}
export default async function(req,res,url){
 if(!['/api/events','/api/model','/api/model/global','/api/model/reset'].includes(url.pathname))return false;
 try{
  const p=url.pathname;
  if(p==='/api/model/global'&&req.method==='GET')json(res,200,engine.global());
  else if(p==='/api/model'&&req.method==='GET'){const sid=id(url.searchParams.get('sid')||'demo','sid');hydrate(sid);json(res,200,engine.model(sid));}
  else if(p==='/api/model/reset'&&req.method==='POST'){
   const e=await body(req);if(!e||typeof e!=='object'||Object.keys(e).some(k=>!['sid','profile'].includes(k)))fail(400,'Invalid reset');
   const sid=id(e.sid,'sid'),profile=e.profile??'guru';if(!['guru','cold'].includes(profile))fail(400,'Invalid profile');
   const s=engine.reset(sid,profile);state.journals.set(sid,{version:s.version,profile,run_id:s.run_id,events:[]});persist(sid);json(res,200,s);
  }else if(p==='/api/events'&&req.method==='POST'){
   const e=validate(await body(req));hydrate(e.sid);const started=performance.now(),r=engine.event(e),j=state.journals.get(e.sid);
   if(!j.events.some(x=>x.event_id===e.event_id)){j.events.push(e);persist(e.sid);}
   res.setHeader('server-timing',`model;dur=${(performance.now()-started).toFixed(2)}`);json(res,200,r);
  }else json(res,405,{error:'Method not allowed'});
 }catch(e){json(res,e.status||(/^409/.test(e.message)?409:500),{error:e.message});}
 return true;
}
