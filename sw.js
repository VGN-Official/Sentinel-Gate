const CACHE_NAME = 'sentinel-v5'; // Bumped version to clear old memory blocks
const ASSETS_TO_CACHE = [
  '/Sentinel-Gate/', 
  '/Sentinel-Gate/index.html',
  '/Sentinel-Gate/manifest.json',
  '/Sentinel-Gate/logo.png', 
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

// Install the Service Worker and Cache Files safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🛡️ Sentinel PWA: Starting asset pre-cache routine...');
      
      // Map all requests to intercept and log individual failures cleanly
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.error(`❌ CRITICAL CACHE FAILURE on resource URL: ${url}`, err);
            // This prevents a single network mismatch error from killing the service worker registration
          });
        })
      );
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

// Fetching Logic (Offline First Engine layout match with system fallback)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If the browser requests the missing favicon, automatically serve the logo asset instead
  if (url.pathname === '/favicon.ico') {
    event.respondWith(
      caches.match('./logo.jpg').then((cachedResponse) => {
        return cachedResponse || fetch('./logo.png');
      })
    );
    return;
  }

  // Standard caching query pipeline
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});