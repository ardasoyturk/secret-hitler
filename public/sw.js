/// Service Worker for Secret Hitler — Pass & Play
/// Cache-first strategy: fully offline after first load.

const CACHE_VERSION = "sh-v1";

// On install: precache the app shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        cache.addAll([
          "/",
          "/index.html",
          "/manifest.json",
          "/favicon.svg",
          "/favicon.ico",
          "/icons/icon-192.png",
          "/icons/icon-512.png",
        ]),
      ),
  );
});

// On activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

// On fetch: cache-first, then network, caching new responses
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip chrome-extension and non-http requests
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Don't cache error responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // If offline and no cache, return a basic offline response for HTML
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return new Response(
              "<h1>Offline</h1><p>Please connect to the internet and reload.</p>",
              { headers: { "Content-Type": "text/html" } },
            );
          }
        });
    }),
  );
});
