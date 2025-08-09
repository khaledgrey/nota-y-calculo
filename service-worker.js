const CACHE_NAME = 'kawaii-notes-cache-v1';
const urlsToCache = [
    '/',
    'index.html',
    'css/style.css',
    'css/font-awesome.min.css',
    'css/fonts.css',
    'js/script.js',
    'audio/click.mp3',
    'fonts/patrick-hand.ttf',
    'fonts/yuji-boku.ttf',
    'images/icon-192.png',
    'images/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
