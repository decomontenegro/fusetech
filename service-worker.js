// Versão do cache
const CACHE_VERSION = 'v2';

// Diferentes caches para diferentes tipos de recursos
const CACHES = {
  static: `fuselabs-static-${CACHE_VERSION}`,
  pages: `fuselabs-pages-${CACHE_VERSION}`,
  images: `fuselabs-images-${CACHE_VERSION}`,
  fonts: `fuselabs-fonts-${CACHE_VERSION}`,
  api: `fuselabs-api-${CACHE_VERSION}`
};

// Recursos estáticos essenciais (cache de longa duração)
const CORE_ASSETS = [
  '/css/styles.css',
  '/js/main.js',
  '/js/lazy-loader.js',
  '/js/module-loader.js',
  '/js/auth-service.js',
  '/js/pwa.js',
  '/offline.html',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/images/offline.svg',
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Páginas principais (cache com verificação de atualização)
const PAGES = [
  '/',
  '/index_modular.html',
  '/login.html',
  '/registro.html',
  '/atividades.html',
  '/desafios.html',
  '/comunidade.html',
  '/analytics.html',
  '/perfil.html',
  '/conquistas.html'
];

// Scripts não essenciais (carregados sob demanda)
const LAZY_SCRIPTS = [
  '/js/analytics.js',
  '/js/data-export.js',
  '/js/advanced-analytics.js',
  '/js/device-integration.js',
  '/js/gamification.js',
  '/js/offline-sync.js',
  '/js/auth-ui.js',
  '/js/user-menu.js',
  '/js/mobile-menu.js',
  '/js/notifications.js',
  '/js/atividades.js',
  '/js/conquistas.js',
  '/js/push-notifications.js',
  '/js/social-sharing.js',
  '/js/accessibility.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Componentes (carregados sob demanda)
const COMPONENTS = [
  '/js/components/activity-card.js',
  '/js/components/notification-center.js'
];

// Instalar o Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos essenciais
      caches.open(CACHES.static).then(cache => {
        console.log('Cacheando recursos estáticos essenciais');
        return cache.addAll(CORE_ASSETS);
      }),

      // Cache de páginas principais
      caches.open(CACHES.pages).then(cache => {
        console.log('Cacheando páginas principais');
        return cache.addAll(PAGES);
      }),

      // Pré-cache de scripts não essenciais (opcional)
      caches.open(CACHES.static).then(cache => {
        console.log('Pré-cacheando scripts não essenciais');
        // Usar addAll com catch para não bloquear a instalação se algum script falhar
        return Promise.allSettled(
          LAZY_SCRIPTS.map(url =>
            cache.add(url).catch(err => console.warn(`Falha ao pré-cachear ${url}:`, err))
          )
        );
      }),

      // Pré-cache de componentes (opcional)
      caches.open(CACHES.static).then(cache => {
        console.log('Pré-cacheando componentes');
        // Usar addAll com catch para não bloquear a instalação se algum componente falhar
        return Promise.allSettled(
          COMPONENTS.map(url =>
            cache.add(url).catch(err => console.warn(`Falha ao pré-cachear componente ${url}:`, err))
          )
        );
      })
    ])
    .then(() => {
      console.log('Instalação concluída, pulando espera');
      return self.skipWaiting();
    })
  );
});

// Ativar o Service Worker
self.addEventListener('activate', event => {
  // Lista de caches válidos
  const validCacheNames = Object.values(CACHES);

  event.waitUntil(
    // Limpar caches antigos
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Verificar se o cache não está na lista de caches válidos
            if (!validCacheNames.includes(cacheName)) {
              console.log(`Excluindo cache antigo: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker ativado, reivindicando clientes');
        return self.clients.claim();
      })
  );
});

// Estratégias de cache avançadas
self.addEventListener('fetch', event => {
  // Ignorar requisições não GET
  if (event.request.method !== 'GET') return;

  // Obter URL da requisição
  const url = new URL(event.request.url);

  // Ignorar requisições de API (exceto as que devem ser cacheadas)
  if (url.pathname.startsWith('/api/') && !url.pathname.includes('/api/static/')) {
    return;
  }

  // Escolher estratégia com base no tipo de recurso
  if (isImageRequest(event.request)) {
    // Estratégia para imagens: Cache First com fallback para rede e cache
    event.respondWith(handleImageRequest(event.request));
  }
  else if (isStaticAsset(event.request)) {
    // Estratégia para recursos estáticos: Cache First com atualização em segundo plano
    event.respondWith(handleStaticAsset(event.request));
  }
  else if (isHtmlRequest(event.request)) {
    // Estratégia para páginas HTML: Network First com fallback para cache
    event.respondWith(handleHtmlRequest(event.request));
  }
  else if (isApiRequest(event.request)) {
    // Estratégia para API cacheável: Stale While Revalidate
    event.respondWith(handleApiRequest(event.request));
  }
  else {
    // Estratégia padrão: Network First com timeout
    event.respondWith(handleDefaultRequest(event.request));
  }
});

/**
 * Verificar se é uma requisição de imagem
 */
function isImageRequest(request) {
  return request.destination === 'image' ||
         request.url.match(/\.(jpe?g|png|gif|svg|webp)$/i);
}

/**
 * Verificar se é um recurso estático
 */
function isStaticAsset(request) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'font' ||
         request.url.match(/\.(js|css|woff2?)$/i);
}

/**
 * Verificar se é uma requisição HTML
 */
function isHtmlRequest(request) {
  return request.mode === 'navigate' ||
         (request.destination === 'document' ||
          (request.headers.get('accept') &&
           request.headers.get('accept').includes('text/html')));
}

/**
 * Verificar se é uma requisição de API cacheável
 */
function isApiRequest(request) {
  return new URL(request.url).pathname.includes('/api/static/');
}

/**
 * Manipular requisição de imagem (Cache First com fallback)
 */
async function handleImageRequest(request) {
  // Tentar obter do cache de imagens
  const cachedResponse = await caches.match(request, { cacheName: CACHES.images });

  if (cachedResponse) {
    return cachedResponse;
  }

  // Se não estiver no cache, buscar da rede
  try {
    const networkResponse = await fetch(request);

    // Clonar a resposta antes de armazenar no cache
    const clonedResponse = networkResponse.clone();

    // Armazenar no cache em segundo plano
    caches.open(CACHES.images).then(cache => {
      cache.put(request, clonedResponse);
    });

    return networkResponse;
  } catch (error) {
    // Se falhar e for uma imagem, retornar uma imagem placeholder
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f0f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#888">Image</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' },
        status: 200
      }
    );
  }
}

/**
 * Manipular recurso estático (Cache First com atualização em segundo plano)
 */
async function handleStaticAsset(request) {
  // Tentar obter do cache estático
  const cachedResponse = await caches.match(request, { cacheName: CACHES.static });

  // Iniciar busca da rede em segundo plano
  const networkFetch = fetch(request).then(networkResponse => {
    // Verificar se a resposta é válida
    if (networkResponse && networkResponse.status === 200) {
      // Clonar a resposta antes de armazenar no cache
      const clonedResponse = networkResponse.clone();

      // Atualizar o cache em segundo plano
      caches.open(CACHES.static).then(cache => {
        cache.put(request, clonedResponse);
      });
    }

    return networkResponse;
  }).catch(() => {
    // Ignorar erros de rede para recursos estáticos
    console.log('Falha ao buscar recurso estático da rede:', request.url);
  });

  // Se tiver no cache, retornar imediatamente
  if (cachedResponse) {
    return cachedResponse;
  }

  // Se não estiver no cache, aguardar a rede
  try {
    return await networkFetch;
  } catch (error) {
    // Se falhar completamente, retornar erro
    throw error;
  }
}

/**
 * Manipular requisição HTML (Network First com fallback para cache)
 */
async function handleHtmlRequest(request) {
  try {
    // Tentar buscar da rede primeiro (com timeout)
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
    ]);

    // Clonar a resposta antes de armazenar no cache
    const clonedResponse = networkResponse.clone();

    // Atualizar o cache em segundo plano
    caches.open(CACHES.pages).then(cache => {
      cache.put(request, clonedResponse);
    });

    return networkResponse;
  } catch (error) {
    console.log('Falha ao buscar página da rede, usando cache:', error);

    // Tentar obter do cache
    const cachedResponse = await caches.match(request, { cacheName: CACHES.pages });

    if (cachedResponse) {
      return cachedResponse;
    }

    // Se não estiver no cache, retornar página offline
    return caches.match('/offline.html', { cacheName: CACHES.static });
  }
}

/**
 * Manipular requisição de API cacheável (Stale While Revalidate)
 */
async function handleApiRequest(request) {
  // Tentar obter do cache de API
  const cachedResponse = await caches.match(request, { cacheName: CACHES.api });

  // Iniciar busca da rede independentemente do resultado do cache
  const networkPromise = fetch(request).then(networkResponse => {
    // Verificar se a resposta é válida
    if (networkResponse && networkResponse.status === 200) {
      // Clonar a resposta antes de armazenar no cache
      const clonedResponse = networkResponse.clone();

      // Atualizar o cache
      caches.open(CACHES.api).then(cache => {
        cache.put(request, clonedResponse);
      });
    }

    return networkResponse;
  }).catch(error => {
    console.error('Falha ao buscar API da rede:', error);
    throw error;
  });

  // Se tiver no cache, retornar imediatamente
  if (cachedResponse) {
    // Retornar do cache enquanto atualiza em segundo plano
    return cachedResponse;
  }

  // Se não estiver no cache, aguardar a rede
  return networkPromise;
}

/**
 * Manipular requisição padrão (Network First com timeout)
 */
async function handleDefaultRequest(request) {
  try {
    // Tentar buscar da rede primeiro (com timeout)
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ]);

    // Clonar a resposta antes de armazenar no cache
    const clonedResponse = networkResponse.clone();

    // Armazenar no cache apropriado com base no tipo de conteúdo
    const contentType = networkResponse.headers.get('content-type') || '';
    let cacheName = CACHES.static;

    if (contentType.includes('font')) {
      cacheName = CACHES.fonts;
    } else if (contentType.includes('image')) {
      cacheName = CACHES.images;
    }

    // Atualizar o cache em segundo plano
    caches.open(cacheName).then(cache => {
      cache.put(request, clonedResponse);
    });

    return networkResponse;
  } catch (error) {
    console.log('Falha ao buscar da rede, usando cache:', error);

    // Tentar obter de qualquer cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Se não estiver em nenhum cache e for uma navegação, retornar página offline
    if (request.mode === 'navigate') {
      return caches.match('/offline.html', { cacheName: CACHES.static });
    }

    // Se não for navegação, retornar erro
    throw error;
  }
}

// Sincronização em segundo plano
self.addEventListener('sync', event => {
  if (event.tag === 'sync-activities') {
    event.waitUntil(syncActivities());
  } else if (event.tag === 'sync-challenges') {
    event.waitUntil(syncChallenges());
  }
});

// Função para sincronizar atividades
async function syncActivities() {
  try {
    // Obter atividades pendentes do IndexedDB
    const db = await openDatabase();
    const pendingActivities = await getPendingActivities(db);

    // Enviar atividades pendentes para o servidor
    for (const activity of pendingActivities) {
      await sendActivityToServer(activity);
      await markActivityAsSynced(db, activity.id);
    }

    // Notificar o usuário
    if (pendingActivities.length > 0) {
      self.registration.showNotification('FuseLabs', {
        body: `${pendingActivities.length} atividades sincronizadas com sucesso!`,
        icon: '/images/icons/icon-192x192.png'
      });
    }
  } catch (error) {
    console.error('Erro ao sincronizar atividades:', error);
  }
}

// Função para sincronizar desafios
async function syncChallenges() {
  // Implementação similar à sincronização de atividades
  console.log('Sincronizando desafios...');
}

// Funções auxiliares para IndexedDB (simuladas)
function openDatabase() {
  return Promise.resolve({});
}

function getPendingActivities(db) {
  return Promise.resolve([]);
}

function sendActivityToServer(activity) {
  return Promise.resolve();
}

function markActivityAsSynced(db, id) {
  return Promise.resolve();
}

// Manipular notificações push
self.addEventListener('push', event => {
  console.log('Notificação push recebida', event);

  if (!event.data) {
    console.log('Notificação push sem dados');
    return;
  }

  try {
    // Obter dados da notificação
    const data = event.data.json();

    // Configurar opções da notificação
    const options = {
      body: data.body || 'Nova notificação do FuseLabs',
      icon: data.icon || '/images/icons/icon-192x192.png',
      badge: data.badge || '/images/icons/badge-72x72.png',
      vibrate: data.vibrate || [100, 50, 100],
      data: {
        url: data.url || '/',
        type: data.type || 'default',
        id: data.id,
        timestamp: Date.now(),
        ...data.data
      },
      actions: data.actions || [
        {
          action: 'view',
          title: 'Ver'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ],
      tag: data.tag || `fuselabs-${Date.now()}`, // Tag única para agrupar notificações
      renotify: data.renotify || false,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false
    };

    // Mostrar notificação
    event.waitUntil(
      self.registration.showNotification(data.title || 'FuseLabs', options)
    );
  } catch (error) {
    console.error('Erro ao processar notificação push:', error);

    // Mostrar notificação genérica
    event.waitUntil(
      self.registration.showNotification('FuseLabs', {
        body: 'Você tem uma nova notificação',
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png'
      })
    );
  }
});

// Manipular clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('Clique em notificação', event);

  // Fechar notificação
  event.notification.close();

  // Obter URL da notificação
  const url = event.notification.data?.url || '/';

  // Verificar se há ação específica
  if (event.action) {
    // Manipular ações específicas
    switch (event.action) {
      case 'view':
        // Abrir URL específica
        event.waitUntil(openUrl(url));
        break;

      case 'dismiss':
        // Apenas fechar a notificação
        break;

      default:
        // Abrir URL padrão
        event.waitUntil(openUrl(url));
        break;
    }
  } else {
    // Abrir URL padrão
    event.waitUntil(openUrl(url));
  }
});

// Manipular fechamento de notificação
self.addEventListener('notificationclose', event => {
  console.log('Notificação fechada', event);

  // Registrar fechamento de notificação para análise
  const notificationData = event.notification.data;

  if (notificationData) {
    // Em um ambiente real, enviaríamos dados de análise para o servidor
    console.log('Notificação fechada sem interação:', notificationData);
  }
});

// Abrir URL em janela existente ou nova
async function openUrl(url) {
  // Obter todas as janelas do cliente
  const windowClients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // Verificar se alguma janela já está aberta
  for (const client of windowClients) {
    // Verificar se a URL já está aberta
    if (client.url === url && 'focus' in client) {
      // Focar na janela existente
      return client.focus();
    }
  }

  // Se nenhuma janela estiver aberta, abrir nova janela
  if (self.clients.openWindow) {
    return self.clients.openWindow(url);
  }
}
