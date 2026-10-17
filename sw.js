// APEX RACING：ホーム画面アプリ用。一度ひらけば電波がなくても遊べるようにする
const CACHE = 'apex-v4';
const CORE = ['./apex-racing.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('googleapis.com')) return;   // コースの同期は いつもネットへ
  if (e.request.mode === 'navigate' || u.pathname.endsWith('.html')) {
    // ページは ネット優先（更新をすぐ反映）。つながらない時は 保存しておいた ページ
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./apex-racing.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return res; })));
});
