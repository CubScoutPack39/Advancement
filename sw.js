const CACHE = "cub-scout-advancement-v4";
const ASSETS = [
  "./index.html",
  "./manifest.webmanifest",
  "./next-award.js?v=4",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type:"window"}))
      .then(clients => Promise.all(clients.map(client => {
        try { return client.navigate(client.url); } catch(e) { return null; }
      })))
  );
});

function injectEnhancements(html){
  if (html.includes('next-award.js')) return html;
  return html.replace("</body>", '<script src="./next-award.js"></script></body>');
}

async function navigationResponse(request){
  let response;
  try {
    response = await fetch(request, {cache:"no-store"});
    if (response && response.ok) {
      const cache = await caches.open(CACHE);
      cache.put("./index.html", response.clone());
    }
  } catch(e) {
    response = await caches.match("./index.html");
  }

  if (!response) response = await caches.match("./index.html");
  if (!response) return new Response("App unavailable offline.", {status:503, headers:{"Content-Type":"text/plain"}});

  const html = injectEnhancements(await response.text());
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", "no-cache");
  return new Response(html, {status:response.status, statusText:response.statusText, headers});
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(navigationResponse(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
