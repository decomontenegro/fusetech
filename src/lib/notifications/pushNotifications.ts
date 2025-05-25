// Firebase Cloud Messaging for Push Notifications
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  actions?: NotificationAction[]
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export interface PushSubscription {
  token: string
  userId: string
  deviceType: 'web' | 'ios' | 'android'
  createdAt: number
  lastUsed: number
}

class PushNotificationManager {
  private messaging: any = null
  private vapidKey: string
  private isSupported: boolean = false

  constructor() {
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''
    
    if (typeof window !== 'undefined') {
      this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
      
      if (this.isSupported) {
        this.messaging = getMessaging(app)
      }
    }
  }

  // Check if push notifications are supported
  isNotificationSupported(): boolean {
    return this.isSupported
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported')
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Get FCM token
  async getToken(): Promise<string | null> {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized')
    }

    try {
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
      })
      return token
    } catch (error) {
      console.error('Error getting FCM token:', error)
      return null
    }
  }

  // Subscribe to push notifications
  async subscribe(userId: string): Promise<PushSubscription | null> {
    try {
      const permission = await this.requestPermission()
      
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      const token = await this.getToken()
      
      if (!token) {
        throw new Error('Failed to get FCM token')
      }

      const subscription: PushSubscription = {
        token,
        userId,
        deviceType: 'web',
        createdAt: Date.now(),
        lastUsed: Date.now(),
      }

      // Save subscription to backend
      await this.saveSubscription(subscription)

      return subscription
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(userId: string): Promise<boolean> {
    try {
      const token = await this.getToken()
      
      if (token) {
        // Remove subscription from backend
        await this.removeSubscription(userId, token)
      }

      return true
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    }
  }

  // Listen for foreground messages
  onMessage(callback: (payload: MessagePayload) => void): () => void {
    if (!this.messaging) {
      return () => {}
    }

    const unsubscribe = onMessage(this.messaging, callback)
    return unsubscribe
  }

  // Show local notification
  showNotification(payload: NotificationPayload): void {
    if (!this.isSupported) {
      console.warn('Notifications not supported')
      return
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      image: payload.image,
      data: payload.data,
      actions: payload.actions,
      requireInteraction: true,
      tag: 'fusetech-notification',
    }

    new Notification(payload.title, options)
  }

  // Save subscription to backend
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }
    } catch (error) {
      console.error('Error saving subscription:', error)
      throw error
    }
  }

  // Remove subscription from backend
  private async removeSubscription(userId: string, token: string): Promise<void> {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, token }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove subscription')
      }
    } catch (error) {
      console.error('Error removing subscription:', error)
      throw error
    }
  }
}

export const pushNotificationManager = new PushNotificationManager()

// Notification templates
export const NotificationTemplates = {
  ACTIVITY_COMPLETED: (activityType: string, fuseEarned: number): NotificationPayload => ({
    title: '🎉 Atividade Concluída!',
    body: `Parabéns! Você ganhou ${fuseEarned} FUSE tokens por sua ${activityType}`,
    icon: '/icons/activity-completed.png',
    data: {
      type: 'activity_completed',
      fuseEarned,
      activityType,
    },
    actions: [
      {
        action: 'view_dashboard',
        title: 'Ver Dashboard',
      },
      {
        action: 'share_activity',
        title: 'Compartilhar',
      },
    ],
  }),

  BADGE_UNLOCKED: (badgeName: string): NotificationPayload => ({
    title: '🏆 Novo Badge Desbloqueado!',
    body: `Você conquistou o badge "${badgeName}"!`,
    icon: '/icons/badge-unlocked.png',
    data: {
      type: 'badge_unlocked',
      badgeName,
    },
    actions: [
      {
        action: 'view_badges',
        title: 'Ver Badges',
      },
    ],
  }),

  WEEKLY_GOAL_ACHIEVED: (goalType: string, reward: number): NotificationPayload => ({
    title: '🎯 Meta Semanal Atingida!',
    body: `Parabéns! Você completou sua meta de ${goalType} e ganhou ${reward} FUSE bonus!`,
    icon: '/icons/goal-achieved.png',
    data: {
      type: 'weekly_goal_achieved',
      goalType,
      reward,
    },
  }),

  MARKETPLACE_ITEM_AVAILABLE: (itemName: string, price: number): NotificationPayload => ({
    title: '🛍️ Novo Item no Marketplace!',
    body: `${itemName} está disponível por ${price} FUSE tokens`,
    icon: '/icons/marketplace.png',
    data: {
      type: 'marketplace_item',
      itemName,
      price,
    },
    actions: [
      {
        action: 'view_marketplace',
        title: 'Ver Marketplace',
      },
    ],
  }),

  FRIEND_CHALLENGE: (friendName: string, challengeType: string): NotificationPayload => ({
    title: '⚔️ Desafio de Amigo!',
    body: `${friendName} te desafiou para um ${challengeType}`,
    icon: '/icons/friend-challenge.png',
    data: {
      type: 'friend_challenge',
      friendName,
      challengeType,
    },
    actions: [
      {
        action: 'accept_challenge',
        title: 'Aceitar',
      },
      {
        action: 'decline_challenge',
        title: 'Recusar',
      },
    ],
  }),

  STREAK_REMINDER: (currentStreak: number): NotificationPayload => ({
    title: '🔥 Mantenha sua Sequência!',
    body: `Você tem ${currentStreak} dias de sequência. Não perca!`,
    icon: '/icons/streak-reminder.png',
    data: {
      type: 'streak_reminder',
      currentStreak,
    },
    actions: [
      {
        action: 'log_activity',
        title: 'Registrar Atividade',
      },
    ],
  }),
}

// Service Worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    console.log('Service Worker registered:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

// Handle notification clicks
export function handleNotificationClick(event: NotificationEvent): void {
  event.notification.close()

  const data = event.notification.data
  const action = event.action

  // Handle different actions
  switch (action) {
    case 'view_dashboard':
      event.waitUntil(
        clients.openWindow('/dashboard')
      )
      break
    case 'view_badges':
      event.waitUntil(
        clients.openWindow('/badges')
      )
      break
    case 'view_marketplace':
      event.waitUntil(
        clients.openWindow('/marketplace')
      )
      break
    case 'log_activity':
      event.waitUntil(
        clients.openWindow('/activities/new')
      )
      break
    default:
      // Default action - open app
      event.waitUntil(
        clients.openWindow('/')
      )
  }
}

// Initialize push notifications
export async function initializePushNotifications(userId: string): Promise<boolean> {
  try {
    // Register service worker
    await registerServiceWorker()
    
    // Subscribe to notifications
    const subscription = await pushNotificationManager.subscribe(userId)
    
    if (subscription) {
      console.log('Push notifications initialized successfully')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Failed to initialize push notifications:', error)
    return false
  }
}
