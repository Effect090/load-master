/* Load Master — service worker. Generated at build time — do not edit directly. */
/* Edit public/sw.template.js and run `npm run build` to regenerate. */
const CACHE = "load-master-BUILD_VERSION";

const PRECACHE = ["/", "/dashboard", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error("[sw] install failed:", err);
        // Don't call skipWaiting — let the browser retry on next load.
      }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only cache same-origin GET requests; skip Next.js data fetches and HMR.
  if (
    req.method !== "GET" ||
    !req.url.startsWith(self.location.origin) ||
    req.url.includes("/_next/webpack-hmr") ||
    req.url.includes("/_next/data/")
  ) {
    return;
  }

  // Cache-first for pre-cached shell assets, network-first for everything else.
  const isShellAsset = PRECACHE.some((p) => new URL(req.url).pathname === p);

  if (isShellAsset) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req)),
    );
  } else {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Only cache successful, non-opaque responses.
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy).catch(() => {}));
          }
          return res;
        })
        .catch(() => caches.match(req)),
    );
  }
});
