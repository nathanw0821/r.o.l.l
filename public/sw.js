/*
 * R.O.L.L. service worker (minimal, hand-written).
 *
 * What it does:
 *   - Precaches one page: /offline, fetched without cookies, so it is the guest view.
 *   - Page navigations go to the network as usual; only when the network fails does
 *     it answer with the cached /offline page. Page HTML is never stored.
 *   - Same-origin static files under /_next/static/ and /images/ (content-hashed or
 *     immutable) are cache-first, fetched without cookies.
 *
 * What it never touches (no respondWith, the browser handles them directly):
 *   - /api/* and /auth/* (auth, server data, anything user-specific)
 *   - non-GET requests (server actions, form posts), range requests
 *   - requests with an Authorization header, cross-origin requests
 *   - every other same-origin GET that is not a navigation or a static file
 *
 * Registered only in production builds (src/components/service-worker-register.tsx).
 * Bump VERSION to drop every old cache on the next activation.
 */
const VERSION = "roll-sw-v1";
const OFFLINE_URL = "/offline";
const OFFLINE_CACHE = `${VERSION}-offline`;
const STATIC_CACHE = `${VERSION}-static`;
const STATIC_MAX_ENTRIES = 300;
const STATIC_PREFIXES = ["/_next/static/", "/images/"];
const BYPASS_PREFIXES = ["/api/", "/auth/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      const response = await fetch(new Request(OFFLINE_URL, { credentials: "omit", cache: "reload" }));
      if (response.ok) await cache.put(OFFLINE_URL, response);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !key.startsWith(`${VERSION}-`)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

function isBypassed(url) {
  return BYPASS_PREFIXES.some((prefix) => url.pathname === prefix.slice(0, -1) || url.pathname.startsWith(prefix));
}

function isStaticAsset(url) {
  return STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

function isCacheable(response) {
  if (!response || !response.ok || response.status !== 200) return false;
  if (response.type !== "basic" && response.type !== "cors") return false;
  const cacheControl = (response.headers.get("Cache-Control") || "").toLowerCase();
  if (cacheControl.includes("no-store") || cacheControl.includes("private")) return false;
  if ((response.headers.get("Vary") || "").toLowerCase().includes("cookie")) return false;
  return true;
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}

async function staticCacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request.url);
  if (cached) return cached;
  // No cookies on the way out: these files are public and identical for everyone.
  const response = await fetch(request.url, { credentials: "omit" });
  if (isCacheable(response)) {
    await cache.put(request.url, response.clone());
    trimCache(STATIC_CACHE, STATIC_MAX_ENTRIES).catch(() => undefined);
  }
  return response;
}

async function networkWithOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const offline = await caches.match(OFFLINE_URL, { cacheName: OFFLINE_CACHE });
    if (offline) return offline;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.headers.has("range") || request.headers.has("authorization")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isBypassed(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkWithOfflineFallback(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staticCacheFirst(request));
  }
  // Anything else: not intercepted.
});
