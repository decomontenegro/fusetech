import { NextRequest, NextResponse } from 'next/server';

// Firebase Admin SDK (server-side)
interface FirebaseAdminConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

interface NotificationPayload {
  token: string;
  notification: {
    title: string;
    body: string;
    icon?: string;
    image?: string;
  };
  data?: Record<string, string>;
  webpush?: {
    headers?: Record<string, string>;
    data?: Record<string, string>;
    notification?: {
      title?: string;
      body?: string;
      icon?: string;
      badge?: string;
      image?: string;
      actions?: Array<{
        action: string;
        title: string;
        icon?: string;
      }>;
      requireInteraction?: boolean;
      tag?: string;
      vibrate?: number[];
    };
  };
}

class FirebaseAdminService {
  private initialized = false;
  private admin: any = null;

  async initialize() {
    if (this.initialized) return;

    try {
      // In a real implementation, you would use Firebase Admin SDK
      // For now, we'll simulate the service
      console.log('Firebase Admin initialized (simulated)');
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<string> {
    await this.initialize();

    try {
      // In a real implementation, this would use Firebase Admin SDK
      // admin.messaging().send(message)
      
      console.log('Sending notification:', payload);
      
      // Simulate successful send
      return 'notification-id-' + Date.now();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendToTopic(topic: string, payload: Omit<NotificationPayload, 'token'>): Promise<string> {
    await this.initialize();

    try {
      console.log(`Sending notification to topic ${topic}:`, payload);
      
      // Simulate successful send
      return 'topic-notification-id-' + Date.now();
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw error;
    }
  }
}

const firebaseAdmin = new FirebaseAdminService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, notification, data, topic } = body;

    // Validate required fields
    if (!notification?.title || !notification?.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    if (!token && !topic) {
      return NextResponse.json(
        { error: 'Either token or topic is required' },
        { status: 400 }
      );
    }

    // Prepare notification payload
    const payload: NotificationPayload = {
      token: token || '',
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        image: notification.image,
      },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : undefined,
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          image: notification.image,
          requireInteraction: true,
          tag: 'fusetech-notification',
          vibrate: [200, 100, 200],
          actions: getNotificationActions(notification.type),
        },
        headers: {
          'Urgency': 'high',
        },
      },
    };

    let messageId: string;

    if (topic) {
      // Send to topic
      messageId = await firebaseAdmin.sendToTopic(topic, payload);
    } else {
      // Send to specific token
      messageId = await firebaseAdmin.sendNotification(payload);
    }

    return NextResponse.json({
      success: true,
      messageId,
    });

  } catch (error) {
    console.error('Error in notification API:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

function getNotificationActions(type?: string) {
  const actions = {
    activity_reward: [
      { action: 'view_dashboard', title: '📊 Dashboard' },
      { action: 'share_achievement', title: '📤 Share' }
    ],
    challenge_complete: [
      { action: 'view_challenges', title: '🏆 Challenges' },
      { action: 'share_achievement', title: '📤 Share' }
    ],
    marketplace_item: [
      { action: 'view_marketplace', title: '🛍️ Marketplace' },
      { action: 'dismiss', title: '❌ Dismiss' }
    ],
    social_interaction: [
      { action: 'view_profile', title: '👤 Profile' },
      { action: 'dismiss', title: '❌ Dismiss' }
    ],
    default: [
      { action: 'open_app', title: '📱 Open App' },
      { action: 'dismiss', title: '❌ Dismiss' }
    ]
  };

  return actions[type as keyof typeof actions] || actions.default;
}
