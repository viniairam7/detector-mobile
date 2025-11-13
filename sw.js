// sw.js
const CACHE_NAME = 'me-lembre-cache-v1';
const urlsToCache = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// NOVO: Adicionar listener para o evento de notificação de clique
self.addEventListener('notificationclick', event => {
  event.notification.close(); // Fecha a notificação

  // Opcional: Você pode abrir uma URL ou focar a aplicação quando a notificação é clicada
  // event.waitUntil(
  //   clients.openWindow('./index.html') // Abre a sua PWA
  // );
});
