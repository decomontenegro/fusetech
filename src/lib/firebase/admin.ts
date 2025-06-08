/**
 * Firebase Admin SDK Configuration
 * Server-side Firebase operations
 */

import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { getApps, cert, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Firebase Admin configuration
  const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
  };

  try {
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    console.log('Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

// Initialize the app
const adminApp = initializeFirebaseAdmin();

// Export messaging instance
export const messaging = getMessaging(adminApp);

// Notification types
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  click_action?: string;
  data?: Record<string, string>;
}

export interface FUSENotification {
  type: 'activity_reward' | 'challenge_complete' | 'marketplace_item' | 'social_interaction' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  userId: string;
}

// Send notification to a single device
export async function sendNotificationToDevice(
  token: string,
  notification: NotificationPayload
): Promise<string> {
  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image,
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/icon-192x192.png',
          badge: notification.badge || '/icons/badge-72x72.png',
          image: notification.image,
          requireInteraction: true,
          tag: 'fusetech-notification',
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: notification.click_action || 'https://fusetech.app/dashboard',
        },
      },
      data: notification.data || {},
    };

    const response = await messaging.send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// Send notification to multiple devices
export async function sendNotificationToMultipleDevices(
  tokens: string[],
  notification: NotificationPayload
): Promise<admin.messaging.BatchResponse> {
  try {
    const messages = tokens.map(token => ({
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image,
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/icon-192x192.png',
          badge: notification.badge || '/icons/badge-72x72.png',
          image: notification.image,
          requireInteraction: true,
          tag: 'fusetech-notification',
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: notification.click_action || 'https://fusetech.app/dashboard',
        },
      },
      data: notification.data || {},
    }));

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image,
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/icon-192x192.png',
          badge: notification.badge || '/icons/badge-72x72.png',
          image: notification.image,
        },
      },
      data: notification.data || {},
    });

    console.log(`${response.successCount} messages sent successfully`);
    console.log(`${response.failureCount} messages failed`);
    
    return response;
  } catch (error) {
    console.error('Error sending multiple notifications:', error);
    throw error;
  }
}

// Send notification to a topic
export async function sendNotificationToTopic(
  topic: string,
  notification: NotificationPayload
): Promise<string> {
  try {
    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image,
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/icon-192x192.png',
          badge: notification.badge || '/icons/badge-72x72.png',
          image: notification.image,
          requireInteraction: true,
          tag: 'fusetech-notification',
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: notification.click_action || 'https://fusetech.app/dashboard',
        },
      },
      data: notification.data || {},
    };

    const response = await messaging.send(message);
    console.log('Successfully sent topic notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending topic notification:', error);
    throw error;
  }
}

// Subscribe tokens to a topic
export async function subscribeToTopic(
  tokens: string[],
  topic: string
): Promise<admin.messaging.MessagingTopicManagementResponse> {
  try {
    const response = await messaging.subscribeToTopic(tokens, topic);
    console.log(`Successfully subscribed ${response.successCount} tokens to topic ${topic}`);
    return response;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
}

// Unsubscribe tokens from a topic
export async function unsubscribeFromTopic(
  tokens: string[],
  topic: string
): Promise<admin.messaging.MessagingTopicManagementResponse> {
  try {
    const response = await messaging.unsubscribeFromTopic(tokens, topic);
    console.log(`Successfully unsubscribed ${response.successCount} tokens from topic ${topic}`);
    return response;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    throw error;
  }
}

// Create notification for different FUSEtech events
export function createActivityRewardNotification(
  tokens: number,
  activityType: string
): NotificationPayload {
  return {
    title: '🎉 FUSE Tokens Earned!',
    body: `You earned ${tokens} FUSE tokens for your ${activityType.toLowerCase()}!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    click_action: '/dashboard',
    data: {
      type: 'activity_reward',
      tokens: tokens.toString(),
      activityType,
      timestamp: new Date().toISOString(),
    },
  };
}

export function createChallengeCompleteNotification(
  challengeName: string,
  reward: number
): NotificationPayload {
  return {
    title: '🏆 Challenge Complete!',
    body: `Congratulations! You completed "${challengeName}" and earned ${reward} FUSE tokens!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    click_action: '/dashboard/challenges',
    data: {
      type: 'challenge_complete',
      challengeName,
      reward: reward.toString(),
      timestamp: new Date().toISOString(),
    },
  };
}

export function createMarketplaceNotification(
  itemName: string,
  discount?: number
): NotificationPayload {
  const title = discount ? '🛍️ Special Offer!' : '🛍️ New Item Available!';
  const body = discount
    ? `${itemName} is now ${discount}% off! Limited time offer.`
    : `Check out the new ${itemName} in the marketplace!`;

  return {
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    click_action: '/marketplace',
    data: {
      type: 'marketplace_item',
      itemName,
      discount: discount?.toString() || '0',
      timestamp: new Date().toISOString(),
    },
  };
}

export function createSocialNotification(
  type: 'like' | 'comment' | 'follow',
  userName: string
): NotificationPayload {
  const messages = {
    like: `${userName} liked your activity!`,
    comment: `${userName} commented on your activity!`,
    follow: `${userName} started following you!`,
  };

  return {
    title: '👥 Social Activity',
    body: messages[type],
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    click_action: '/profile',
    data: {
      type: 'social_interaction',
      socialType: type,
      userName,
      timestamp: new Date().toISOString(),
    },
  };
}

// Verify FCM token
export async function verifyToken(token: string): Promise<boolean> {
  try {
    // Send a dry run message to verify the token
    await messaging.send({
      token,
      data: {
        test: 'true',
      },
    }, true); // dry_run = true
    
    return true;
  } catch (error: any) {
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      return false;
    }
    throw error;
  }
}