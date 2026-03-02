// Service Worker para RSV 360 PWA
const CACHE_NAME = 'rsv-360-cache-v1';
const OFFLINE_URL = '/offline';

// Recursos essenciais para cache
const ESSENTIAL_RESOURCES = [
  '/',
  '/offline',
  '/dashboard-executivo',
  '/hoteis',
  '/reservas-hoteis',
  '/central-atendimento',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Recursos estáticos para cache
const STATIC_RESOURCES = [
  '/images/logo.png',
  '/images/hero-bg.jpg'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Configuração de rotas e estratégias
const ROUTE_STRATEGIES = {
  // Páginas principais - Cache First
  '/': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/dashboard-executivo': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/hoteis': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/reservas-hoteis': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,

  // APIs - Network First
  '/api/': CACHE_STRATEGIES.NETWORK_FIRST,

  // Recursos estáticos - Cache First
  '/icons/': CACHE_STRATEGIES.CACHE_FIRST,
  '/images/': CACHE_STRATEGIES.CACHE_FIRST,
  '/_next/static/': CACHE_STRATEGIES.CACHE_FIRST,

  // Recursos externos - Stale While Revalidate
  'https://images.unsplash.com/': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  'https://res.cloudinary.com/': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);

        // Cache recursos essenciais
        await cache.addAll(ESSENTIAL_RESOURCES);

        // Cache recursos estáticos
        await Promise.allSettled(
          STATIC_RESOURCES.map(resource =>
            cache.add(resource).catch(err =>
              console.warn(`Failed to cache ${resource}:`, err)
            )
          )
        );

        console.log('✅ Service Worker: Installation completed');
      } catch (error) {
        console.error('❌ Service Worker: Installation failed:', error);
      }
    })()
  );

  // Força a ativação imediata
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');

  event.waitUntil(
    (async () => {
      try {
        // Limpar caches antigos
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log(`🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );

        // Tomar controle de todos os clientes
        await self.clients.claim();

        console.log('✅ Service Worker: Activation completed');
      } catch (error) {
        console.error('❌ Service Worker: Activation failed:', error);
      }
    })()
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Ignorar requisições não-GET
  if (method !== 'GET') return;

  // Ignorar requisições de extensões do browser
  if (url.includes('extension://')) return;

  // Ignorar WebSocket connections
  if (request.headers.get('upgrade') === 'websocket') return;

  // Determinar estratégia de cache
  const strategy = getStrategyForUrl(url);

  event.respondWith(handleRequest(request, strategy));
});

// Função para determinar estratégia baseada na URL
function getStrategyForUrl(url) {
  for (const [pattern, strategy] of Object.entries(ROUTE_STRATEGIES)) {
    if (url.includes(pattern)) {
      return strategy;
    }
  }

  // Estratégia padrão
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Manipulador principal de requisições
async function handleRequest(request, strategy) {
  const { url } = request;

  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request);

      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request);

      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request);

      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);

      case CACHE_STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request);

      default:
        return await networkFirst(request);
    }
  } catch (error) {
    console.error(`Error handling request ${url}:`, error);
    return await handleOffline(request);
  }
}

// Estratégia Cache First
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return await handleOffline(request);
  }
}

// Estratégia Network First
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return await handleOffline(request);
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Buscar nova versão em background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Falha na rede, mantém cache
  });

  // Retorna cache imediatamente se disponível
  if (cached) {
    return cached;
  }

  // Se não há cache, aguarda rede
  try {
    return await fetchPromise;
  } catch (error) {
    return await handleOffline(request);
  }
}

// Estratégia Cache Only
async function cacheOnly(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  return await handleOffline(request);
}

// Manipular requisições offline
async function handleOffline(request) {
  const { destination } = request;

  // Para navegação, retornar página offline
  if (destination === 'document') {
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match(OFFLINE_URL);
    if (offlinePage) {
      return offlinePage;
    }
  }

  // Para imagens, retornar placeholder
  if (destination === 'image') {
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Imagem indisponível offline</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }

  // Para outros recursos, retornar erro
  return new Response('Recurso indisponível offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

// Evento de mensagem para comunicação com a aplicação
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;

    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    case 'CACHE_URLS':
      cacheUrls(payload.urls).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Função para limpar cache
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🗑️ All caches cleared');
}

// Função para fazer cache de URLs específicas
async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    urls.map(url =>
      cache.add(url).catch(err =>
        console.warn(`Failed to cache ${url}:`, err)
      )
    )
  );
  console.log(`📦 Cached ${urls.length} URLs`);
}

// Evento de sincronização em background
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);

  switch (event.tag) {
    case 'offline-data-sync':
      event.waitUntil(syncOfflineData());
      break;

    case 'analytics-sync':
      event.waitUntil(syncAnalytics());
      break;
  }
});

// Sincronizar dados offline
async function syncOfflineData() {
  try {
    // Buscar dados salvos localmente
    const offlineData = await getOfflineData();

    if (offlineData.length > 0) {
      // Enviar para servidor
      for (const data of offlineData) {
        await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }

      // Limpar dados locais após sucesso
      await clearOfflineData();
      console.log('✅ Offline data synced successfully');
    }
  } catch (error) {
    console.error('❌ Failed to sync offline data:', error);
  }
}

// Sincronizar analytics
async function syncAnalytics() {
  try {
    const analyticsData = await getAnalyticsData();

    if (analyticsData.length > 0) {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analyticsData)
      });

      await clearAnalyticsData();
      console.log('📊 Analytics data synced successfully');
    }
  } catch (error) {
    console.error('❌ Failed to sync analytics:', error);
  }
}

// Funções auxiliares para dados offline (implementação simplificada)
async function getOfflineData() {
  // Implementar busca de dados offline do IndexedDB
  return [];
}

async function clearOfflineData() {
  // Implementar limpeza de dados offline
}

async function getAnalyticsData() {
  // Implementar busca de dados de analytics
  return [];
}

async function clearAnalyticsData() {
  // Implementar limpeza de dados de analytics
}

// Notificações Push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    data: data.data,
    actions: data.actions || [
      {
        action: 'view',
        title: 'Ver detalhes',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
        icon: '/icons/action-dismiss.png'
      }
    ],
    tag: data.tag,
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique em notificações
self.addEventListener('notificationclick', (event) => {
  const { notification, action } = event;
  const data = notification.data || {};

  notification.close();

  let url = '/';

  switch (action) {
    case 'view':
      url = data.url || '/dashboard-executivo';
      break;
    case 'dismiss':
      return; // Apenas fecha a notificação
    default:
      url = data.url || '/dashboard-executivo';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Verificar se já há uma janela aberta
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }

      // Abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('🎉 RSV 360 Service Worker loaded successfully');
