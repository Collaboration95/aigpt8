// Read-only data tools. These are executed on the server, never sent to KIT.
import fs from 'node:fs';
const v = new URL(import.meta.url).search;
const [R, S] = await Promise.all(['retrieve', 'store'].map(n => import('./'+n+'.mjs'+v)));
const tool = (name, description, properties, required = []) => ({type:'function', function:{name, description, parameters:{type:'object', properties, required, additionalProperties:false}}});
const string = {type:'string'};
export const tools = [
  tool('search_orders', 'Look up past purchases by product words or category. Returns names, IDs, brands, prices, dates and quantities from demo history and this user’s saved orders.', {query:string, category:string}),
  tool('check_bought_before', 'Check whether the user bought a product before, for example bed or baby monitor. Call separately for each product.', {product_query:string}, ['product_query']),
  tool('get_reorder_pattern', 'Read reorder cadence and whether a previously purchased product is due. Use the known usual product ID from context; can run alongside search_orders.', {product_id:string}, ['product_id']),
  tool('get_preferences', 'Read top learned shopping preferences from the live preference model, optionally for a category.', {category:string})
];
async function history(sid, cat) {
  const memoryURL = new URL('./memory.mjs', import.meta.url);
  const currentMemory = await import(memoryURL.href+'?data='+fs.statSync(memoryURL).mtimeMs);
  const pastOrders = currentMemory.pastOrders;
  return [...pastOrders, ...S.getOrders().filter(o => o.sid === sid && !['cancelled','canceled'].includes(o.status))]
    .flatMap(o => (o.items || []).map(i => {
      const product_id = i.productId || i.product_id || i.id, p = cat.byId.get(product_id) || i;
      return {product_id, name:p.name || product_id, brand:p.brand || '', category:p.category || '', price:i.unitPrice ?? i.price ?? p.price, date:o.date || o.createdAt, qty:i.qty ?? i.quantity ?? 1, cadence:o.cadence || null, source:pastOrders.includes(o)?'demo-history':'saved-demo-order'};
    })).sort((a,b) => new Date(b.date) - new Date(a.date));
}
const matches = (p, query) => !query || R.norm(query).split(' ').filter(Boolean).every(w => R.norm([p.product_id,p.name,p.brand,p.category].join(' ')).split(/[\s-]+/).includes(w));
const days = date => date ? Math.max(0, Math.round((Date.parse(new Date(Date.now()+9*3600000).toISOString().slice(0,10))-Date.parse(String(date).slice(0,10)))/86400000)) : null;
const dateLabel = date => new Date(date).toLocaleDateString('en-GB', {day:'numeric', month:'short', timeZone:'Asia/Seoul'});
export async function execute(name, args, {sid, cat = R.catalogue()}) {
  const orders = await history(sid, cat);
  if (name === 'search_orders') return {orders:orders.filter(p => matches(p,args.query) && (!args.category || matches(p,args.category))).slice(0,12)};
  if (name === 'check_bought_before') {
    const found = orders.filter(p => matches(p,args.product_query)).sort((a,b) => Number(matches({...b,product_id:'',category:'',brand:''},args.product_query))-Number(matches({...a,product_id:'',category:'',brand:''},args.product_query))), p = found[0];
    return {bought:!!p, last_date:p?.date || null, times:p ? orders.filter(o=>o.product_id===p.product_id).length : 0, product_id:p?.product_id || null, name:p?.name || null, days_since:days(p?.date)};
  }
  if (name === 'get_reorder_pattern') {
    const found = orders.filter(p => p.product_id === args.product_id), p = found[0];
    const intervals = found.slice(1).map((o,i) => Math.round((new Date(found[i].date)-new Date(o.date))/86400000)).filter(n => n>0).sort((a,b)=>a-b);
    const seeded = found.find(p => p.cadence)?.cadence;
    const cadenceDays = intervals.length ? intervals[Math.floor(intervals.length/2)] : seeded ? Number.parseInt(seeded)*(/week/i.test(seeded)?7:/month/i.test(seeded)?30:1) : null;
    return {product_id:args.product_id, name:p?.name || null, cadence:cadenceDays ? `every ~${cadenceDays % 7 === 0 ? cadenceDays/7+' weeks' : cadenceDays+' days'}` : null, last_date:p?.date || null, days_since:days(p?.date), due:!!p && cadenceDays !== null && days(p.date)>=cadenceDays, suggested_qty:p?.qty || 1, source:intervals.length?'purchase-intervals':seeded?'demo-history-cadence':'unknown'};
  }
  if (name === 'get_preferences') {
    const prefs = await R.preferences(sid);
    return {source:prefs.source, version:prefs.version, top:args.category ? prefs.top.filter(([k]) => !k.startsWith('cat:') || k === 'cat:'+args.category) : prefs.top};
  }
  throw Error('unknown-data-tool');
}
export function summary(name, result) {
  if (name === 'search_orders') return result.orders.length ? result.orders.slice(0,3).map(p => `${p.name}${p.qty>1?' ×'+p.qty:''} · ${dateLabel(p.date)}`).join(' / ') : 'No matching past orders';
  if (name === 'check_bought_before') return result.bought ? `${result.name} · ${dateLabel(result.last_date)}` : 'No matching past purchase';
  if (name === 'get_reorder_pattern') return result.last_date ? `${result.name} · ${result.cadence || 'cadence unknown'}${result.due?' · due now':''}` : 'No reorder history';
  return result.top.length ? result.top.slice(0,3).map(([k])=>k.replace(/^(cat:|trait:|brand:)/,'')).join(' · ') : 'No learned preferences yet';
}
