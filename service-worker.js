// service-worker.js

// کیش کا نیا ورژن تاکہ پرانا کیش خود بخود اپ ڈیٹ ہو جائے
const CACHE_NAME = 'hifz-tracker-cache-v3';

// ایپ کو آف لائن چلانے کے لیے تمام ضروری فائلوں کی مکمل اور درست لسٹ
// تمام راستے آپ کی ریپوزٹری کے نام (/hifaz-v2/) سے شروع ہونے چاہئیں
const urlsToCache = [
  '/hifaz-v2/',
  '/hifaz-v2/index.html',
  '/hifaz-v2/manifest.json',
  '/hifaz-v2/icon-192.png',
  '/hifaz-v2/icon-512.png',
  
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
        console.log('[Service Worker] کیش کھولا گیا، فائلیں شامل کی جا رہی ہیں');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // کامیابی سے انسٹال ہونے کے بعد فوراً ایکٹیویٹ ہو جاؤ
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[Service Worker] کیش کرنے میں ناکامی:', err);
      })
  );
});

// 2. ایکٹیویشن: پرانے کیشے کو صاف کریں
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] پرانا کیش حذف کیا جا رہا ہے:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // نئے سروس ورکر کو فوراً کنٹرول سنبھالنے کے لیے
  );
});

// 3. فیچ (Fetch): کیش سے جواب دیں یا نیٹ ورک پر جائیں
self.addEventListener('fetch', event => {
  // ہم صرف GET درخواستوں کا جواب دیتے ہیں
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // پہلے کیش میں تلاش کرو
    caches.match(event.request)
      .then(cachedResponse => {
        // اگر فائل کیش میں موجود ہے تو وہیں سے فوراً واپس کریں
        if (cachedResponse) {
          return cachedResponse;
        }

        // اگر فائل کیش میں نہیں ہے، تو نیٹ ورک سے لانے کی کوشش کریں
        return fetch(event.request)
          .catch(() => {
            // اگر نیٹ ورک بھی ناکام ہو (یعنی صارف واقعی آف لائن ہے)
            // تو آف لائن پیج کے طور پر index.html دکھا دو
            return caches.match('/hifaz-v2/index.html');
          });
      })
  );
});
