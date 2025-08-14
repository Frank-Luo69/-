const VERSION = 'v13-pwa-1';
const APP_SHELL = [
  '/',
  '/verify.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(c => c.addAll(APP_SHELL)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.origin === location.origin) {
    // JSON 文库：优先网络、回退缓存
    if (url.pathname.startsWith('/data/')) {
      event.respondWith((async ()=>{
        try {
          const res = await fetch(req);
          const cache = await caches.open(VERSION);
          cache.put(req, res.clone());
          return res;
        } catch (e) {
          const cached = await caches.match(req);
          if (cached) return cached;
          throw e;
        }
      })());
      return;
    }
    // 应用外壳：缓存优先
    if (APP_SHELL.includes(url.pathname)) {
      event.respondWith(caches.match(req).then(cached=>cached || fetch(req)));
      return;
    }
    // 其他：stale-while-revalidate
    event.respondWith((async ()=>{
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req);
      const net = fetch(req).then(res=>{ cache.put(req, res.clone()); return res; }).catch(()=>null);
      return cached || net || fetch(req);
    })());
  }
});


self.addEventListener('message', (event)=>{ if (event.data && event.data.type==='SKIP_WAITING') { self.skipWaiting(); } });
