// トレダカ：電波が無くても開けるように、画面の一式を端末に置く。画面は通信できるときは新しいものを取り、できないときは置いたものを使う
// GitHub は max-age=600 を付けるので、画面は端末の HTTP キャッシュを通さず必ず問い合わせる（no-cache）。古い版が10分出続けた（2026-11-05）
const V = 'toredaka-20261109132308';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {   // 画面：通信を先に、だめなら置いたもの
    e.respondWith(fetch(u.href, { cache: 'no-cache', credentials: 'same-origin' }).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {   // 書体：置いたものを先に
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })));
  }
});
