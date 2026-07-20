const CACHE_NAME = 'sentinel-v2'; // Bump version to force reload
const ASSETS_TO_CACHE = [
  './',                          // Cache root folder entry point
  './index.html',
  './reception-registry.html',
  './manifest.json',
  './logo.jpg',                  // Explicitly add your icon image asset!
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js' // Strict version path
];

// Install the Service Worker and Cache Files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching Sentinel Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate and Clean up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetching Logic (Offline First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});