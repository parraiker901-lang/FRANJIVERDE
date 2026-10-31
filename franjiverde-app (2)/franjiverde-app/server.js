// Servidor local de Franjiverde. Sin dependencias: solo Node 18 o superior.
// En Netlify no se usa: allí la parte de datos la ejecuta netlify/functions/data.js.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { getData } = require('./lib/data');

const PORT = process.env.PORT || 3000;
const PUB = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css'
};

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/data') {
    try {
      const d = await getData(u.searchParams.has('refresh'));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(d));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  const p = u.pathname === '/' ? '/index.html' : decodeURIComponent(u.pathname);
  const file = path.normalize(path.join(PUB, p));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(PORT, () => console.log('Franjiverde en http://localhost:' + PORT + (process.env.FOOTBALL_DATA_KEY ? '' : ' (sin clave: datos guardados)')));
