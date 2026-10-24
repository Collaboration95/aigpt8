// Team 8 app server: static mobile app + small JSON APIs + live reload.
// Run: node team8/app/server.mjs   (PORT=8817 HOST=127.0.0.1 by default; Tailscale serve :8443 -> 8817)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');
const PORT = +process.env.PORT || 8817;
const HOST = process.env.HOST || '127.0.0.1';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

// --- live reload: any change under public/ tells open pages to reload ---
const clients = new Set();
let t;
fs.watch(PUB, { recursive: true }, () => { clearTimeout(t); t = setTimeout(() => clients.forEach(r => r.write('data: reload\n\n')), 120); });
const RELOAD = `<script>(()=>{const e=new EventSource('/__reload');e.onmessage=()=>location.reload()})()</script>`;

// --- env: app/.env (gitignored) -> process.env, without overriding real env ---
try {
  for (const l of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
    const i = l.indexOf('='); if (i > 0 && !l.startsWith('#')) process.env[l.slice(0, i).trim()] ??= l.slice(i + 1).trim();
  }
} catch {}

// --- backend modules: each of ml/routes.mjs, llm/routes.mjs exports
//     default async (req, res, url) => true if it handled the request.
//     Re-imported when the file changes, so editing a module needs no server restart.
const MODULES = ['ml/routes.mjs', 'llm/routes.mjs'];
const loaded = {};
async function moduleHandlers() {
  const out = [];
  for (const m of MODULES) {
    const f = path.join(ROOT, m);
    let st; try { st = fs.statSync(f); } catch { continue; }
    if (loaded[m]?.mtime !== st.mtimeMs) {
      try { loaded[m] = { mtime: st.mtimeMs, fn: (await import(`${f}?v=${st.mtimeMs}`)).default }; }
      catch (e) { console.error(`module ${m} failed to load:`, e); loaded[m] = { mtime: st.mtimeMs, fn: null }; }
    }
    if (loaded[m].fn) out.push(loaded[m].fn);
  }
  return out;
}

// --- big screens: show the page inside an iPhone frame (390x844, scaled to fit) ---
// Runs first in <head>; writes the frame, then swallows the rest of the page so its scripts don't run twice.
const NO_FRAME = /\/(dashboard|primitives)\.html$/;
const FRAME = `<script>(()=>{if(screen.width<=700||innerWidth<=700||top!==self||/[?&]frame=1/.test(location.search))return;
const u=new URL(location.href);u.searchParams.set('frame','1');
document.write('<style>html,body{margin:0;height:100%;background:#eceef2}body{display:grid;place-items:center;overflow:hidden}'
+'.ph{box-sizing:border-box;width:410px;height:864px;border-radius:60px;background:#0b0b0d;padding:10px;box-shadow:0 0 0 2px #2a2a2e,inset 0 0 0 1px #555,0 40px 90px #0006,0 12px 30px #0003;transform-origin:center;position:relative}'
+'.ph iframe{width:390px;height:844px;border:0;border-radius:50px;background:#fff;display:block}'
+'.ph:after{content:"";position:absolute;top:21px;left:50%;width:112px;height:32px;margin-left:-56px;border-radius:16px;background:#000;pointer-events:none}</style>'
+'<div class="ph" id="ph"><iframe src="'+u.href.replace(/"/g,'&quot;')+'" allow="clipboard-write"></iframe></div>'
+'<script>const fit=()=>{const s=Math.min(1,(innerHeight-40)/864,(innerWidth-40)/410);document.getElementById("ph").style.transform="scale("+s+")"};fit();addEventListener("resize",fit)<\\/script>'
+'<plaintext style="display:none">')})()</script>`;

// --- tiny JSON store (preferences per session, for the games dashboard) ---
const PREFS = path.join(DATA, 'prefs.json');
const readPrefs = () => { try { return JSON.parse(fs.readFileSync(PREFS, 'utf8')); } catch { return {}; } };
const writePrefs = p => fs.writeFileSync(PREFS, JSON.stringify(p, null, 2));

const body = req => new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b || '{}')); } catch { r({}); } }); });
const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (p === '/__reload') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
    res.write(': hi\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
  }

  // Preferences: GET /api/prefs?sid=.. -> {weights, history}; POST {sid, signals:{trait:delta}, source}
  if (p === '/api/prefs') {
    const all = readPrefs();
    if (req.method === 'POST') {
      const { sid = 'demo', signals = {}, source = 'game' } = await body(req);
      const s = all[sid] ||= { weights: {}, history: [] };
      const before = { ...s.weights };
      for (const [k, d] of Object.entries(signals)) s.weights[k] = +((s.weights[k] || 0) + Number(d || 0)).toFixed(3);
      s.history.push({ at: Date.now(), source, signals, before, after: { ...s.weights } });
      writePrefs(all); return json(res, 200, s);
    }
    if (req.method === 'DELETE') { delete all[url.searchParams.get('sid') || 'demo']; writePrefs(all); return json(res, 200, { ok: true }); }
    return json(res, 200, all[url.searchParams.get('sid') || 'demo'] || { weights: {}, history: [] });
  }

  // Backend modules (ML, LLM) get first refusal on /api/* routes.
  if (p.startsWith('/api/')) {
    for (const h of await moduleHandlers()) {
      try { if (await h(req, res, url)) return; }
      catch (e) { console.error(e); if (!res.headersSent) return json(res, 500, { error: String(e.message || e) }); return; }
    }
  }
  if (p === '/api/turn') return json(res, 501, { error: 'llm-not-configured' });

  // Static files
  let f = path.normalize(path.join(PUB, decodeURIComponent(p)));
  if (!f.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  const ext = path.extname(f).toLowerCase();
  res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
  if (ext === '.html') {
    let html = fs.readFileSync(f, 'utf8').replace('</body>', RELOAD + '</body>');
    if (!NO_FRAME.test(f)) html = html.replace(/<head[^>]*>/i, m => m + FRAME);
    return res.end(html);
  }
  fs.createReadStream(f).pipe(res);
}).listen(PORT, HOST, () => console.log(`team8 app: http://${HOST}:${PORT}/`));
