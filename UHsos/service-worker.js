const CACHE_NAME = 'uhsos-v1';
const ASSETS_TO_CACHE = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('generativelanguage.googleapis.com')) return;
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});