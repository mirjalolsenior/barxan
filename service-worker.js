
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('barxan-cache').then(function(cache) {
      return cache.addAll([
        './',
        './index.html',
        './style.css',
        './main.js',
        './icon.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
