/**
 * Firebase Push Notifications Client Service
 * Handles client-side notification setup and interaction with backend APIs
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

class FirebaseNotificationClient {
  private messaging: any = null;
  private vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  private currentToken: string | null = null;

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
        this.currentToken = token;

        // Verify token with backend
        await this.verifyTokenWithBackend(token);

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
   * Get current FCM token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Verify token with backend
   */
  private async verifyTokenWithBackend(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
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
   * Send notification via backend API
   */
  async sendNotification(
    targetToken: string,
    notification: {
      title: string;
      body: string;
      type?: string;
      data?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: targetToken,
          notification,
          type: notification.type,
          data: notification.data,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Send notification to topic via backend API
   */
  async sendNotificationToTopic(
    topic: string,
    notification: {
      title: string;
      body: string;
      type?: string;
      data?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          notification,
          type: notification.type,
          data: notification.data,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending topic notification:', error);
      return false;
    }
  }

  /**
   * Subscribe to topic
   */
  async subscribeToTopic(topic: string): Promise<boolean> {
    if (!this.currentToken) {
      console.error('No FCM token available');
      return false;
    }

    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.currentToken,
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
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    if (!this.currentToken) {
      console.error('No FCM token available');
      return false;
    }

    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.currentToken,
          topic,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
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

export const notificationClient = new FirebaseNotificationClient();