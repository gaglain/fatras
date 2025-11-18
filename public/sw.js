// Smarter Service Worker with network-first for pages and cache-busting support
const CACHE_NAME = 'artistcrm-v5';
const urlsToCache = [
  // Keep minimal precache
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean old caches
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
      // Inform clients they can refresh if needed
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED' }));
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache Supabase/API calls
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(request));
    return;
  }

  // Respect cache-busting query params (?v=..., ?preview=...)
  if (url.searchParams.has('v') || url.searchParams.has('preview')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network-first for HTML pages and any /front route
  const isHTML = request.mode === 'navigate' || request.destination === 'document';
  const isFront = url.pathname.startsWith('/front');
  if (isHTML || isFront) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Always try network first for logo-like images
  const isLogoAsset = /logo|site-logo|branding|app-icon|favicon/i.test(url.pathname);
  if (isLogoAsset) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Default: stale-while-revalidate for other assets
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});