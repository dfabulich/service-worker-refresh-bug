var CACHE_NAME = "1";

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log("[ServiceWorker]", CACHE_NAME, 'Opened cache');
        return cache.addAll(['index.html', 'script.js']);
      })
  );
});

self.addEventListener('fetch', function(event) {
  console.log("[ServiceWorker] fetch", CACHE_NAME, event.request.url.replace(/^.*\//, ""));
  event.respondWith(clients.matchAll().then(function(clients) {
    if (clients.length < 2 && event.request.mode === "navigate" && registration.waiting) {
      console.log("[ServiceWorker]", CACHE_NAME, 'sending skipWaiting');
      registration.waiting.postMessage("skipWaiting");
      var lastKey;
      return caches.keys().then(function(keyList) {
        lastKey = keyList[keyList.length-1];
        return caches.open(lastKey);
      }).then(function(cache) {
        return cache.match(event.request);
      }).then(function(cached) {
        var response = cached || fetch(event.request);
        console.log("[ServiceWorker] response", CACHE_NAME, "from", lastKey, event.request.url.replace(/^.*\//, ""), response);
        return response;
      })
    } else {
      return caches.match(event.request).then(function(cached) {
        var response = cached || fetch(event.request);
        console.log("[ServiceWorker] response", CACHE_NAME, event.request.url.replace(/^.*\//, ""), response);
        return response;
      });
    }
  }));
});

self.addEventListener('activate', function(e) {
  console.log("[ServiceWorker]", CACHE_NAME, 'Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          console.log("[ServiceWorker]", CACHE_NAME, 'Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    console.log("[ServiceWorker]", CACHE_NAME, 'skipWaiting');
    skipWaiting();
  }
});