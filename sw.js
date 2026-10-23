/* Versioned app-shell cache. Relative URLs support root hosting and subpath hosting. */
const CACHE_NAME = 'satops-shell-v1.4.0-formula-fix-1';
const SCOPE_URL = self.registration.scope;
const APP_ASSETS = [
  './', './index.html', './styles.css', './core.js', './app.js',
  './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'
].map((path) => new Request(new URL(path, SCOPE_URL), { cache: 'reload' }));

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('satops-shell-') && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE_URL)) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(new URL('./index.html', SCOPE_URL), fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch (_) {
        return (await caches.match(req)) || (await caches.match(new URL('./index.html', SCOPE_URL)));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const response = await fetch(req);
      if (response && response.ok) cache.put(req, response.clone()).catch(() => {});
      return response;
    } catch (_) {
      return new Response('Offline and resource is not cached.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
