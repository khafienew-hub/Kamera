const CACHE_NAME = 'geocam-id-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Cache aset eksternal agar UI tidak rusak saat offline
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// 1. Install Service Worker & Cache Aset
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Membuka cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Aktivasi & Hapus Cache Lama
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Fetch Data (Cache First, Network Fallback)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Kembalikan dari cache jika ada
        if (response) {
          return response;
        }
        // Jika tidak ada di cache, ambil dari internet
        return fetch(event.request).then(
          (response) => {
            // Cek apakah response valid
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response untuk disimpan di cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
