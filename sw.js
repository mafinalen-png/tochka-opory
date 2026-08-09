/* Точка опоры v16.0 SAFE RECOVERY
   Временно отключаем перехват запросов service worker, чтобы старая зависающая
   версия JS больше не возвращалась из PWA-кэша. */
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(event){
  event.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(key){return caches.delete(key);}));
  }).then(function(){return self.clients.claim();}));
});
/* fetch намеренно не перехватывается: все файлы идут напрямую из сети. */
