import { z } from 'zod'
import { createHash, randomBytes } from 'crypto'

// Input validation schemas
export const userProfileSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-Z\s]+$/, 'Nome deve conter apenas letras'),
  email: z.string().email('Email inválido'),
  goal: z.enum(['weight-loss', 'muscle-gain', 'endurance', 'general']),
  frequency: z.enum(['1-2', '3-4', '5-6', 'daily']),
})

export const activitySchema = z.object({
  type: z.enum(['running', 'cycling', 'walking', 'gym', 'swimming', 'other']),
  distance: z.number().min(0).max(1000).optional(),
  duration: z.number().min(1).max(86400), // 1 second to 24 hours
  calories: z.number().min(0).max(10000).optional(),
  source: z.enum(['manual', 'strava', 'apple-health', 'google-fit']),
})

export const transactionSchema = z.object({
  amount: z.number().min(0.01).max(1000000),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Endereço Ethereum inválido'),
  type: z.enum(['reward', 'purchase', 'transfer', 'stake']),
})

// Rate limiting
interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.limits.get(key)
    
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (entry.count >= maxRequests) {
      return false
    }
    
    entry.count++
    return true
  }
  
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// Data sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T]
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value
    }
  }
  
  return sanitized
}

// Encryption utilities
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || randomBytes(32).toString('hex')
  const hash = createHash('sha256')
    .update(password + actualSalt)
    .digest('hex')
  
  return { hash, salt: actualSalt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt)
  return computedHash === hash
}

// GDPR compliance utilities
export interface DataProcessingConsent {
  analytics: boolean
  marketing: boolean
  necessary: boolean
  timestamp: number
  version: string
}

export function createConsentRecord(consents: Omit<DataProcessingConsent, 'timestamp' | 'version'>): DataProcessingConsent {
  return {
    ...consents,
    timestamp: Date.now(),
    version: '1.0',
  }
}

export function isConsentValid(consent: DataProcessingConsent, maxAgeMs: number = 365 * 24 * 60 * 60 * 1000): boolean {
  return Date.now() - consent.timestamp < maxAgeMs
}

// Health data compliance (HIPAA-like)
export interface HealthDataAccess {
  userId: string
  dataType: 'activity' | 'biometric' | 'medical'
  purpose: 'analytics' | 'personalization' | 'research'
  accessedAt: number
  accessedBy: string
}

export function logHealthDataAccess(access: HealthDataAccess): void {
  // In production, this would log to a secure audit system
  console.log('[HEALTH_DATA_ACCESS]', {
    ...access,
    timestamp: new Date().toISOString(),
  })
}

// Blockchain security
export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function validateTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

// API security middleware
export interface SecurityConfig {
  rateLimit: {
    maxRequests: number
    windowMs: number
  }
  requireAuth: boolean
  validateInput: boolean
  logAccess: boolean
}

export function createSecurityMiddleware(config: SecurityConfig) {
  return async (req: any, res: any, next: any) => {
    try {
      // Rate limiting
      if (config.rateLimit) {
        const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown'
        const isAllowed = rateLimiter.isAllowed(
          clientId,
          config.rateLimit.maxRequests,
          config.rateLimit.windowMs
        )
        
        if (!isAllowed) {
          return res.status(429).json({ error: 'Rate limit exceeded' })
        }
      }
      
      // Authentication check
      if (config.requireAuth) {
        const token = req.headers.authorization?.replace('Bearer ', '')
        if (!token) {
          return res.status(401).json({ error: 'Authentication required' })
        }
        
        // Validate JWT token here
        // const user = await validateJWT(token)
        // req.user = user
      }
      
      // Input validation
      if (config.validateInput && req.body) {
        req.body = sanitizeObject(req.body)
      }
      
      // Access logging
      if (config.logAccess) {
        console.log('[API_ACCESS]', {
          method: req.method,
          url: req.url,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString(),
        })
      }
      
      next()
    } catch (error) {
      console.error('[SECURITY_MIDDLEWARE_ERROR]', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// Clean up rate limiter periodically
setInterval(() => {
  rateLimiter.cleanup()
}, 60000) // Every minute
