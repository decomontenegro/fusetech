import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Event types for analytics
export interface AnalyticsEvent {
  id: string
  type: 'user_action' | 'system_event' | 'business_metric'
  category: string
  action: string
  label?: string
  value?: number
  properties?: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
}

// User behavior tracking
export interface UserSession {
  id: string
  userId?: string
  startTime: number
  endTime?: number
  pageViews: string[]
  events: string[]
  device: {
    type: 'mobile' | 'tablet' | 'desktop'
    os: string
    browser: string
  }
  location?: {
    country: string
    city: string
  }
}

// A/B Testing
export interface ABTest {
  id: string
  name: string
  variants: {
    id: string
    name: string
    weight: number
    config: Record<string, any>
  }[]
  status: 'draft' | 'running' | 'paused' | 'completed'
  startDate: number
  endDate?: number
  targetMetric: string
}

export interface UserVariant {
  testId: string
  variantId: string
  assignedAt: number
}

// Funnel analysis
export interface FunnelStep {
  id: string
  name: string
  description: string
  order: number
}

export interface FunnelAnalysis {
  id: string
  name: string
  steps: FunnelStep[]
  conversions: {
    stepId: string
    users: number
    conversionRate: number
  }[]
  timeframe: {
    start: number
    end: number
  }
}

interface AnalyticsState {
  // Session tracking
  currentSession: UserSession | null
  events: AnalyticsEvent[]
  
  // A/B Testing
  activeTests: ABTest[]
  userVariants: UserVariant[]
  
  // Metrics
  metrics: {
    dau: number // Daily Active Users
    mau: number // Monthly Active Users
    retention: {
      day1: number
      day7: number
      day30: number
    }
    conversion: {
      onboarding: number
      firstActivity: number
      firstPurchase: number
    }
  }
  
  // Actions
  startSession: (userId?: string) => void
  endSession: () => void
  trackEvent: (event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>) => void
  trackPageView: (page: string) => void
  
  // A/B Testing
  getVariant: (testId: string) => string | null
  assignVariant: (testId: string) => string
  
  // Metrics
  updateMetrics: () => void
  
  // Funnels
  trackFunnelStep: (funnelId: string, stepId: string) => void
}

// Device detection
function getDeviceInfo() {
  const userAgent = navigator.userAgent
  
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile'
  }
  
  let os = 'Unknown'
  if (/Windows/.test(userAgent)) os = 'Windows'
  else if (/Mac/.test(userAgent)) os = 'macOS'
  else if (/Linux/.test(userAgent)) os = 'Linux'
  else if (/Android/.test(userAgent)) os = 'Android'
  else if (/iPhone|iPad/.test(userAgent)) os = 'iOS'
  
  let browser = 'Unknown'
  if (/Chrome/.test(userAgent)) browser = 'Chrome'
  else if (/Firefox/.test(userAgent)) browser = 'Firefox'
  else if (/Safari/.test(userAgent)) browser = 'Safari'
  else if (/Edge/.test(userAgent)) browser = 'Edge'
  
  return { type: deviceType, os, browser }
}

// Session ID generation
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Event ID generation
function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      events: [],
      activeTests: [
        {
          id: 'onboarding_flow_v2',
          name: 'Onboarding Flow V2',
          variants: [
            { id: 'control', name: 'Original', weight: 50, config: { version: 'v1' } },
            { id: 'gamified', name: 'Gamified', weight: 50, config: { version: 'v2', showBonuses: true } },
          ],
          status: 'running',
          startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
          targetMetric: 'onboarding_completion',
        },
        {
          id: 'marketplace_layout',
          name: 'Marketplace Layout',
          variants: [
            { id: 'grid', name: 'Grid Layout', weight: 33, config: { layout: 'grid' } },
            { id: 'list', name: 'List Layout', weight: 33, config: { layout: 'list' } },
            { id: 'cards', name: 'Card Layout', weight: 34, config: { layout: 'cards' } },
          ],
          status: 'running',
          startDate: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
          targetMetric: 'purchase_conversion',
        },
      ],
      userVariants: [],
      metrics: {
        dau: 0,
        mau: 0,
        retention: { day1: 0, day7: 0, day30: 0 },
        conversion: { onboarding: 0, firstActivity: 0, firstPurchase: 0 },
      },

      startSession: (userId) => {
        const session: UserSession = {
          id: generateSessionId(),
          userId,
          startTime: Date.now(),
          pageViews: [],
          events: [],
          device: getDeviceInfo(),
        }
        
        set({ currentSession: session })
        
        // Track session start event
        get().trackEvent({
          type: 'system_event',
          category: 'session',
          action: 'start',
          properties: {
            device: session.device,
            userId,
          },
        })
      },

      endSession: () => {
        const state = get()
        if (!state.currentSession) return
        
        const endTime = Date.now()
        const duration = endTime - state.currentSession.startTime
        
        // Track session end event
        state.trackEvent({
          type: 'system_event',
          category: 'session',
          action: 'end',
          value: duration,
          properties: {
            pageViews: state.currentSession.pageViews.length,
            events: state.currentSession.events.length,
          },
        })
        
        set((state) => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            endTime,
          } : null,
        }))
      },

      trackEvent: (eventData) => {
        const state = get()
        if (!state.currentSession) return
        
        const event: AnalyticsEvent = {
          ...eventData,
          id: generateEventId(),
          timestamp: Date.now(),
          sessionId: state.currentSession.id,
          userId: state.currentSession.userId,
        }
        
        set((state) => ({
          events: [event, ...state.events.slice(0, 999)], // Keep last 1000 events
          currentSession: state.currentSession ? {
            ...state.currentSession,
            events: [...state.currentSession.events, event.id],
          } : null,
        }))
        
        // Send to analytics service (in production)
        if (typeof window !== 'undefined') {
          // Google Analytics 4
          if (window.gtag) {
            window.gtag('event', event.action, {
              event_category: event.category,
              event_label: event.label,
              value: event.value,
              custom_parameters: event.properties,
            })
          }
          
          // Custom analytics endpoint
          fetch('/api/analytics/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          }).catch(console.error)
        }
      },

      trackPageView: (page) => {
        const state = get()
        if (!state.currentSession) return
        
        set((state) => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            pageViews: [...state.currentSession.pageViews, page],
          } : null,
        }))
        
        state.trackEvent({
          type: 'user_action',
          category: 'navigation',
          action: 'page_view',
          label: page,
        })
      },

      getVariant: (testId) => {
        const state = get()
        const userVariant = state.userVariants.find(v => v.testId === testId)
        return userVariant?.variantId || null
      },

      assignVariant: (testId) => {
        const state = get()
        
        // Check if user already has a variant
        const existingVariant = state.userVariants.find(v => v.testId === testId)
        if (existingVariant) return existingVariant.variantId
        
        // Find the test
        const test = state.activeTests.find(t => t.id === testId)
        if (!test || test.status !== 'running') return 'control'
        
        // Assign variant based on weights
        const random = Math.random() * 100
        let cumulative = 0
        
        for (const variant of test.variants) {
          cumulative += variant.weight
          if (random <= cumulative) {
            const userVariant: UserVariant = {
              testId,
              variantId: variant.id,
              assignedAt: Date.now(),
            }
            
            set((state) => ({
              userVariants: [...state.userVariants, userVariant],
            }))
            
            // Track variant assignment
            state.trackEvent({
              type: 'system_event',
              category: 'ab_test',
              action: 'variant_assigned',
              label: `${testId}:${variant.id}`,
              properties: {
                testId,
                variantId: variant.id,
                variantName: variant.name,
              },
            })
            
            return variant.id
          }
        }
        
        return 'control'
      },

      updateMetrics: () => {
        // In production, this would fetch from analytics API
        // For demo, we'll simulate some metrics
        set((state) => ({
          metrics: {
            dau: Math.floor(Math.random() * 1000) + 500,
            mau: Math.floor(Math.random() * 10000) + 5000,
            retention: {
              day1: Math.random() * 0.3 + 0.6, // 60-90%
              day7: Math.random() * 0.2 + 0.3, // 30-50%
              day30: Math.random() * 0.1 + 0.1, // 10-20%
            },
            conversion: {
              onboarding: Math.random() * 0.2 + 0.7, // 70-90%
              firstActivity: Math.random() * 0.3 + 0.4, // 40-70%
              firstPurchase: Math.random() * 0.1 + 0.05, // 5-15%
            },
          },
        }))
      },

      trackFunnelStep: (funnelId, stepId) => {
        const state = get()
        state.trackEvent({
          type: 'business_metric',
          category: 'funnel',
          action: 'step_completed',
          label: `${funnelId}:${stepId}`,
          properties: {
            funnelId,
            stepId,
          },
        })
      },
    }),
    {
      name: 'fusetech-analytics',
      partialize: (state) => ({
        userVariants: state.userVariants,
        metrics: state.metrics,
      }),
    }
  )
)

// Auto-start session on load
if (typeof window !== 'undefined') {
  const analytics = useAnalyticsStore.getState()
  if (!analytics.currentSession) {
    analytics.startSession()
  }
  
  // Track page unload
  window.addEventListener('beforeunload', () => {
    analytics.endSession()
  })
}
