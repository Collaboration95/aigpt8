import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
const dir=new URL('../data/rewards/',import.meta.url);
fs.mkdirSync(dir,{recursive:true});
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const id=(s)=>{if(typeof s!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(s))fail(400,'Invalid identifier');return s;};
const day=(at=Date.now())=>new Date(at+8*3600000).toISOString().slice(0,10);
function read(sid){try{return JSON.parse(fs.readFileSync(new URL(id(sid)+'.json',dir)));}catch(e){if(e.code!=='ENOENT')throw e;return {balance:0,streak:0,ledger:[],claims:{},spends:{},games:[],lastDay:null};}}
function write(sid,s){const tmp=new URL(sid+'.'+randomUUID()+'.tmp',dir);fs.writeFileSync(tmp,JSON.stringify(s));fs.renameSync(tmp,new URL(sid+'.json',dir));}
function view(s){return {balance:s.balance,streak:s.lastDay===day()||s.lastDay===day(Date.now()-86400000)?s.streak:0,ledger:s.ledger};}
function journal(sid){try{return JSON.parse(fs.readFileSync(new URL('../data/ml/'+id(sid)+'.json',import.meta.url)));}catch{fail(409,'Finish a saved game first');}}
async function body(req){let raw='',n=0;for await(const c of req){n+=c.length;if(n>16384)fail(413,'Body too large');raw+=c;}try{return JSON.parse(raw);}catch{fail(400,'Invalid JSON');}}
const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data));};
export default async function(req,res,url){
 if(!['/api/rewards','/api/rewards/earn','/api/rewards/spend','/api/rewards/refund'].includes(url.pathname))return false;
 try {
  if(req.method==='GET'&&url.pathname==='/api/rewards'){json(res,200,view(read(url.searchParams.get('sid')||'demo')));return true;}
  if(req.method!=='POST')fail(405,'Method not allowed');
  const e=await body(req);if(!e||Array.isArray(e)||typeof e!=='object')fail(400,'Expected object');
  const sid=id(e.sid),s=read(sid),today=day();
  if(url.pathname==='/api/rewards/earn'){
   if(!['game_complete','price_close','first_today','new_game'].includes(e.kind))fail(400,'Unknown reward');
   const game=e.game==='basket'?'budget':e.game;
   if(!['rapid','swipe','bracket','price','budget'].includes(game))fail(400,'Unknown game');
   const key=id(e.meta?.completionId),ids=e.meta?.eventIds;
   if(s.claims[key]){if(s.claims[key].game!==game)fail(409,'Completion conflict');json(res,200,{...view(s),earned:0,breakdown:[],duplicate:true});return true;}
   // Bonuses are earned atomically with completion, never for choosing an answer.
   if(e.kind!=='game_complete')fail(409,'Bonuses are included when the game finishes');
   const j=journal(sid),rounds=e.meta?.rounds,expected={rapid:10,swipe:8,bracket:7,price:5,budget:1}[game];
   if(!Number.isInteger(rounds)||rounds<1||rounds>expected||!Array.isArray(ids)||new Set(ids).size!==ids.length)fail(400,'Invalid game receipt');
   const events=ids.map(v=>j.events.find(x=>x.event_id===v&&x.game===game));
   if(events.some(x=>!x)||ids.some(v=>Object.values(s.claims).some(c=>c.eventIds.includes(v))))fail(409,'Game receipt missing or already rewarded');
   const played=events.filter(x=>game==='price'?x.stage==='verdict':true);
   if(played.length!==rounds||(game==='price'&&events.filter(x=>x.stage==='guess').length!==rounds))fail(409,'Finish every round first');
   const first=s.lastDay!==today;
   if(first){s.streak=s.lastDay===day(Date.now()-86400000)?s.streak+1:1;s.lastDay=today;}
   const multiplier=s.streak>=7?2:s.streak>=3?1.5:1;
   const parts=[{kind:'game_complete',coins:10,note:'Game finished'}];
   if(first)parts.push({kind:'first_today',coins:20,note:'First game today'});
   if(!s.games.includes(game)){parts.push({kind:'new_game',coins:15,note:'First '+game+' game'});s.games.push(game);}
   if(game==='price'){
    const products=JSON.parse(fs.readFileSync(new URL('../public/data/products.json',import.meta.url)));
    for(const g of events.filter(x=>x.stage==='guess')){const p=products.find(p=>p.id===g.item_id);if(p&&Math.abs(g.guess-p.price)/p.price<=.1)parts.push({kind:'price_close',coins:5,note:'Price within 10%'});}
   }
   let remaining=Math.max(0,150-s.ledger.filter(l=>day(l.at)===today&&['game_complete','first_today','new_game','price_close'].includes(l.kind)).reduce((n,l)=>n+l.coins,0));
   const breakdown=parts.map(p=>{const coins=Math.min(remaining,Math.floor(p.coins*multiplier));remaining-=coins;return {...p,coins,note:p.note+(multiplier>1?' · '+multiplier+'× streak':'')};});
   const earned=breakdown.reduce((n,p)=>n+p.coins,0);
   s.balance+=earned;s.ledger.push(...breakdown.map(p=>({at:Date.now(),...p})));s.claims[key]={game,eventIds:ids};write(sid,s);
   json(res,200,{...view(s),earned,breakdown,dailyCap:150});
  }else if(url.pathname==='/api/rewards/spend'){
   const orderId=id(e.orderId),coins=e.coins;
   if(!Number.isSafeInteger(coins)||coins<=0||coins%100)fail(400,'Use multiples of 100 coins');
   const prior=s.spends[orderId];if(prior){if(prior.coins!==coins||prior.refunded)fail(409,'Order reward conflict');json(res,200,view(s));return true;}
   if(coins>s.balance)fail(409,'Not enough coins');
   s.balance-=coins;s.spends[orderId]={coins,refunded:false};s.ledger.push({at:Date.now(),kind:'spend',coins:-coins,note:'Order '+orderId});write(sid,s);json(res,200,view(s));
  }else if(url.pathname==='/api/rewards/refund'){
   const orderId=id(e.orderId),prior=s.spends[orderId];if(!prior)fail(404,'No coins used for this order');
   if(!prior.refunded){prior.refunded=true;s.balance+=prior.coins;s.ledger.push({at:Date.now(),kind:'refund',coins:prior.coins,note:'Order '+orderId});write(sid,s);}json(res,200,view(s));
  }else fail(405,'Method not allowed');
 }catch(e){json(res,e.status||500,{error:e.status?e.message:'Rewards unavailable'});}
 return true;
}
