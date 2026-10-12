// Service worker: بيحفظ ملفات التطبيق عشان يفتح من غير نت
// - صفحة التطبيق: من النت الأول (عشان التحديثات توصل)، ولو مفيش نت من النسخة المحفوظة
// - باقي الملفات (JS / خطوط / صور): من النسخة المحفوظة الأول عشان السرعة
// - الطقس والصلاة (مواقع تانية): مبنلمسهاش، التطبيق بيتعامل معاها لوحده
const CACHE = 'lulu-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});

// ===== الإشعارات =====
// لما GitHub Actions يبعت تذكير، المتصفح بيصحّي الـ service worker ده ويوصله الرسالة
self.addEventListener('push', (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch {
    d = { body: e.data ? e.data.text() : '' };
  }
  e.waitUntil(
    self.registration.showNotification(d.title || 'لولو 🐰', {
      body: d.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: d.tag || 'lulu', // تذكير جديد من نفس النوع بيحل محل القديم بدل ما يتكوموا
      renotify: true,
      lang: 'ar',
      dir: 'rtl',
      data: { url: d.url || './' },
    })
  );
});

// لما تضغطي على الإشعار: يفتح لولو (أو يرجّعها قدامك لو مفتوحة)
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) if ('focus' in c) return c.focus();
      return self.clients.openWindow(e.notification.data?.url || './');
    })
  );
});
