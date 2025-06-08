/**
 * Firebase Push Notifications Service
 * Re-exports the client service for backward compatibility
 */

export { notificationClient as notificationService } from './firebase-client';
export type { NotificationPayload, FUSENotification } from './firebase-client';
