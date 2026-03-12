// Smarter Service Worker with offline support (prevents mixed-build crashes)
const CACHE_NAME = 'artistcrm-v9';
const API_CACHE_NAME = 'artistcrm-api-v1';

// Keep precache minimal to avoid serving stale app code
const urlsToCache = [
  '/favicon.png',
  '/offline.html',
];

// API paths to cache for offline access (network-first)
const CACHEABLE_API_PATHS = [
  '/rest/v1/centralized_artists',
  '/rest/v1/events',
  '/rest/v1/contacts',
  '/rest/v1/user_profiles',
  '/rest/v1/notifications',
  '/rest/v1/app_settings',
];

const API_CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minutes

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE_NAME)
          .map((k) => caches.delete(k))
      );

      await self.clients.claim();

      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(
        clients.map(async (client) => {
          try {
            client.postMessage({ type: 'SW_UPDATED', cache: CACHE_NAME });
          } catch (_) {}
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
    (async () => {
      // Show the notification
      await self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        data: notificationData.data,
        vibrate: [200, 100, 200],
      });

      // Update PWA app badge count
      if ('setAppBadge' in navigator) {
        try {
          const badgeCount = notificationData.data?.badgeCount;
          if (typeof badgeCount === 'number') {
            await navigator.setAppBadge(badgeCount);
          } else {
            // Increment: get current notifications and count
            const notifications = await self.registration.getNotifications();
            await navigator.setAppBadge(notifications.length + 1);
          }
          console.log('📛 App badge updated');
        } catch (err) {
          console.error('📛 Failed to set app badge:', err);
        }
      }
    })()
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});

// Check if a Supabase API request is cacheable
function isCacheableApiRequest(url) {
  if (!url.hostname.includes('supabase.co')) return false;
  return CACHEABLE_API_PATHS.some((path) => url.pathname.includes(path));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ---- Supabase API: network-first with offline fallback ----
  if (isCacheableApiRequest(url) && request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              // Store with timestamp header for expiry
              const headers = new Headers(clone.headers);
              headers.set('sw-cached-at', Date.now().toString());
              const cachedResponse = new Response(clone.body, {
                status: clone.status,
                statusText: clone.statusText,
                headers,
              });
              cache.put(request, cachedResponse);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0');
            if (Date.now() - cachedAt < API_CACHE_MAX_AGE) {
              return cached;
            }
            // Even if expired, return stale data when offline
            return cached;
          }
          return new Response(JSON.stringify({ error: 'offline', message: 'Données non disponibles hors-ligne' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // ---- Non-cacheable Supabase/API calls: network only ----
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(request));
    return;
  }

  // CRITICAL: never cache requests with query params or Vite dev requests
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
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Show offline page
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('Hors-ligne', { status: 503 });
        })
    );
    return;
  }

  // Always try network first for logo-like images
  const isLogoAsset = /logo|site-logo|branding|app-icon|favicon/i.test(url.pathname);
  if (isLogoAsset) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Stale-while-revalidate for other assets (JS, CSS, images)
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          if (res.ok) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
