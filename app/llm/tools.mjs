import fs from 'node:fs';
import {createHash} from 'node:crypto';
const files=['questions','products','commerce','context'].map(n=>new URL('../public/kit/tools/'+n+'.json',import.meta.url));
const strip = o => Array.isArray(o)?o.map(strip):o&&typeof o==='object'?Object.fromEntries(Object.entries(o).filter(([k])=>k!=='x-examples').map(([k,v])=>[k,strip(v)])):o;
export function registry(){
 const tools=files.flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8'))).map(strip);
 if(!tools.some(t=>t.function.name==='play_game'))tools.push({type:'function',function:{name:'play_game',description:'Use for Surprise me or no shopping intent. Offers a prebuilt game to learn preferences before recommendations.',parameters:{type:'object',properties:{game:{type:'string',enum:['price','rapid','swipe','basket','bracket']},title:{type:'string',maxLength:48},productIds:{type:'array',items:{type:'string'},minItems:4,maxItems:12,uniqueItems:true},rounds:{type:'integer',minimum:3,maximum:8},sid:{type:'string',description:'Server supplied; omit.'},launchToken:{type:'string',description:'Server supplied; omit.'}},required:['game','title','productIds','rounds'],additionalProperties:false}}});
 return {tools,map:new Map(tools.map(t=>[t.function.name,t.function])),version:createHash('sha256').update(JSON.stringify(tools)).digest('hex').slice(0,16)};
}
export const startupRegistry=registry();
