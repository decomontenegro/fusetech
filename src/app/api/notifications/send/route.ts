import { NextRequest, NextResponse } from 'next/server';
import { 
  sendNotificationToDevice, 
  sendNotificationToTopic,
  sendNotificationToMultipleDevices,
  createActivityRewardNotification,
  createChallengeCompleteNotification,
  createMarketplaceNotification,
  createSocialNotification,
  NotificationPayload
} from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, tokens, topic, notification, data, type } = body;

    // Validate required fields
    if (!notification?.title || !notification?.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    if (!token && !tokens && !topic) {
      return NextResponse.json(
        { error: 'Either token, tokens array, or topic is required' },
        { status: 400 }
      );
    }

    // Create notification payload based on type
    let payload: NotificationPayload;
    
    if (type) {
      // Use predefined notification templates
      switch (type) {
        case 'activity_reward':
          payload = createActivityRewardNotification(
            data?.tokens || 0,
            data?.activityType || 'activity'
          );
          break;
        
        case 'challenge_complete':
          payload = createChallengeCompleteNotification(
            data?.challengeName || 'Challenge',
            data?.reward || 0
          );
          break;
        
        case 'marketplace_item':
          payload = createMarketplaceNotification(
            data?.itemName || 'Item',
            data?.discount
          );
          break;
        
        case 'social_interaction':
          payload = createSocialNotification(
            data?.socialType || 'like',
            data?.userName || 'Someone'
          );
          break;
        
        default:
          // Custom notification
          payload = {
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icons/icon-192x192.png',
            badge: notification.badge || '/icons/badge-72x72.png',
            image: notification.image,
            click_action: notification.click_action || '/dashboard',
            data: data ? Object.fromEntries(
              Object.entries(data).map(([key, value]) => [key, String(value)])
            ) : undefined,
          };
      }
    } else {
      // Custom notification
      payload = {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/badge-72x72.png',
        image: notification.image,
        click_action: notification.click_action || '/dashboard',
        data: data ? Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, String(value)])
        ) : undefined,
      };
    }

    let messageId: string;

    if (topic) {
      // Send to topic
      messageId = await sendNotificationToTopic(topic, payload);
    } else if (tokens && Array.isArray(tokens)) {
      // Send to multiple devices
      const response = await sendNotificationToMultipleDevices(tokens, payload);
      return NextResponse.json({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      });
    } else {
      // Send to specific token
      messageId = await sendNotificationToDevice(token, payload);
    }

    return NextResponse.json({
      success: true,
      messageId,
    });

  } catch (error: any) {
    console.error('Error in notification API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send notification',
        details: error.message 
      },
      { status: 500 }
    );
  }
}