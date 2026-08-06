import http from 'node:http';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { Readable } from 'node:stream';

const ROOT = import.meta.dirname;
const appSource = readFileSync(join(ROOT, 'app.js'), 'utf8');
const allowedIds = new Set([...appSource.matchAll(/\["([\w-]{10,})",/g)].map(m => m[1]));
const upstreamUrl = id => `https://drive.usercontent.google.com/download?export=download&confirm=t&id=${id}`;
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.md':'text/markdown; charset=utf-8'};

async function proxyMedia(req, res, id) {
  if (!allowedIds.has(id)) { res.writeHead(404); return res.end('Unknown media'); }
  try {
    const headers = { 'user-agent': 'Mozilla/5.0 MCK-Local-Player/1.0' };
    if (req.headers.range) headers.range = req.headers.range;
    const upstream = await fetch(upstreamUrl(id), { headers, redirect: 'follow' });
    const output = {};
    for (const name of ['content-type','content-length','content-range','accept-ranges','content-disposition','last-modified','etag']) {
      const value = upstream.headers.get(name); if (value) output[name] = value;
    }
    output['access-control-allow-origin'] = '*';
    output['cache-control'] = 'public, max-age=3600';
    res.writeHead(upstream.status, output);
    if (req.method === 'HEAD' || !upstream.body) return res.end();
    Readable.fromWeb(upstream.body).on('error', () => res.destroy()).pipe(res);
  } catch { res.writeHead(502); res.end('Cannot connect to Google Drive'); }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/media/')) {
    return proxyMedia(req, res, decodeURIComponent(url.pathname.slice(11)));
  }
  const requested = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const safePath = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
  const file = join(ROOT, safePath);
  try {
    const stat = statSync(file);
    if (!stat.isFile()) throw new Error();
    res.writeHead(200, {'content-type': mime[extname(file)] || 'application/octet-stream','content-length':stat.size,'cache-control':'no-cache'});
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404); res.end('Not found'); }
});

server.listen(4173, '127.0.0.1', () => {
  console.log('MCK player: http://localhost:4173');
  console.log(`Media ready: ${allowedIds.size} files`);
});
