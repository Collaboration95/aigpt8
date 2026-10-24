import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
export const ROOT = path.resolve(import.meta.dirname, '..');
export const DATA = path.join(ROOT, 'data');
export const state = globalThis.__team8LLM ||= {locks:new Set(), cache:new Map(), orderQueue:Promise.resolve(), prewarm:false};
export const sidValid = s => typeof s === 'string' && /^[a-zA-Z0-9_-]{1,96}$/.test(s);
export function read(file, fallback) { try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw Error('store-read-failed');} }
export function atomic(file, value) {fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.'+randomUUID()+'.tmp';try{fs.writeFileSync(tmp,JSON.stringify(value),{mode:0o600});fs.renameSync(tmp,file);}catch{try{fs.unlinkSync(tmp);}catch{}throw Error('store-write-failed');}}
export const loadSession = sid => read(path.join(DATA,'sessions',sid+'.json'),{sid,revision:0,turn:0,history:[],pending:[],quotes:{},answers:[],forgotten:[],replays:{}});
export const saveSession = s => atomic(path.join(DATA,'sessions',s.sid+'.json'),s);
export const getOrders = () => read(path.join(DATA,'orders.json'),[]);
export async function orderWrite(fn) {const p=state.orderQueue.catch(()=>{}).then(()=>{const orders=getOrders();const result=fn(orders);atomic(path.join(DATA,'orders.json'),orders);return result;});state.orderQueue=p;return p;}
