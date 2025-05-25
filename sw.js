/**
 * FUSEtech Service Worker
 * Implementa cache inteligente, offline functionality e push notifications
 */

const CACHE_NAME = 'fusetech-v1.0.0';
const STATIC_CACHE = 'fusetech-static-v1.0.0';
const DYNAMIC_CACHE = 'fusetech-dynamic-v1.0.0';
const IMAGE_CACHE = 'fusetech-images-v1.0.0';

// Recursos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/achievements.html',
  '/goals.html',
  '/marketplace.html',
  '/community.html',
  '/styles/design-system.css',
  '/styles/components.css',
  '/styles/animations.css',
  '/styles/gamification.css',
  '/styles/ai-insights.css',
  '/styles/social.css',
  '/styles/marketplace.css',
  '/js/app.js',
  '/js/animations.js',
  '/js/components.js',
  '/js/gamification.js',
  '/js/ai-insights.js',
  '/js/social.js',
  '/js/marketplace.js',
  '/assets/icons/favicon.svg',
  '/assets/icons/favicon.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// URLs que devem sempre buscar da rede
const NETWORK_FIRST_URLS = [
  '/api/',
  '/auth/',
  '/real-time/'
];

// URLs para cache de imagens
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

/**
 * Evento de instalação do Service Worker
 */
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

/**
 * Evento de ativação do Service Worker
 */
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Remove caches antigos
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

/**
 * Intercepta requisições de rede
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Estratégia baseada no tipo de recurso
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request));
  } else if (isImageRequest(request.url)) {
    event.respondWith(imageCache(request));
  } else if (isNetworkFirst(request.url)) {
    event.respondWith(networkFirst(request));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(networkWithFallback(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Cache First - Para recursos estáticos
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First - Para dados dinâmicos
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache...');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Você está offline. Alguns dados podem estar desatualizados.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Stale While Revalidate - Para conteúdo que pode ser atualizado
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

/**
 * Cache de imagens com compressão
 */
async function imageCache(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache apenas imagens válidas
    if (networkResponse.ok && networkResponse.headers.get('content-type')?.startsWith('image/')) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Image cache failed:', error);
    // Retorna imagem placeholder em caso de erro
    return new Response(createPlaceholderSVG(), {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

/**
 * Network com fallback para APIs
 */
async function networkWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache apenas respostas bem-sucedidas
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para dados offline
    return createOfflineFallback(request);
  }
}

/**
 * Verifica se é um recurso estático
 */
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('fonts.googleapis.com') ||
         url.includes('cdnjs.cloudflare.com');
}

/**
 * Verifica se é uma requisição de imagem
 */
function isImageRequest(url) {
  return IMAGE_EXTENSIONS.some(ext => url.includes(ext)) ||
         url.includes('images.unsplash.com') ||
         url.includes('avatar') ||
         url.includes('photo');
}

/**
 * Verifica se deve usar network first
 */
function isNetworkFirst(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

/**
 * Verifica se é uma requisição de API
 */
function isAPIRequest(url) {
  return url.includes('/api/') || 
         url.includes('supabase.co') ||
         url.includes('github.com/api');
}

/**
 * Cria SVG placeholder para imagens
 */
function createPlaceholderSVG() {
  return `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
        Imagem indisponível offline
      </text>
    </svg>
  `;
}

/**
 * Cria fallback para dados offline
 */
function createOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (url.pathname.includes('/api/activities')) {
    return new Response(JSON.stringify({
      activities: [],
      message: 'Dados offline - sincronização pendente'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname.includes('/api/achievements')) {
    return new Response(JSON.stringify({
      achievements: [],
      message: 'Conquistas serão sincronizadas quando online'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    error: 'Offline',
    message: 'Funcionalidade indisponível offline'
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Manipula mensagens do cliente
 */
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      cacheUrls(payload.urls);
      break;
      
    case 'CLEAR_CACHE':
      clearCache(payload.cacheName);
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
  }
});

/**
 * Cache URLs específicas
 */
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
    console.log('[SW] URLs cached successfully:', urls);
  } catch (error) {
    console.error('[SW] Failed to cache URLs:', error);
  }
}

/**
 * Limpa cache específico
 */
async function clearCache(cacheName) {
  try {
    await caches.delete(cacheName || DYNAMIC_CACHE);
    console.log('[SW] Cache cleared:', cacheName);
  } catch (error) {
    console.error('[SW] Failed to clear cache:', error);
  }
}

/**
 * Calcula tamanho do cache
 */
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('[SW] Failed to calculate cache size:', error);
    return 0;
  }
}

/**
 * Manipula push notifications
 */
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Você tem uma nova atividade para sincronizar!',
    icon: '/assets/icons/favicon.png',
    badge: '/assets/icons/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Atividade',
        icon: '/assets/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/assets/icons/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'FUSEtech';
  }
  
  event.waitUntil(
    self.registration.showNotification('FUSEtech', options)
  );
});

/**
 * Manipula cliques em notificações
 */
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
  } else {
    // Clique na notificação principal
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Sincronização em background
 */
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Executa sincronização em background
 */
async function doBackgroundSync() {
  try {
    console.log('[SW] Performing background sync...');
    
    // Sincroniza dados pendentes
    const pendingData = await getPendingData();
    
    if (pendingData.length > 0) {
      await syncPendingData(pendingData);
      await clearPendingData();
    }
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

/**
 * Obtém dados pendentes de sincronização
 */
async function getPendingData() {
  // Implementar lógica para obter dados pendentes do IndexedDB
  return [];
}

/**
 * Sincroniza dados pendentes
 */
async function syncPendingData(data) {
  // Implementar lógica de sincronização
  console.log('[SW] Syncing pending data:', data);
}

/**
 * Limpa dados pendentes após sincronização
 */
async function clearPendingData() {
  // Implementar lógica para limpar dados sincronizados
  console.log('[SW] Pending data cleared');
}
