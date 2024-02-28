// The version of the cache.
const VERSION = "v2";

// The name of the cache
const CACHE_NAME = `checkers-${VERSION}`;

// The static resources that the app needs to function.
const APP_STATIC_RESOURCES = [
    "./",
    "./images/bk.svg",
    "./images/board.svg",
    "./images/bp.svg",
    "./images/cc.svg",
    "./images/icon.svg",
    "./images/refresh.svg",
    "./images/rk.svg",
    "./images/rp.svg",
    "./images/screen-shot-750x1334.png",
    "./images/screen-shot-1280x800.png",
    "./images/settings.svg",
    "./scripts/scripts.js",
    "./styles/styles.css",
    "./index.html",
    "./manifest.json",
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })()
    );
});

// On activate, delete old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names.map((name) => {
                if (name !== CACHE_NAME) {
                    return caches.delete(name);
                }
                })
            );
            await clients.claim();
        })()
    );
});

// On fetch, intercept server request and respond with cached response, if any
self.addEventListener("fetch", (event) => {
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request);
            return cachedResponse || fetch(event.request);
        })()
    );
});