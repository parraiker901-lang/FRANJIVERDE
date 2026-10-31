// Service worker: guarda la app para abrirla sin conexión y recuerda los últimos datos.
const SHELL = 'franjiverde-shell-v1';
const DATA = 'franjiverde-data-v1';
const FILES = ['/', '/index.html', '/config.js', '/matchdata.js','/data.fallback.json', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== SHELL && k !== DATA).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname === '/api/data') {
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(DATA).then(c => c.put('/api/data', copy));
      return r;
    }).catch(() => caches.match('/api/data')));
    return;
  }
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
