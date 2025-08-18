const CACHE_NAME = 'hifz-tracker-cache-v1';
// اہم: یہاں اپنی ایپ کی تمام ضروری فائلوں کے نام لکھیں۔
const urlsToCache = [
  '/', // یہ index.html کو ہی ظاہر کرتا ہے
  './index.html',
  './manifest.json',
  './icon-192.png', // یقینی بنائیں کہ یہ آئیکن موجود ہو
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

// 1. انسٹالیشن: ایپ شیل کو کیش کریں
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. فیچ (Fetch): کیش سے جواب دیں یا نیٹ ورک پر جائیں
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر کیش میں ہے تو وہیں سے دیں
        if (response) {
          return response;
        }
        // ورنہ نیٹ ورک سے لائیں
        return fetch(event.request).catch(() => {
            // یہاں آپ ایک کسٹم آف لائن پیج بھی دکھا سکتے ہیں
        });
      }
    )
  );
});

// 3. ایکٹیویشن: پرانے کیشے کو صاف کریں
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
