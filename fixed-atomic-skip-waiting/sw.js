var CACHE_NAME = "1";

self.addEventListener('install', function(event) {
  skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(['index.html', 'script.js?v='+CACHE_NAME]);
      })
  );
});

self.addEventListener('fetch', function(event) {
  console.log("[ServiceWorker] fetch", CACHE_NAME, event.request.url.replace(/^.*\//, ""));
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request);
    }).then(function(myCacheResponse) {

      if (myCacheResponse) {
        console.log("[ServiceWorker]", CACHE_NAME, "own match", event.request.url.replace(/^.*\//, ""));
        return myCacheResponse;
      } else {
        console.log("[ServiceWorker]", CACHE_NAME, "didn't match", event.request.url.replace(/^.*\//, ""));
        return caches.match(event.request).then(function(anyCacheResponse) {
          if (anyCacheResponse) {
            console.log("[ServiceWorker]", CACHE_NAME, "found old match", event.request.url.replace(/^.*\//, ""));
            return anyCacheResponse;
          } else {
            console.log("[ServiceWorker]", CACHE_NAME, "no match requesting", event.request.url.replace(/^.*\//, ""));
            return fetch(event.request);
          }
        });
      }
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.slice(0,-2).map(function(key) {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});
