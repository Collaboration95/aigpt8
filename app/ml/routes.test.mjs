import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createServer} from 'node:http';

test('segment HTTP API, Undo, journal reload and LLM preferences share the same posterior',async()=>{
 const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'t8-segment-api-'));
 const source=new URL('../',import.meta.url);
 const files=['ml/model.mjs','ml/segments.mjs','ml/routes.mjs','public/data/products.json','public/memory.js','llm/data-tools.mjs','llm/retrieve.mjs','llm/store.mjs','llm/memory.mjs'];
 let server;
 const nativeFetch=globalThis.fetch;
 try {
  for(const file of files){const target=path.join(fixture,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(new URL(file,source),target);}
  const routesURL=pathToFileURL(path.join(fixture,'ml/routes.mjs')).href;
  let handler=(await import(routesURL)).default;
  server=createServer(async(req,res)=>{if(!await handler(req,res,new URL(req.url,'http://localhost'))){res.writeHead(404);res.end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  const api=async(url,payload,status=200)=>{const r=await nativeFetch(base+url,payload?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}:{});assert.equal(r.status,status);return r.json();};
  const population=await api('/api/segments');assert.equal(population.segments.length,6);assert.ok(population.heldout.accuracy>population.heldout.baseline);
  await api('/api/segments',{},405);
  const sid='segment-http-test',start=await api('/api/model/reset',{sid,profile:'new'});
  assert.equal(start.segment.evidence_count,0);assert.deepEqual(start.segment.before,start.segment.after);
  const first={sid,run_id:start.run_id,event_id:'one',game:'rapid',item_id:'snack-2',label:1};
  const a=await api('/api/events',first);
  const b=await api('/api/events',{...first,event_id:'two',item_id:'drink-7',label:0});
  assert.notDeepEqual(b.after.segment.after,a.after.segment.after);
  const retried=await api('/api/events',first);assert.deepEqual(retried,a);
  const undone=await api('/api/events/undo',{sid,event_id:'two',run_id:start.run_id});
  assert.deepEqual(undone.segment,a.after.segment);assert.deepEqual(undone.predictions,a.after.predictions);
  const again=await api('/api/events/undo',{sid,event_id:'two'});assert.equal(again.revision,undone.revision);
  await api('/api/events',{...first,event_id:'two',item_id:'drink-7',label:0},409);
  await api('/api/events',{...first,event_id:'one',label:0},409);
  const context=await api('/api/model/context?sid='+sid);assert.deepEqual(context.segment,{...undone.segment.top,confidence:undone.segment.confidence,evidence_count:1});
  const preferenceTool=await import(pathToFileURL(path.join(fixture,'llm/data-tools.mjs')).href);
  // Redirect the existing retrieval tool's fixed local URL to this isolated fixture server.
  globalThis.fetch=(url,options)=>nativeFetch(String(url).replace('http://127.0.0.1:8817',base),options);
  const toolResult=await preferenceTool.execute('get_preferences',{category:'snacks'},{sid});
  assert.deepEqual(toolResult.segment,{...undone.segment.top,confidence:undone.segment.confidence,evidence_count:1,synthetic:true});
  assert.ok(toolResult.top.length);assert.equal(toolResult.source,'ml-model');
  // Simulate a fresh process: hydrate the journal rather than sharing in-memory sessions.
  delete globalThis.__t8PreferenceEngine;
  handler=(await import(routesURL+'?reload=1')).default;
  const restored=await api('/api/model?sid='+sid);assert.deepEqual(restored.segment,undone.segment);assert.equal(restored.run_id,start.run_id);
  await api('/api/events',{...first,event_id:'two',item_id:'drink-7',label:0},409);
  const profile=await api('/api/model/profile',{sid,profile:'guru'});assert.equal(profile.segment.history_count,4);assert.equal(profile.segment.game_evidence_count,1);
  const reset=await api('/api/model/reset',{sid,profile:'guru'});assert.equal(reset.segment.evidence_count,4);assert.deepEqual(reset.segment.before,reset.segment.after);
  await api('/api/events',{...first,event_id:'stale'},409);
  const invalid=await nativeFetch(base+'/api/model?sid=../bad');assert.equal(invalid.status,400);
 } finally {
  globalThis.fetch=nativeFetch;
  if(server)await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  delete globalThis.__t8PreferenceEngine;
  await fs.rm(fixture,{recursive:true,force:true});
 }
});
