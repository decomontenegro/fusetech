/**
 * Server-side notification service
 * Handles sending notifications from server actions and API routes
 */

import {
  sendNotificationToDevice,
  sendNotificationToMultipleDevices,
  sendNotificationToTopic,
  createActivityRewardNotification,
  createChallengeCompleteNotification,
  createMarketplaceNotification,
  createSocialNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  verifyToken,
} from '@/lib/firebase/admin';

export interface NotificationRequest {
  userId?: string;
  token?: string;
  tokens?: string[];
  topic?: string;
  type: 'activity_reward' | 'challenge_complete' | 'marketplace_item' | 'social_interaction' | 'custom';
  data: Record<string, any>;
}

class NotificationService {
  /**
   * Send notification for activity reward
   */
  async sendActivityRewardNotification(
    userToken: string,
    tokens: number,
    activityType: string
  ): Promise<string> {
    const notification = createActivityRewardNotification(tokens, activityType);
    return await sendNotificationToDevice(userToken, notification);
  }

  /**
   * Send notification for challenge completion
   */
  async sendChallengeCompleteNotification(
    userToken: string,
    challengeName: string,
    reward: number
  ): Promise<string> {
    const notification = createChallengeCompleteNotification(challengeName, reward);
    return await sendNotificationToDevice(userToken, notification);
  }

  /**
   * Send notification for marketplace item
   */
  async sendMarketplaceNotification(
    userToken: string,
    itemName: string,
    discount?: number
  ): Promise<string> {
    const notification = createMarketplaceNotification(itemName, discount);
    return await sendNotificationToDevice(userToken, notification);
  }

  /**
   * Send notification for social interaction
   */
  async sendSocialNotification(
    userToken: string,
    type: 'like' | 'comment' | 'follow',
    userName: string
  ): Promise<string> {
    const notification = createSocialNotification(type, userName);
    return await sendNotificationToDevice(userToken, notification);
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(
    userToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<string> {
    return await sendNotificationToDevice(userToken, {
      title,
      body,
      data,
      click_action: '/dashboard',
    });
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToUsers(
    userTokens: string[],
    notification: NotificationRequest
  ) {
    let payload;

    switch (notification.type) {
      case 'activity_reward':
        payload = createActivityRewardNotification(
          notification.data.tokens,
          notification.data.activityType
        );
        break;
      
      case 'challenge_complete':
        payload = createChallengeCompleteNotification(
          notification.data.challengeName,
          notification.data.reward
        );
        break;
      
      case 'marketplace_item':
        payload = createMarketplaceNotification(
          notification.data.itemName,
          notification.data.discount
        );
        break;
      
      case 'social_interaction':
        payload = createSocialNotification(
          notification.data.socialType,
          notification.data.userName
        );
        break;
      
      default:
        payload = {
          title: notification.data.title,
          body: notification.data.body,
          data: notification.data,
        };
    }

    return await sendNotificationToMultipleDevices(userTokens, payload);
  }

  /**
   * Send notification to all users subscribed to a topic
   */
  async sendTopicNotification(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<string> {
    return await sendNotificationToTopic(topic, {
      title,
      body,
      data,
    });
  }

  /**
   * Subscribe user to notification topics
   */
  async subscribeUserToTopics(userToken: string, topics: string[]) {
    const results = await Promise.all(
      topics.map(topic => subscribeToTopic([userToken], topic))
    );
    
    return results.map((result, index) => ({
      topic: topics[index],
      success: result.successCount > 0,
      errors: result.errors,
    }));
  }

  /**
   * Unsubscribe user from notification topics
   */
  async unsubscribeUserFromTopics(userToken: string, topics: string[]) {
    const results = await Promise.all(
      topics.map(topic => unsubscribeFromTopic([userToken], topic))
    );
    
    return results.map((result, index) => ({
      topic: topics[index],
      success: result.successCount > 0,
      errors: result.errors,
    }));
  }

  /**
   * Verify if a token is valid
   */
  async verifyUserToken(token: string): Promise<boolean> {
    return await verifyToken(token);
  }

  /**
   * Send activity completion notification
   */
  async notifyActivityCompletion(
    userToken: string,
    activityData: {
      type: string;
      duration: number;
      distance?: number;
      tokensEarned: number;
    }
  ): Promise<string> {
    const notification = createActivityRewardNotification(
      activityData.tokensEarned,
      activityData.type
    );
    
    // Add extra data
    notification.data = {
      ...notification.data,
      duration: activityData.duration.toString(),
      distance: activityData.distance?.toString() || '0',
    };

    return await sendNotificationToDevice(userToken, notification);
  }

  /**
   * Send challenge invitation notification
   */
  async sendChallengeInvitation(
    userToken: string,
    challengerName: string,
    challengeName: string
  ): Promise<string> {
    return await sendNotificationToDevice(userToken, {
      title: '🎯 Challenge Invitation!',
      body: `${challengerName} invited you to join "${challengeName}"`,
      click_action: '/dashboard/challenges',
      data: {
        type: 'challenge_invitation',
        challengerName,
        challengeName,
      },
    });
  }

  /**
   * Send team notification
   */
  async sendTeamNotification(
    teamTokens: string[],
    teamName: string,
    message: string
  ) {
    return await sendNotificationToMultipleDevices(teamTokens, {
      title: `👥 ${teamName}`,
      body: message,
      click_action: '/dashboard/teams',
      data: {
        type: 'team_notification',
        teamName,
      },
    });
  }
}

export const notificationService = new NotificationService();