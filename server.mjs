import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = '/usr/share/nginx/html';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
createServer(async (req, res) => {
  if (req.url === '/healthz') { res.writeHead(200, {'content-type':'text/plain'}); res.end('ok\n'); return; }
  const requested = normalize(new URL(req.url, 'http://localhost').pathname);
  const candidate = join(root, requested === '/' ? 'index.html' : requested);
  try { const body = await readFile(candidate); res.writeHead(200, {'content-type': types[extname(candidate)] ?? 'application/octet-stream'}); res.end(body); }
  catch { const body = await readFile(join(root, 'index.html')); res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(body); }
}).listen(8080, '0.0.0.0');
