// sw.js - Service Worker para PWA
const CACHE_NAME = 'iptv-v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './crypto.js',
    './channels.json',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    'https://cdn.jsdelivr.net/npm/hls.js@1.5.15'
];

// Instalar: cachear assets
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS).catch(err => {
                console.log('Cache addAll error:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activar: limpiar caches viejos
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );
        })
    );
    self.clients.claim();
});

// Fetch: servir desde cache, si no, red
self.addEventListener('fetch', e => {
    // No cachear streams de video (dejar pasar directo a la red)
    if (e.request.url.includes('.m3u8') || e.request.url.includes('.ts')) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then(cached => {
            return cached || fetch(e.request).then(response => {
                // Cachear solo respuestas exitosas del mismo origen o del CDN
                if (response && response.status === 200 &&
                    (e.request.url.startsWith(self.location.origin) ||
                     e.request.url.includes('jsdelivr'))) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => cached);
        })
    );
});
