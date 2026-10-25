export function schema(value,s,path='$'){
 const bad=()=>{throw Error('schema:'+path);};
 if(s.anyOf){if(!s.anyOf.some(x=>{try{schema(value,x,path);return true;}catch{return false;}}))bad();return;}
 if(s.type){const ts=[s.type].flat();if(!ts.some(t=>t==='null'?value===null:t==='array'?Array.isArray(value):t==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):t==='integer'?Number.isInteger(value):typeof value===t))bad();}
 if(s.enum&&!s.enum.includes(value))bad();
 if(typeof value==='string'){if(value.length<(s.minLength||0)||value.length>(s.maxLength??2000)||s.pattern&&!new RegExp(s.pattern).test(value))bad();}
 if(typeof value==='number'){if(!Number.isFinite(value)||value<(s.minimum??-Infinity)||value>(s.maximum??Infinity)||s.exclusiveMinimum!==undefined&&value<=s.exclusiveMinimum)bad();}
 if(Array.isArray(value)){if(value.length<(s.minItems||0)||value.length>(s.maxItems??100)||s.uniqueItems&&new Set(value.map(x=>JSON.stringify(x))).size!==value.length)bad();value.forEach((v,i)=>schema(v,s.items||{},path+'['+i+']'));}
 if(value&&typeof value==='object'&&!Array.isArray(value)){for(const k of s.required||[])if(!(k in value))bad();for(const [k,v] of Object.entries(value)){if(!s.properties?.[k]){if(s.additionalProperties===false)bad();}else schema(v,s.properties[k],path+'.'+k);}}
}
export function productIds(args){const ids=[];function walk(a,key=''){if(Array.isArray(a)){if(['product_ids','productIds'].includes(key))ids.push(...a);else a.forEach(x=>walk(x,key));}else if(a&&typeof a==='object'){for(const[k,v]of Object.entries(a)){if(['product_id','productId','highlight_id'].includes(k))ids.push(v);else walk(v,k);}}}walk(args);return [...new Set(ids)];}
export const interactive=n=>n.startsWith('ask_')||['pick_variant','compare_products','show_picks','show_alternatives','product_spotlight','bundle','ship_it','feedback_bar','play_game'].includes(n);
export function validateCall(c,reg,ctx){const def=reg.map.get(c.name);if(!def)throw Error('unknown-tool');schema(c.args,def.parameters);const eligible=new Set(ctx.candidates.map(p=>p.id));for(const id of productIds(c.args))if(!ctx.cat.byId.has(id)||!eligible.has(id)&&!c.args.facts?.some(f=>f.source_product_id===id&&ctx.facts[f.key]?.source_product_id===id))throw Error('invalid-product-id');
 if(c.args.because&&!Object.values(ctx.facts).some(f=>f.because===c.args.because)&&!ctx.answers.some(a=>a.because===c.args.because))throw Error('unsupported-fact');
 if(c.name==='show_usual'&&!c.args.product_ids.every(id=>Object.values(ctx.facts).some(f=>f.value===id)))throw Error('unsupported-usual');
 for(const f of c.args.facts||[]){const known=ctx.facts[f.key];if(!known||f.label!==known.label||f.because!==known.because||f.source_product_id&&f.source_product_id!==known.source_product_id)throw Error('unsupported-fact');}
 if(c.args.preselect!==undefined){if(!c.args.because||!Object.values(ctx.facts).some(f=>f.because===c.args.because)&&!ctx.answers.some(a=>c.args.because===a.because))throw Error('unsupported-preselect');const values=c.args.options?.map(o=>o.value??o.label)||[];if(!['ask_slider','ask_budget'].includes(c.name)&&![c.args.preselect].flat().every(v=>values.includes(v)))throw Error('invalid-preselect');}
 for(const o of c.args.options||[]){if(o.unit_price!==undefined&&(!o.product_id||ctx.cat.byId.get(o.product_id)?.price!==o.unit_price))throw Error('invalid-price');}
 if(c.args.items&&new Set(c.args.items.map(x=>x.product_id)).size!==c.args.items.length)throw Error('duplicate-items');
 if(c.name==='ship_it'&&ctx.noMatch&&!ctx.selectedProductId)throw Error('unsupported-substitution');
 if(c.name==='ship_it'&&ctx.selectedProductId&&!c.args.items.some(x=>x.product_id===ctx.selectedProductId))throw Error('invalid-selection');
 if(c.args.min!==undefined&&(!(c.args.max>c.args.min)||c.args.preselect!==undefined&&[c.args.preselect].flat().some(n=>n<c.args.min||n>c.args.max)))throw Error('invalid-range');
 if(c.name==='path_progress'&&(typeof c.args.stage==='number'?c.args.stage>=c.args.stages.length:!c.args.stages.includes(c.args.stage)))throw Error('invalid-stage');
 if(c.name==='deal'&&c.args.code)throw Error('unverified-offer');
 return c;
}
export function validateBatch(calls,reg,ctx){if(!calls.length||calls.length>3)throw Error('call-count');calls.forEach(c=>validateCall(c,reg,ctx));if(new Set(calls.map(c=>c.id)).size!==calls.length)throw Error('duplicate-call');if(calls.filter(c=>c.name==='ship_it').length>1)throw Error('multiple-checkouts');if(calls.filter(c=>c.name.startsWith('ask_')).length>1)throw Error('multiple-questions');if(!calls.some(c=>interactive(c.name)))throw Error('display-only');if(ctx.intent==='strong'&&(ctx.turn>=2||ctx.category==='toothpaste'&&ctx.facts.toothpasteUsual)&&ctx.candidates.length&&!calls.some(c=>c.name==='ship_it'))throw Error('checkout-required');if(ctx.intent==='none'&&ctx.turn===1&&ctx.candidates.length>=4&&!calls.some(c=>['play_game','show_picks'].includes(c.name)))throw Error('discovery-required');if(ctx.selectedProductId&&!calls.some(c=>c.name==='ship_it'&&c.args.items.some(i=>i.product_id===ctx.selectedProductId)))throw Error('checkout-required');return calls;}
export function answer(call,value,ctx){const a=call.args;let label;let selected;
 if(['change','forget'].includes(value?.action)&&!['note_inference','memory_recap'].includes(call.name)&&(a.preselect!==undefined||a.because)){const f=ctx.facts?.[value.key];return {label:(value.action==='forget'?'Don\'t use ':'Change ')+(f?.label||'this guess')};}
 if(['ask_slider','ask_budget'].includes(call.name)){const vs=call.name==='ask_budget'?value:[value];if(!Array.isArray(vs)||vs.some(v=>typeof v!=='number'||v<a.min||v>a.max)||call.name==='ask_budget'&&(vs.length!==2||vs[0]>vs[1]))throw Error('invalid-answer');if(vs.some(v=>Math.abs((v-a.min)/a.step-Math.round((v-a.min)/a.step))>1e-6))throw Error('invalid-answer');label=vs.join('–');}
 else if(a.options){const allowed=a.options.map(o=>o.value??o.label);const multi=['ask_multi','ask_rank'].includes(call.name);if(multi!==Array.isArray(value))throw Error('invalid-answer');const vals=multi?value:[value];if(new Set(vals).size!==vals.length||call.name==='ask_rank'&&vals.length!==allowed.length||vals.some(v=>!allowed.includes(v)))throw Error('invalid-answer');label=vals.map(v=>a.options.find(o=>(o.value??o.label)===v).label).join(', ');selected=a.options.find(o=>(o.value??o.label)===value)?.product_id;}
 else if(a.product_ids){if(!a.product_ids.includes(value))throw Error('invalid-answer');selected=value;label=ctx.cat.byId.get(value).name;}
 else if(call.name==='bundle'){const pid=value?.product_id||value?.productId;if(!a.items.some(i=>i.product_id===pid)||!['swap','cheaper','remove'].includes(value.action))throw Error('invalid-answer');label=value.action+' '+ctx.cat.byId.get(pid).name;}
 else if(call.name==='play_game'){if(value?.action!=='complete'||!Array.isArray(value.eventIds)||value.eventIds.some(x=>typeof x!=='string'))throw Error('invalid-game-answer');label='Done playing';}
 else if(['note_inference','memory_recap'].includes(call.name)){if(!['change','forget'].includes(value?.action)||!a.facts.some(f=>f.key===value.key))throw Error('invalid-answer');label=(value.action==='forget'?'Forget ':'Change ')+a.facts.find(f=>f.key===value.key).label;}
 else if(call.name==='feedback_bar'){if(!['too_pricey','other_brand','not_for_me','more_like_this'].includes(value))throw Error('invalid-answer');label=value.replaceAll('_',' ');}
 else throw Error('not-answerable');
 return {label,selected};
}
