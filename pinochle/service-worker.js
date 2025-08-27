// The version of the cache.
const version = "v0.41";

// The name of the cache
const cacheName = `pinochle-${version}`;

// The static resources that the app needs to function.
const appStaticResources = [
    "cards/ac.svg", "cards/ad.svg", "cards/ah.svg", "cards/as.svg", "cards/gb.svg",
    "cards/jc.svg", "cards/jd.svg", "cards/jh.svg", "cards/js.svg",
    "cards/kc.svg", "cards/kd.svg", "cards/kh.svg", "cards/ks.svg",
    "cards/qc.svg", "cards/qd.svg", "cards/qh.svg", "cards/qs.svg",
    "cards/tc.svg", "cards/td.svg", "cards/th.svg", "cards/ts.svg",
    "icons/analytics.svg", "icons/any.png", "icons/any.svg", "icons/back.svg", "icons/close.svg", 
    "icons/exit.svg", "icons/help.svg", "icons/info.svg", "icons/maskable.png", "icons/menu.svg", 
    "icons/next.svg", "icons/refresh.svg", "icons/settings.svg",
    "index.html", "pinochle.webmanifest", 
    "screens/narrow.png", "screens/wide.png",
    "scripts.js", "styles.css", 
    "suits/club.svg", "suits/diamond.svg", "suits/heart.svg", "suits/spade.svg"
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            cache.addAll(appStaticResources);
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
                if (name !== cacheName) {
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
    channel.postMessage(version);
    event.respondWith(
        (async () => {
            const cache = await caches.open(cacheName);
            const cachedResponse = await cache.match(event.request);
            return cachedResponse || fetch(event.request);
        })()
    );
});

const channel = new BroadcastChannel("Pinochle");

// Message received from client: if requested, post version
function messageRxed(e) {
    if (e.data == "get version")
        channel.postMessage(version);
}

channel.onmessage = messageRxed;