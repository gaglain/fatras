// Smarter Service Worker with safe caching (prevents mixed-build crashes)
const CACHE_NAME = 'artistcrm-v8';

// Keep precache minimal to avoid serving stale app code
const urlsToCache = [
  '/favicon.png',
];

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean old caches
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));

      await self.clients.claim();

      // Inform clients they can refresh if needed (avoid forced reload loops)
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(
        clients.map(async (client) => {
          try {
            client.postMessage({ type: 'SW_UPDATED', cache: CACHE_NAME });
          } catch (_) {
            // ignore
          }
        })
      );
    })()
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received:', event);

  let notificationData = {
    title: 'Nouvelle notification',
    body: 'Vous avez une nouvelle notification',
    badge: '/favicon.png',
    icon: '/favicon.png',
    tag: 'notification',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        badge: payload.badge || notificationData.badge,
        icon: payload.icon || notificationData.icon,
        tag: payload.tag || notificationData.tag,
        data: payload.data || {},
      };
    } catch (error) {
      console.error('Error parsing push payload:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      vibrate: [200, 100, 200],
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache Supabase/API calls
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(request));
    return;
  }

  // CRITICAL: never cache any request with query params (Vite dev uses ?t=...)
  // This avoids loading a mix of old/new modules which can break React/Router contexts.
  const hasQuery = url.search && url.search.length > 0;
  const isViteDevRequest =
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src') ||
    url.pathname.startsWith('/@fs') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.includes('/.vite/');

  if (hasQuery || isViteDevRequest) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
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
    event.respondWith(fetch(request).catch(() => caches.match(request)));
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
