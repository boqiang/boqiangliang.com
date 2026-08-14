import { createServer } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const visitorDays = new Map();
const statsFile = process.env.VISITOR_STATS_FILE || '/data/visitor-stats.json';
const todayKey = () => new Date().toISOString().slice(0, 10);
function visitorStats(){ const key=todayKey(); if(!visitorDays.has(key)) visitorDays.set(key,{total:0,visitors:new Set(),countries:new Map()}); return visitorDays.get(key); }
async function loadVisitorStats(){ try { const saved=JSON.parse(await readFile(statsFile,'utf8')); for(const [day,value] of Object.entries(saved)){ visitorDays.set(day,{total:Number(value.total)||0,visitors:new Set(value.visitors||[]),countries:new Map(Object.entries(value.countries||{}).map(([country,count])=>[country,Number(count)||0]))}); } } catch(error) { if(error.code!=='ENOENT') console.error('visitor stats load failed',error.message); } }
async function saveVisitorStats(){ const serialized=Object.fromEntries([...visitorDays].map(([day,value])=>[day,{total:value.total,visitors:[...value.visitors],countries:Object.fromEntries(value.countries)}])); await mkdir(join(statsFile,'..'),{recursive:true}); const temporary=`${statsFile}.tmp`; await writeFile(temporary,JSON.stringify(serialized),'utf8'); await rename(temporary,statsFile); }
function countryFor(req){ const value=req.headers['cf-ipcountry']||req.headers['x-vercel-ip-country']||req.headers['x-country-code']; return typeof value==='string'&&/^[A-Za-z]{2}$/.test(value)?value.toUpperCase():'UN'; }
function anonymousVisitor(req){ return String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').split(',')[0].trim(); }
function json(res,status,value){ res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}); res.end(JSON.stringify(value)); }

const root = '/usr/share/nginx/html';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
await loadVisitorStats();
createServer(async (req, res) => {
  if (req.url === '/healthz') { res.writeHead(200, {'content-type':'text/plain'}); res.end('ok\n'); return; }
  if (req.url === '/api/visitors' && req.method === 'POST') { const stats=visitorStats(), visitor=anonymousVisitor(req), country=countryFor(req); if(!stats.visitors.has(visitor)){stats.visitors.add(visitor);stats.total+=1;} stats.countries.set(country,(stats.countries.get(country)||0)+1); await saveVisitorStats(); json(res,200,{total:stats.total,countries:Object.fromEntries(stats.countries)}); return; }
  if (req.url === '/api/visitors' && req.method === 'GET') { const stats=visitorStats(); json(res,200,{date:todayKey(),total:stats.total,countries:Object.fromEntries(stats.countries)}); return; }
  const requested = normalize(new URL(req.url, 'http://localhost').pathname);
  const candidate = join(root, requested === '/' ? 'index.html' : requested);
  try { const body = await readFile(candidate); res.writeHead(200, {'content-type': types[extname(candidate)] ?? 'application/octet-stream'}); res.end(body); }
  catch { const body = await readFile(join(root, 'index.html')); res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(body); }
}).listen(8080, '0.0.0.0');
