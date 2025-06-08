/**
 * React hook for Firebase notifications
 * Provides easy access to notification functionality in components
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationClient } from '@/lib/notifications/firebase-client';
import { MessagePayload } from 'firebase/messaging';

export interface UseNotificationsReturn {
  permission: NotificationPermission;
  token: string | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  subscribeToTopic: (topic: string) => Promise<boolean>;
  unsubscribeFromTopic: (topic: string) => Promise<boolean>;
  sendNotification: (targetToken: string, notification: any) => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if notifications are supported
        const supported = notificationClient.isSupported();
        setIsSupported(supported);

        if (!supported) {
          setIsLoading(false);
          return;
        }

        // Initialize the notification client
        await notificationClient.initialize();

        // Get current permission status
        const currentPermission = notificationClient.getPermissionStatus();
        setPermission(currentPermission);

        // Get current token if permission is granted
        if (currentPermission === 'granted') {
          const currentToken = notificationClient.getCurrentToken();
          setToken(currentToken);
        }

        // Set up foreground message handler
        notificationClient.onForegroundMessage((payload: MessagePayload) => {
          console.log('Foreground notification received:', payload);
          
          // Show local notification
          if (payload.notification) {
            notificationClient.showLocalNotification({
              title: payload.notification.title || 'FUSEtech',
              body: payload.notification.body || '',
              icon: payload.notification.icon,
              image: payload.notification.image,
              data: payload.data,
            });
          }
        });

      } catch (err: any) {
        console.error('Error initializing notifications:', err);
        setError(err.message || 'Failed to initialize notifications');
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Notifications are not supported in this browser');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const fcmToken = await notificationClient.requestPermissionAndGetToken();
      
      if (fcmToken) {
        setToken(fcmToken);
        setPermission('granted');
        
        // Automatically subscribe to important topics
        await notificationClient.subscribeToTopic('all_users');
        await notificationClient.subscribeToTopic('app_updates');
      } else {
        setPermission('denied');
      }
    } catch (err: any) {
      console.error('Error requesting permission:', err);
      setError(err.message || 'Failed to request permission');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Subscribe to topic
  const subscribeToTopic = useCallback(async (topic: string): Promise<boolean> => {
    if (!token) {
      setError('No FCM token available');
      return false;
    }

    try {
      return await notificationClient.subscribeToTopic(topic);
    } catch (err: any) {
      console.error('Error subscribing to topic:', err);
      setError(err.message || 'Failed to subscribe to topic');
      return false;
    }
  }, [token]);

  // Unsubscribe from topic
  const unsubscribeFromTopic = useCallback(async (topic: string): Promise<boolean> => {
    if (!token) {
      setError('No FCM token available');
      return false;
    }

    try {
      return await notificationClient.unsubscribeFromTopic(topic);
    } catch (err: any) {
      console.error('Error unsubscribing from topic:', err);
      setError(err.message || 'Failed to unsubscribe from topic');
      return false;
    }
  }, [token]);

  // Send notification
  const sendNotification = useCallback(async (
    targetToken: string,
    notification: any
  ): Promise<boolean> => {
    try {
      return await notificationClient.sendNotification(targetToken, notification);
    } catch (err: any) {
      console.error('Error sending notification:', err);
      setError(err.message || 'Failed to send notification');
      return false;
    }
  }, []);

  return {
    permission,
    token,
    isSupported,
    isLoading,
    error,
    requestPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
    sendNotification,
  };
}