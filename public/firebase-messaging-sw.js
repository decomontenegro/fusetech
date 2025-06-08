/**
 * Firebase Messaging Service Worker
 * Handles background push notifications for FUSEtech
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration - these values will be injected at build time
const firebaseConfig = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const { title, body, icon, image, data } = payload.notification || {};
  
  // Customize notification options
  const notificationOptions = {
    body: body || 'You have a new notification from FUSEtech',
    icon: icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: image,
    data: data || payload.data,
    actions: getNotificationActions(payload.data?.type),
    requireInteraction: true,
    tag: 'fusetech-notification',
    vibrate: [200, 100, 200],
    sound: '/sounds/notification.mp3'
  };

  // Show notification
  return self.registration.showNotification(
    title || 'FUSEtech',
    notificationOptions
  );
});

// Get notification actions based on type
function getNotificationActions(type) {
  const actions = {
    activity_reward: [
      { action: 'view_dashboard', title: '📊 View Dashboard', icon: '/icons/dashboard.png' },
      { action: 'share_achievement', title: '📤 Share', icon: '/icons/share.png' }
    ],
    challenge_complete: [
      { action: 'view_challenges', title: '🏆 View Challenges', icon: '/icons/challenges.png' },
      { action: 'share_achievement', title: '📤 Share', icon: '/icons/share.png' }
    ],
    marketplace_item: [
      { action: 'view_marketplace', title: '🛍️ View Marketplace', icon: '/icons/marketplace.png' },
      { action: 'dismiss', title: '❌ Dismiss', icon: '/icons/dismiss.png' }
    ],
    social_interaction: [
      { action: 'view_profile', title: '👤 View Profile', icon: '/icons/profile.png' },
      { action: 'dismiss', title: '❌ Dismiss', icon: '/icons/dismiss.png' }
    ],
    default: [
      { action: 'open_app', title: '📱 Open App', icon: '/icons/app.png' },
      { action: 'dismiss', title: '❌ Dismiss', icon: '/icons/dismiss.png' }
    ]
  };

  return actions[type] || actions.default;
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const { action, notification } = event;
  const { data } = notification;

  // Close notification
  notification.close();

  // Handle different actions
  switch (action) {
    case 'view_dashboard':
      event.waitUntil(clients.openWindow('/dashboard'));
      break;
    
    case 'view_challenges':
      event.waitUntil(clients.openWindow('/dashboard/challenges'));
      break;
    
    case 'view_marketplace':
      event.waitUntil(clients.openWindow('/marketplace'));
      break;
    
    case 'view_profile':
      event.waitUntil(clients.openWindow('/profile'));
      break;
    
    case 'share_achievement':
      event.waitUntil(handleShareAchievement(data));
      break;
    
    case 'dismiss':
      // Just close the notification
      break;
    
    default:
      // Default action - open the app
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Otherwise, open new window
          if (clients.openWindow) {
            const url = data?.url || data?.click_action || '/dashboard';
            return clients.openWindow(url);
          }
        })
      );
  }
});

// Handle share achievement
async function handleShareAchievement(data) {
  try {
    const allClients = await clients.matchAll({ type: 'window' });
    
    // Find an open window to handle the share
    for (const client of allClients) {
      if (client.url.includes(self.location.origin)) {
        client.focus();
        
        // Send message to the client to handle share
        client.postMessage({
          type: 'share-achievement',
          data: data
        });
        
        return;
      }
    }
    
    // If no client is open, open a new window with share data
    await clients.openWindow(`/share?achievement=${encodeURIComponent(JSON.stringify(data))}`);
  } catch (error) {
    console.error('Error sharing achievement:', error);
    // Fallback to opening dashboard
    await clients.openWindow('/dashboard');
  }
}

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal for analytics
  if (event.notification.data?.type) {
    // Send analytics event
    fetch('/api/analytics/notification-dismissed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: event.notification.data.type,
        timestamp: Date.now()
      })
    }).catch(console.error);
  }
});

// Handle push event (for custom push notifications)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (event.data) {
    try {
      const payload = event.data.json();
      
      const notificationOptions = {
        body: payload.body || payload.notification?.body,
        icon: payload.icon || payload.notification?.icon || '/icons/icon-192x192.png',
        badge: payload.badge || payload.notification?.badge || '/icons/badge-72x72.png',
        image: payload.image || payload.notification?.image,
        data: payload.data,
        actions: getNotificationActions(payload.data?.type),
        requireInteraction: true,
        tag: 'fusetech-push',
        vibrate: [200, 100, 200]
      };

      event.waitUntil(
        self.registration.showNotification(
          payload.title || payload.notification?.title || 'FUSEtech',
          notificationOptions
        )
      );
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(clients.claim());
});

// Cache notification resources
const CACHE_NAME = 'fusetech-notifications-v1';
const urlsToCache = [
  '/icons/icon-192x192.png',
  '/icons/badge-72x72.png',
  '/sounds/notification.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Serve cached resources
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/icons/') || event.request.url.includes('/sounds/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
        })
    );
  }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});