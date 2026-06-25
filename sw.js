const CACHE = 'aiko-deals-v1';
const STATIC = [
  '/aiko-deals/',
  '/aiko-deals/index.html',
  '/aiko-deals/manifest.json',
  '/aiko-deals/icon-192.png',
  '/aiko-deals/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // 主頁面永遠先抓網路（確保優惠是最新的），失敗才用快取
  if (e.request.url.includes('/aiko-deals/') && e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // 靜態資源用快取優先
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
