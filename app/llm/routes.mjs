import fs from 'node:fs';
const version=fs.readdirSync(import.meta.dirname).filter(n=>/\.(mjs|txt)$/.test(n)).map(n=>fs.statSync(new URL('./'+n,import.meta.url)).mtimeMs).join('-');
const backend=await import('./turn.mjs?v='+version);
setTimeout(()=>{backend.prewarm().catch(()=>{});},100).unref();
export default async function(req,res,url){
 if(url.pathname==='/api/turn'){if(req.method!=='POST')backend.json(res,405,{error:'method-not-allowed'});else await backend.turn(req,res,url);return true;}
 if(url.pathname==='/api/orders'||/^\/api\/orders\/[^/]+(?:\/(undo|redo))?$/.test(url.pathname)){if(!['GET','POST'].includes(req.method)||url.pathname!=='/api/orders'&&(/\/(undo|redo)$/.test(url.pathname)?req.method!=='POST':req.method!=='GET'))backend.json(res,405,{error:'method-not-allowed'});else await backend.orders(req,res,url);return true;}
 return false;
}
