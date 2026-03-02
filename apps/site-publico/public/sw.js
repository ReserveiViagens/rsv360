// Service Worker para PWA
// Sistema RSV 360 - Progressive Web App

const CACHE_NAME = 'rsv360-v1'
const urlsToCache = [
  '/',
  '/perfil',
  '/minhas-reservas',
  '/mensagens',
  '/notificacoes',
  '/buscar-hosts',
  '/dashboard-estatisticas',
  '/manifest.json',
  '/offline.html'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto')
        return cache.addAll(urlsToCache)
      })
  )
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Função para verificar se a URL pode ser cachead
function canCacheRequest(request) {
  const url = new URL(request.url)
  
  // Não cachear URLs de extensões do navegador
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'safari-extension:' ||
      url.protocol === 'edge-extension:') {
    return false
  }
  
  // Só cachear requisições HTTP/HTTPS
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false
  }
  
  // Não cachear requisições para localhost em desenvolvimento (opcional)
  // if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
  //   return false
  // }
  
  return true
}

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não podem ser cacheadas
  if (!canCacheRequest(event.request)) {
    return // Deixa o navegador lidar com a requisição normalmente
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar do cache se disponível
        if (response) {
          return response
        }

        // Buscar da rede
        return fetch(event.request).then((response) => {
          // Verificar se a resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Verificar novamente se pode cachear antes de tentar
          if (!canCacheRequest(event.request)) {
            return response
          }

          // Clonar a resposta
          const responseToCache = response.clone()

          // Só cachear requisições GET e que podem ser cacheadas
          if (event.request.method === 'GET' && canCacheRequest(event.request)) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  // Verificação final antes de cachear
                  const requestUrl = new URL(event.request.url)
                  if (requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:') {
                    cache.put(event.request, responseToCache).catch((error) => {
                      // Ignorar erros de cache silenciosamente (especialmente chrome-extension)
                      if (!error.message.includes('chrome-extension') && 
                          !error.message.includes('moz-extension')) {
                        console.warn('Erro ao cachear requisição:', error)
                      }
                    })
                  }
                } catch (error) {
                  // Ignorar erros de cache silenciosamente
                  if (!error.message?.includes('chrome-extension') && 
                      !error.message?.includes('moz-extension')) {
                    console.warn('Erro ao cachear requisição:', error)
                  }
                }
              })
              .catch((error) => {
                // Ignorar erros de cache silenciosamente
                console.warn('Erro ao abrir cache:', error)
              })
          }

          return response
        }).catch(() => {
          // Se offline e não estiver no cache, retornar página offline
          if (event.request.destination === 'document') {
            return caches.match('/offline.html')
          }
        })
      })
  )
})

// Notificações Push (quando implementado)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'RSV 360°'
  const options = {
    body: data.body || 'Você tem uma nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.url || '/'
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  )
})
