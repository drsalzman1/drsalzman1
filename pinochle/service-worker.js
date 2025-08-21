// The version of the cache.
const VERSION = "v0.1";

// The name of the cache
const CACHE_NAME = `pinochle-${VERSION}`;

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

    "./cards/ac.svg", "./cards/ad.svg", "./cards/ah.svg", "./cards/as.svg",
    "./cards/jc.svg", "./cards/jd.svg", "./cards/jh.svg", "./cards/js.svg",
    "./cards/kc.svg", "./cards/kd.svg", "./cards/kh.svg", "./cards/ks.svg",
    "./cards/qc.svg", "./cards/qd.svg", "./cards/qh.svg", "./cards/qs.svg",
    "./cards/tc.svg", "./cards/td.svg", "./cards/th.svg", "./cards/ts.svg", "./cards/gb.svg",
    "./icons/analytics.svg", "./icons/Back.svg", "./icons/close.svg", "./icons/exit.svg", 
    "./icons/help.svg", "./icons/info.svg", "./icons/maskable.svg", "./icons/menu.svg", 
    "./icons/next.svg", "./icons/refresh.svg", "./icons/settings.svg", "./icons/unmaskable.svg",
    "./screens/narrow.png", "./screens/wide.png",
    "./suits/diamond.svg", "./suits/club.svg", "./suits/heart.svg", "./suits/spade.svg",
    "./", "./index.html", "./manifest.json", "./scripts.js", "./styles.css",
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