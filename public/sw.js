// Smarter Service Worker with network-first for pages and cache-busting support
const CACHE_NAME = 'artistcrm-v6';
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

      // Inform clients they can refresh if needed + force reload to prevent stale UI
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(
        clients.map(async (client) => {
          try {
            client.postMessage({ type: 'SW_UPDATED' });
            // Force reload with cache-busting param to escape old cached bundles
            const u = new URL(client.url);
            u.searchParams.set('v', String(Date.now()));
            if (typeof client.navigate === 'function') {
              await client.navigate(u.toString());
            }
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
    badge: '/favicon.ico',
    icon: '/favicon.ico',
    tag: 'notification',
    data: {}
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
        data: payload.data || {}
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
      vibrate: [200, 100, 200]
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
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