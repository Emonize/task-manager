const CACHE_NAME = 'taskflow-v1';

self.addEventListener('install', (event) => {
  console.log('ServiceWorker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('ServiceWorker activated');
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;
  
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});