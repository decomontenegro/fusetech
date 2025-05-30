/**
 * Firebase Push Notifications Service
 * Handles web push notifications for FUSEtech
 */

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface FUSENotification {
  type: 'activity_reward' | 'challenge_complete' | 'marketplace_item' | 'social_interaction' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  userId: string;
}

class FirebaseNotificationService {
  private messaging: any = null;
  private vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  /**
   * Initialize messaging service
   */
  async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        // Register service worker
        await this.registerServiceWorker();

        // Initialize messaging
        this.messaging = getMessaging(app);

        console.log('Firebase messaging initialized');
      } catch (error) {
        console.error('Error initializing Firebase messaging:', error);
      }
    }
  }

  /**
   * Register service worker for push notifications
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    if (!this.messaging) {
      await this.initialize();
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Get FCM token
        const token = await getToken(this.messaging, {
          vapidKey: this.vapidKey,
        });

        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Listen for foreground messages
   */
  onForegroundMessage(callback: (payload: MessagePayload) => void): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  }

  /**
   * Show local notification
   */
  showLocalNotification(notification: NotificationPayload): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/badge-72x72.png',
        data: notification.data,
        requireInteraction: true,
        tag: 'fusetech-notification',
      } as NotificationOptions);

      // Handle notification click
      notif.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Handle navigation based on notification data
        if (notification.data?.url) {
          window.location.href = notification.data.url;
        }

        notif.close();
      };
    }
  }

  /**
   * Create notification for activity reward
   */
  createActivityRewardNotification(tokens: number, activityType: string): NotificationPayload {
    return {
      title: '🎉 FUSE Tokens Earned!',
      body: `You earned ${tokens} FUSE tokens for your ${activityType.toLowerCase()}!`,
      icon: '/icons/icon-192x192.png',
      data: {
        type: 'activity_reward',
        tokens,
        activityType,
        url: '/dashboard',
      },
      actions: [
        {
          action: 'view_dashboard',
          title: 'View Dashboard',
        },
        {
          action: 'share_achievement',
          title: 'Share',
        },
      ],
    };
  }

  /**
   * Create notification for challenge completion
   */
  createChallengeCompleteNotification(challengeName: string, reward: number): NotificationPayload {
    return {
      title: '🏆 Challenge Complete!',
      body: `Congratulations! You completed "${challengeName}" and earned ${reward} FUSE tokens!`,
      icon: '/icons/icon-192x192.png',
      data: {
        type: 'challenge_complete',
        challengeName,
        reward,
        url: '/dashboard/challenges',
      },
      actions: [
        {
          action: 'view_challenges',
          title: 'View Challenges',
        },
      ],
    };
  }

  /**
   * Create notification for marketplace item
   */
  createMarketplaceNotification(itemName: string, discount?: number): NotificationPayload {
    const title = discount ? '🛍️ Special Offer!' : '🛍️ New Item Available!';
    const body = discount
      ? `${itemName} is now ${discount}% off! Limited time offer.`
      : `Check out the new ${itemName} in the marketplace!`;

    return {
      title,
      body,
      icon: '/icons/icon-192x192.png',
      data: {
        type: 'marketplace_item',
        itemName,
        discount,
        url: '/marketplace',
      },
      actions: [
        {
          action: 'view_marketplace',
          title: 'View Marketplace',
        },
      ],
    };
  }

  /**
   * Create notification for social interaction
   */
  createSocialNotification(type: 'like' | 'comment' | 'follow', userName: string): NotificationPayload {
    const messages = {
      like: `${userName} liked your activity!`,
      comment: `${userName} commented on your activity!`,
      follow: `${userName} started following you!`,
    };

    return {
      title: '👥 Social Activity',
      body: messages[type],
      icon: '/icons/icon-192x192.png',
      data: {
        type: 'social_interaction',
        socialType: type,
        userName,
        url: '/profile',
      },
      actions: [
        {
          action: 'view_profile',
          title: 'View Profile',
        },
      ],
    };
  }

  /**
   * Send notification to specific user (server-side)
   */
  async sendNotificationToUser(
    userToken: string,
    notification: FUSENotification
  ): Promise<boolean> {
    try {
      // This would typically be called from a server-side API route
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: userToken,
          notification,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Subscribe user to topic (for broadcast notifications)
   */
  async subscribeToTopic(token: string, topic: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          topic,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }
}

export const notificationService = new FirebaseNotificationService();
