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

  // LLM turn endpoint: placeholder until the provider is chosen (see ARCHITECTURE.md). Frontend falls back to scripted flows.
  if (p === '/api/turn') return json(res, 501, { error: 'llm-not-configured' });

  // Static files
  let f = path.normalize(path.join(PUB, decodeURIComponent(p)));
  if (!f.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  const ext = path.extname(f).toLowerCase();
  res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
  if (ext === '.html') return res.end(fs.readFileSync(f, 'utf8').replace('</body>', RELOAD + '</body>'));
  fs.createReadStream(f).pipe(res);
}).listen(PORT, HOST, () => console.log(`team8 app: http://${HOST}:${PORT}/`));
