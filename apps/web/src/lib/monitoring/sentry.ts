import * as Sentry from '@sentry/nextjs'

// Sentry configuration
export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      const error = hint.originalException
      
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string
        
        // Ignore network errors
        if (message.includes('Network Error') || message.includes('fetch')) {
          return null
        }
        
        // Ignore wallet connection errors (user cancelled)
        if (message.includes('User rejected') || message.includes('User denied')) {
          return null
        }
      }
      
      return event
    },
    
    // Additional context
    initialScope: {
      tags: {
        component: 'fusetech-web',
      },
    },
  })
}

// Custom error tracking
export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional_info', context)
    }
    Sentry.captureException(error)
  })
}

// Performance tracking
export function trackPerformance(name: string, duration: number, tags?: Record<string, string>) {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name} took ${duration}ms`,
    level: 'info',
    data: {
      duration,
      ...tags,
    },
  })
}

// User context
export function setUserContext(user: {
  id: string
  email?: string
  username?: string
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

// Custom breadcrumbs
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  })
}

// Transaction tracking
export function startTransaction(name: string, operation: string) {
  return Sentry.startTransaction({
    name,
    op: operation,
  })
}

// API error tracking
export function trackAPIError(
  endpoint: string,
  method: string,
  statusCode: number,
  error: Error
) {
  Sentry.withScope((scope) => {
    scope.setTag('api_endpoint', endpoint)
    scope.setTag('http_method', method)
    scope.setTag('status_code', statusCode.toString())
    scope.setContext('api_request', {
      endpoint,
      method,
      statusCode,
    })
    Sentry.captureException(error)
  })
}

// Blockchain error tracking
export function trackBlockchainError(
  operation: string,
  network: string,
  error: Error,
  transactionHash?: string
) {
  Sentry.withScope((scope) => {
    scope.setTag('blockchain_operation', operation)
    scope.setTag('blockchain_network', network)
    scope.setContext('blockchain_context', {
      operation,
      network,
      transactionHash,
    })
    Sentry.captureException(error)
  })
}

// Integration error tracking
export function trackIntegrationError(
  service: 'strava' | 'apple-health' | 'google-fit',
  operation: string,
  error: Error
) {
  Sentry.withScope((scope) => {
    scope.setTag('integration_service', service)
    scope.setTag('integration_operation', operation)
    scope.setContext('integration_context', {
      service,
      operation,
    })
    Sentry.captureException(error)
  })
}
