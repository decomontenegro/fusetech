/**
 * Notification Permission Banner Component
 * Prompts users to enable push notifications
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Bell, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationPermissionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const {
    permission,
    isSupported,
    isLoading,
    error,
    requestPermission,
    subscribeToTopic,
  } = useNotifications();

  useEffect(() => {
    // Check if banner should be shown
    const dismissed = localStorage.getItem('notification-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Show banner if notifications are supported but not granted
    if (isSupported && permission === 'default' && !isLoading) {
      setIsVisible(true);
    }
  }, [isSupported, permission, isLoading]);

  const handleEnableNotifications = async () => {
    try {
      await requestPermission();
      
      // Subscribe to default topics after permission is granted
      if (permission === 'granted') {
        await subscribeToTopic('activities');
        await subscribeToTopic('challenges');
        await subscribeToTopic('marketplace');
      }
      
      setIsVisible(false);
    } catch (err) {
      console.error('Error enabling notifications:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  if (!isVisible || isDismissed || !isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                Enable Push Notifications
              </h3>
              <p className="text-sm text-white/90 mb-3">
                Stay updated with your activities, challenges, and rewards!
              </p>
              {error && (
                <p className="text-xs text-red-200 mb-2">{error}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white text-purple-600 rounded-md font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Enabling...' : 'Enable Notifications'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-white/20 text-white rounded-md font-medium text-sm hover:bg-white/30 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification status indicator component
export function NotificationStatusIndicator() {
  const { permission, isSupported } = useNotifications();

  if (!isSupported) {
    return null;
  }

  const getStatusColor = () => {
    switch (permission) {
      case 'granted':
        return 'text-green-500';
      case 'denied':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    return permission === 'granted' ? (
      <Bell className="h-5 w-5" />
    ) : (
      <BellOff className="h-5 w-5" />
    );
  };

  return (
    <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-xs">
        {permission === 'granted' ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}