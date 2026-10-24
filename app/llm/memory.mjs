export const pastOrders = [
{id:'history-toothpaste',date:'2026-09-13',items:[{id:'tp-median',price:8900}],cadence:'6 weeks',source:'Demo order · 13 Sep 2026'},
{id:'history-sheet',date:'2026-03-12',items:[{id:'bed-sheet-king',price:39900}],source:'Demo order · 12 Mar 2026'},
{id:'history-monitor',date:'2026-08-15',items:[{id:'baby-monitor',price:79000}],source:'Demo order · 15 Aug 2026'},
{id:'history-curtain',date:'2026-07-11',items:[{id:'bed-curtain',price:29900}],source:'Demo order · 11 Jul 2026'}];
export const facts = {
bed:{value:'King',label:'King',because:'From your bed sheet cover order (12 Mar) · demo order',source_product_id:'bed-sheet-king'},
baby:{value:true,label:'Baby at home (inferred)',because:'From your Aug baby monitor purchase · demo order',source_product_id:'baby-monitor'},
room:{value:'Bedroom',label:'Bedroom',because:'From your bedroom blackout curtain demo order',source_product_id:'bed-curtain'},
toothpasteUsual:{value:'tp-median',label:'Your usual toothpaste',because:'From your toothpaste order 6 weeks ago · demo order',source_product_id:'tp-median'},
brushEvery:{value:'3 months',label:'Brush replacement reminder',because:'Demo care reminder, not a purchase'}
};
export function memory(session,orders=[]) {const result=structuredClone(facts);for(const k of session.forgotten||[])delete result[k];for(const o of orders.filter(o=>o.sid===session.sid&&o.status!=='cancelled'))for(const p of o.items||[])if(p.category==='haircare')result.shampooUsual={value:p.productId,label:'Your ordered shampoo',because:'From your saved demo order',source_product_id:p.productId};Object.assign(result,session.confirmedFacts||{});for(const k of session.forgotten||[])delete result[k];return {facts:result,pastOrders};}

export function confirm(session,text){const match=/\b(single|twin|queen|king|double)\s*(?:size\s*)?bed\b/i.exec(text);if(!match)return;const value=match[1].toLowerCase()==='twin'?'Single':match[1][0].toUpperCase()+match[1].slice(1).toLowerCase();session.confirmedFacts||={};session.confirmedFacts.bed={value,label:value+' bed',because:'you, just now'};session.forgotten=(session.forgotten||[]).filter(k=>k!=='bed');delete session.selectedProductId;}
