const CACHE_NAME = 'lgs-kocu-v6';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/ai.js',
  './js/storage.js',
  './js/ui.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Yeni güncellemeyi bekletmeden anında kurar
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // Yeni kurulan worker'ın tüm sekmeleri anında ele geçirmesini sağlar
});

self.addEventListener('fetch', event => {
  // Network First, Cache Fallback Stratejisi
  // Her zaman en güncel dosyayı internetten çekmeye çalışır.
  // Eğer internet yoksa (offline) önbellekteki sürümü gösterir.
  event.respondWith(
    fetch(event.request).then(networkResponse => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});
