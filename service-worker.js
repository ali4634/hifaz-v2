// service-worker.js

// کیش کا نیا ورژن تاکہ پرانا کیش خود بخود اپ ڈیٹ ہو جائے
const CACHE_NAME = 'hifz-tracker-cache-v2';

// ایپ کو آف لائن چلانے کے لیے تمام ضروری فائلوں کی مکمل لسٹ
const urlsToCache = [
  '/',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './capacitor.js', // اگر یہ فائل آپ کے پروجیکٹ میں ہے
  
  // بیرونی لائبریریز (External Libraries)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// 1. انسٹالیشن: ایپ شیل کو کیش کریں
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        // addAll اس بات کو یقینی بناتا ہے کہ اگر ایک فائل بھی ڈاؤن لوڈ نہ ہو تو انسٹالیشن ناکام ہو جائے۔
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Service Worker: Failed to cache', err);
      })
  );
});

// 2. فیچ (Fetch): کیش سے جواب دیں یا نیٹ ورک پر جائیں
self.addEventListener('fetch', event => {
  // ہم صرف GET درخواستوں کا جواب دیتے ہیں
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر فائل کیش میں موجود ہے تو وہیں سے فوراً واپس کریں
        if (response) {
          return response;
        }

        // اگر فائل کیش میں نہیں ہے، تو نیٹ ورک سے لانے کی کوشش کریں
        return fetch(event.request).catch(() => {
          // اگر نیٹ ورک بھی ناکام ہو (یعنی صارف واقعی آف لائن ہے)
          // تو آپ یہاں ایک مخصوص آف لائن پیج بھی دکھا سکتے ہیں
          // caches.match('./offline.html'); 
          // فی الحال ہم صرف ایرر کو نظر انداز کر رہے ہیں
        });
      })
  );
});

// 3. ایکٹیویشن: پرانے کیشے کو صاف کریں
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // اگر کوئی پرانا کیش (جس کا نام ہمارے نئے کیش کے نام سے مختلف ہے) ملتا ہے تو اسے حذف کر دیں
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
