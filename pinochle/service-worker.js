// The version of the cache.
const version = "v0.99";

// The name of the cache
const cacheName = `pinochle-${version}`;

// The static resources that the app needs to function. "icons/offline.svg", "icons/online.svg", "icons/robot.svg"
const appStaticResources = [
    "cards/ac.svg", "cards/ad.svg", "cards/ah.svg", "cards/as.svg", "cards/gb.svg",
    "cards/jc.svg", "cards/jd.svg", "cards/jh.svg", "cards/js.svg",
    "cards/kc.svg", "cards/kd.svg", "cards/kh.svg", "cards/ks.svg",
    "cards/qc.svg", "cards/qd.svg", "cards/qh.svg", "cards/qs.svg",
    "cards/tc.svg", "cards/td.svg", "cards/th.svg", "cards/ts.svg",
    "icons/any.png", "icons/any.svg", "icons/back.svg", "icons/checked.svg", "icons/close.svg", "icons/exit.svg", 
    "icons/help.svg", "icons/human.svg", "icons/info.svg", "icons/maskable.png", "icons/menu.svg",  "icons/next.svg",
    "icons/refresh.svg", "icons/robot.svg", "icons/unchecked.svg", 
    "index.html", "pinochle.webmanifest",
    "ranks/ace.svg", "ranks/jack.svg", "ranks/king.svg", "ranks/queen.svg", "ranks/ten.svg",
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
            for (let url of appStaticResources) {
                const response = await fetch(url, {cache:"reload"});
                await cache.put(url, response);
            }
            //await cache.addAll(appStaticResources);
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
    event.respondWith(
        (async () => {
            const cache = await caches.open(cacheName);
            const cachedResponse = await cache.match(event.request);
            return cachedResponse || fetch(event.request);
        })()
    );
});