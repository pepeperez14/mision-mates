/* Pasaporte de Lengua · service worker: guarda la app en el iPad para que funcione sin Internet */
const V = 'pasaporte-lengua-2026.10.25-1902';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('pasaporte-lengua-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const timeout = (p, ms) => new Promise((ok, ko) => { const t = setTimeout(() => ko(new Error('lento')), ms); p.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); ko(e); }); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin || !u.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  if (r.mode === 'navigate') {
    /* la página: primero la red (para recibir mejoras); si no hay red, la copia guardada */
    e.respondWith(timeout(fetch(r), 4000).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put('./index.html', cp)); } return res; })
      .catch(() => caches.open(V).then(c => c.match('./index.html')).then(m => m || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.open(V).then(c => c.match(r)).then(m => m || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
});
