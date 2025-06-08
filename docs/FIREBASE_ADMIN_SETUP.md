# Firebase Admin SDK Setup Guide

This guide explains how to set up Firebase Admin SDK for FUSEtech's push notification system.

## Overview

The Firebase Admin SDK has been integrated into the backend to handle server-side push notifications. The client-side Firebase SDK is used only for obtaining FCM tokens and handling foreground messages.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Client App    │────────▶│   Backend APIs   │────────▶│ Firebase Admin  │
│ (Firebase SDK)  │         │  (Next.js API)   │         │      SDK        │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │                            │                            │
        ▼                            ▼                            ▼
   Get FCM Token              Validate & Process           Send Notifications
   Handle Messages            Send via Admin SDK           Manage Topics
```

## Environment Variables

Add the following to your `.env.local`:

```env
# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Firebase Admin SDK (Private)
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

## Getting Firebase Credentials

### 1. Client SDK Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings > General
4. Under "Your apps", find your web app
5. Copy the configuration values

### 2. Admin SDK Service Account

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Extract the `private_key` and `client_email` values

### 3. VAPID Key for Web Push

1. In Firebase Console, go to Project Settings > Cloud Messaging
2. Under "Web configuration", find "Web Push certificates"
3. Generate a new key pair if needed
4. Copy the VAPID key

## API Endpoints

### Send Notification
```typescript
POST /api/notifications/send
{
  "token": "user-fcm-token",
  "notification": {
    "title": "Activity Complete!",
    "body": "You earned 50 FUSE tokens"
  },
  "type": "activity_reward", // optional
  "data": { // optional
    "tokens": 50,
    "activityType": "running"
  }
}
```

### Subscribe to Topic
```typescript
POST /api/notifications/subscribe
{
  "token": "user-fcm-token",
  "topic": "challenges"
}
```

### Unsubscribe from Topic
```typescript
POST /api/notifications/unsubscribe
{
  "token": "user-fcm-token",
  "topic": "challenges"
}
```

### Verify Token
```typescript
POST /api/notifications/verify-token
{
  "token": "user-fcm-token"
}
```

## Client-Side Usage

### React Hook
```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    permission,
    token,
    requestPermission,
    subscribeToTopic
  } = useNotifications();

  const enableNotifications = async () => {
    await requestPermission();
    if (permission === 'granted') {
      await subscribeToTopic('activities');
    }
  };
}
```

### Notification Permission Banner
```tsx
import { NotificationPermissionBanner } from '@/components/NotificationPermissionBanner';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <NotificationPermissionBanner />
    </>
  );
}
```

## Server-Side Usage

### Send Notifications from Server Actions
```typescript
import { notificationService } from '@/services/notificationService';

// Send activity reward notification
await notificationService.sendActivityRewardNotification(
  userToken,
  50, // tokens earned
  'running' // activity type
);

// Send to multiple users
await notificationService.sendNotificationToUsers(
  [token1, token2],
  {
    type: 'challenge_complete',
    data: {
      challengeName: 'Weekly Marathon',
      reward: 100
    }
  }
);

// Send to topic
await notificationService.sendTopicNotification(
  'all_users',
  'App Update',
  'New features are now available!',
  { version: '2.0' }
);
```

## Service Worker Configuration

The service worker is automatically configured during build time:

1. During development, update `/public/firebase-messaging-sw.js` placeholders
2. Run `npm run build:sw` to inject environment variables
3. The build process automatically runs this before Next.js build

## Testing Notifications

1. **Enable notifications in your browser**
   - Allow notifications when prompted
   - Check browser settings if blocked

2. **Test sending a notification**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send \
     -H "Content-Type: application/json" \
     -d '{
       "token": "YOUR_FCM_TOKEN",
       "notification": {
         "title": "Test Notification",
         "body": "This is a test message"
       }
     }'
   ```

3. **Monitor Firebase Console**
   - Go to Cloud Messaging in Firebase Console
   - Check the messaging statistics

## Troubleshooting

### Common Issues

1. **"No Firebase App" Error**
   - Ensure environment variables are set
   - Check if Firebase Admin is initialized before use

2. **Invalid Token Error**
   - Token may have expired
   - User may have cleared browser data
   - Verify token using the verify endpoint

3. **Service Worker Not Registering**
   - Check if running on HTTPS (required for service workers)
   - Clear browser cache and re-register
   - Check browser console for errors

4. **Notifications Not Showing**
   - Ensure browser notifications are enabled
   - Check if app is in foreground (use background tab)
   - Verify notification payload format

## Security Best Practices

1. **Never expose Admin SDK credentials**
   - Keep `FIREBASE_ADMIN_PRIVATE_KEY` server-side only
   - Use environment variables, never commit to git

2. **Validate tokens server-side**
   - Always verify FCM tokens before sending notifications
   - Implement rate limiting on notification endpoints

3. **Topic naming conventions**
   - Use descriptive, hierarchical topic names
   - Examples: `activities_running`, `challenges_weekly`

4. **Data minimization**
   - Only send necessary data in notifications
   - Avoid sensitive information in notification payloads

## Production Deployment

1. **Environment Variables**
   - Set all Firebase variables in your hosting platform
   - Ensure private keys are properly escaped

2. **Service Worker Caching**
   - Update cache version when making changes
   - Implement proper cache invalidation

3. **Monitoring**
   - Set up Firebase Cloud Messaging analytics
   - Monitor notification delivery rates
   - Track user engagement with notifications