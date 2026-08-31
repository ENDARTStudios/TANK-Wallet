// TANK Wallet — Service Worker (cache-first + network fallback) v2
const CACHE = "tank-wallet-v2";
const PRECACHE = ["/", "/manifest.json", "/logo.svg", "/icons/icon-192.png", "/offline"];
const RUNTIME_CACHE = "tank-wallet-runtime-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Runtime cache for /api/*
  if (req.url.includes("/api/")) {
    event.respondWith(fetch(req).then((res) => {
      if (res.ok) caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, res.clone()));
      return res;
    }).catch(() => caches.match(req)));
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok && req.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match("/offline"));
    })
  );
});
