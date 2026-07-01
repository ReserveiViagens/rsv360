/* eslint-disable no-restricted-globals */
/**
 * Service worker — escopo /roteiro/ apenas (PR 22).
 * Não cacheia POST nem APIs sensíveis (gerar-proposta, turnstile).
 */
const SHELL_CACHE = 'roteiro-shell-v1';
const DATA_CACHE = 'roteiro-data-v1';
const QR_CACHE = 'roteiro-qr-v1';

const BLOCKED = [/\/api\/cotacao\/gerar-proposta/, /turnstile/i];
const ALLOWED_API_GET = [
  /^\/api\/cotacao\/roteiro\/[^/]+$/,
  /^\/api\/cotacao\/proposta\/[^/]+\/validade$/,
  /^\/api\/propostas\/[^/]+\/vouchers\/[^/]+\/qr\.png$/,
];

function isBlocked(pathname) {
  return BLOCKED.some((re) => re.test(pathname));
}

function isAllowedApi(pathname) {
  return ALLOWED_API_GET.some((re) => re.test(pathname));
}

async function networkFirst(request, cacheName) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || network || Response.error();
}

async function qrCacheFirst(request, expParam) {
  const exp = expParam ? parseInt(expParam, 10) : 0;
  const cache = await caches.open(QR_CACHE);
  if (exp && Date.now() > exp) {
    await cache.delete(request);
    try {
      return await fetch(request);
    } catch {
      return Response.error();
    }
  }
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) await cache.put(request, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

async function precacheUrls(urls) {
  const cache = await caches.open(DATA_CACHE);
  for (const raw of urls) {
    try {
      const res = await fetch(raw);
      if (res.ok) await cache.put(raw, res.clone());
    } catch {
      /* skip */
    }
  }
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRECACHE_ROTEIRO' && Array.isArray(event.data.urls)) {
    event.waitUntil(precacheUrls(event.data.urls));
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (isBlocked(url.pathname)) return;

  if (url.pathname.includes('/vouchers/') && url.pathname.endsWith('/qr.png')) {
    event.respondWith(qrCacheFirst(event.request, url.searchParams.get('exp')));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    if (!isAllowedApi(url.pathname)) return;
    event.respondWith(networkFirst(event.request, DATA_CACHE));
    return;
  }

  if (url.pathname.startsWith('/roteiro/')) {
    event.respondWith(networkFirst(event.request, SHELL_CACHE));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(staleWhileRevalidate(event.request, SHELL_CACHE));
  }
});
