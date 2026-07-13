/* eslint-disable no-restricted-globals */
/**
 * Service worker global — marketing-lab/PWA leve.
 * NÃO intercepta /cotacao/* nem APIs do funil (gerar-proposta, disponibilidade, etc.).
 */
const CACHE_NAME = 'rsv360-site-publico-v2';
const LEGACY_CACHES = ['rsv360-site-publico-v1'];
const CACHE_URLS = ['/', '/offline.html', '/manifest.json'];

const BYPASS_PREFIXES = ['/cotacao', '/api/cotacao', '/api/propostas', '/proposta'];
const BYPASS_PATHS = new Set(['/manifest.json']);

function shouldBypass(pathname) {
  if (BYPASS_PATHS.has(pathname)) return true;
  return BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(CACHE_URLS.map((url) => cache.add(url))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) =>
          key !== CACHE_NAME || LEGACY_CACHES.includes(key) ? caches.delete(key) : Promise.resolve(),
        ),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'UNREGISTER_SW') {
    event.waitUntil(
      self.registration.unregister().then(() =>
        caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
      ),
    );
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypass(url.pathname)) return;

  // Navegação: rede direta — evita HTML stale no funil de cotação.
  if (event.request.mode === 'navigate') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => (await caches.match(event.request)) || caches.match('/offline.html')),
  );
});
