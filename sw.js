/**
 * AVG DOWN IDX — Service Worker
 * Cache-first for static assets, network-first for CDN
 */

const CACHE_NAME = 'avgdown-idx-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/layout.css',
  './css/animations.css',
  './js/app.js',
  './js/calculator.js',
  './js/brokers.js',
  './js/ui.js',
  './js/charts.js',
  './js/storage.js',
  './js/export.js',
  './js/utils.js',
  './manifest.json'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache-first for local, network-first for CDN
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CDN resources — network-first
  if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Local resources — cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
