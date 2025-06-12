import crypto from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Webhook security utilities
 */

export interface WebhookConfig {
  secret: string;
  headerName: string;
  algorithm?: string;
}

/**
 * Verify webhook signature using HMAC
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  try {
    // Remove any prefix from signature (e.g., 'sha256=')
    const signatureParts = signature.split('=');
    const actualSignature = signatureParts.length > 1 ? signatureParts[1] : signature;

    // Create HMAC
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(actualSignature, 'hex'),
      Buffer.from(calculatedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Extract raw body from request for signature verification
 */
export async function getRawBody(request: Request): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) {
    throw new Error('No request body');
  }

  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const bodyBuffer = Buffer.concat(chunks);
  return bodyBuffer.toString('utf-8');
}

/**
 * Webhook signature verification middleware
 */
export async function verifyWebhook(
  request: NextRequest,
  config: WebhookConfig
): Promise<{ valid: boolean; body?: any; error?: string }> {
  try {
    // Clone the request to read the body
    const clonedRequest = request.clone();
    const rawBody = await clonedRequest.text();
    
    // Get signature from headers
    const signature = request.headers.get(config.headerName);
    
    if (!signature) {
      return { valid: false, error: 'Missing signature header' };
    }

    // Verify signature
    const isValid = verifyWebhookSignature(
      rawBody,
      signature,
      config.secret,
      config.algorithm
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Parse body
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return { valid: false, error: 'Invalid JSON body' };
    }

    return { valid: true, body };
  } catch (error) {
    console.error('Webhook verification error:', error);
    return { valid: false, error: 'Verification failed' };
  }
}

/**
 * Rate limiting for webhooks
 */
export class WebhookRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [identifier, requests] of Array.from(this.requests.entries())) {
      const validRequests = requests.filter((time: number) => now - time < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

/**
 * Create webhook handler with built-in security
 */
export function createSecureWebhookHandler<T = any>(
  config: WebhookConfig,
  handler: (body: T, request: NextRequest) => Promise<Response>
) {
  return async function (request: NextRequest): Promise<Response> {
    // Verify webhook
    const verification = await verifyWebhook(request, config);
    
    if (!verification.valid) {
      return new Response(
        JSON.stringify({ error: verification.error }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Call handler with verified body
    try {
      return await handler(verification.body as T, request);
    } catch (error) {
      console.error('Webhook handler error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}