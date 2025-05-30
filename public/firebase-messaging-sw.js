/**
 * Firebase Messaging Service Worker
 * Handles background push notifications for FUSEtech
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
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
            const url = data?.url || '/dashboard';
            return clients.openWindow(url);
          }
        })
      );
  }
});

// Handle share achievement
async function handleShareAchievement(data) {
  try {
    if (navigator.share) {
      // Use native sharing if available
      await navigator.share({
        title: 'FUSEtech Achievement',
        text: `I just earned ${data.tokens} FUSE tokens for my ${data.activityType}! 🎉`,
        url: `${self.location.origin}/dashboard`
      });
    } else {
      // Fallback to opening share page
      await clients.openWindow(`/share?achievement=${encodeURIComponent(JSON.stringify(data))}`);
    }
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
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        image: payload.image,
        data: payload.data,
        actions: getNotificationActions(payload.data?.type),
        requireInteraction: true,
        tag: 'fusetech-push',
        vibrate: [200, 100, 200]
      };

      event.waitUntil(
        self.registration.showNotification(
          payload.title || 'FUSEtech',
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

// Cache notification sounds and icons
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/sounds/') || event.request.url.includes('/icons/')) {
    event.respondWith(
      caches.open('fusetech-notifications').then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
