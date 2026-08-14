import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const visitorDays = new Map();
const todayKey = () => new Date().toISOString().slice(0, 10);
function visitorStats(){ const key=todayKey(); if(!visitorDays.has(key)) visitorDays.set(key,{total:0,visitors:new Set(),countries:new Map()}); return visitorDays.get(key); }
function countryFor(req){ const value=req.headers['cf-ipcountry']||req.headers['x-vercel-ip-country']||req.headers['x-country-code']; return typeof value==='string'&&/^[A-Za-z]{2}$/.test(value)?value.toUpperCase():'UN'; }
function anonymousVisitor(req){ return String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').split(',')[0].trim(); }
function json(res,status,value){ res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}); res.end(JSON.stringify(value)); }

const root = '/usr/share/nginx/html';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
createServer(async (req, res) => {
  if (req.url === '/healthz') { res.writeHead(200, {'content-type':'text/plain'}); res.end('ok\n'); return; }
  if (req.url === '/api/visitors' && req.method === 'POST') { const stats=visitorStats(), visitor=anonymousVisitor(req), country=countryFor(req); if(!stats.visitors.has(visitor)){stats.visitors.add(visitor);stats.total+=1;} stats.countries.set(country,(stats.countries.get(country)||0)+1); json(res,200,{total:stats.total,countries:Object.fromEntries(stats.countries)}); return; }
  if (req.url === '/api/visitors' && req.method === 'GET') { const stats=visitorStats(); json(res,200,{date:todayKey(),total:stats.total,countries:Object.fromEntries(stats.countries)}); return; }
  const requested = normalize(new URL(req.url, 'http://localhost').pathname);
  const candidate = join(root, requested === '/' ? 'index.html' : requested);
  try { const body = await readFile(candidate); res.writeHead(200, {'content-type': types[extname(candidate)] ?? 'application/octet-stream'}); res.end(body); }
  catch { const body = await readFile(join(root, 'index.html')); res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(body); }
}).listen(8080, '0.0.0.0');
