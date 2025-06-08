import crypto from 'crypto';

/**
 * Strava Webhook Manager
 * Utilities for managing Strava webhook subscriptions
 */

export interface StravaWebhookSubscription {
  id: number;
  application_id: number;
  callback_url: string;
  created_at: string;
  updated_at: string;
}

export class StravaWebhookManager {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;
  private verifyToken: string;

  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID || '';
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET || '';
    this.callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/strava`;
    this.verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || '';

    if (!this.verifyToken) {
      // Generate a secure verify token if not set
      this.verifyToken = crypto.randomBytes(32).toString('hex');
      console.warn('STRAVA_WEBHOOK_VERIFY_TOKEN not set. Generated token:', this.verifyToken);
    }
  }

  /**
   * Create a new webhook subscription
   */
  async createSubscription(): Promise<StravaWebhookSubscription> {
    const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        callback_url: this.callbackUrl,
        verify_token: this.verifyToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create webhook subscription: ${error}`);
    }

    return response.json();
  }

  /**
   * View existing webhook subscriptions
   */
  async viewSubscriptions(): Promise<StravaWebhookSubscription[]> {
    const response = await fetch(
      `https://www.strava.com/api/v3/push_subscriptions?client_id=${this.clientId}&client_secret=${this.clientSecret}`
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to view webhook subscriptions: ${error}`);
    }

    return response.json();
  }

  /**
   * Delete a webhook subscription
   */
  async deleteSubscription(subscriptionId: number): Promise<void> {
    const response = await fetch(
      `https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}?client_id=${this.clientId}&client_secret=${this.clientSecret}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete webhook subscription: ${error}`);
    }
  }

  /**
   * Generate webhook signature for testing
   */
  generateTestSignature(payload: any): string {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', this.verifyToken);
    hmac.update(payloadString);
    return hmac.digest('hex');
  }

  /**
   * Create a test webhook event
   */
  createTestEvent(type: 'activity' | 'athlete' = 'activity'): {
    event: any;
    signature: string;
  } {
    const event = {
      object_type: type,
      object_id: Math.floor(Math.random() * 1000000),
      aspect_type: 'create',
      owner_id: Math.floor(Math.random() * 1000000),
      subscription_id: 12345,
      event_time: Math.floor(Date.now() / 1000),
      updates: {},
    };

    const signature = this.generateTestSignature(event);

    return { event, signature };
  }

  /**
   * Validate webhook configuration
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.clientId) {
      errors.push('STRAVA_CLIENT_ID is not set');
    }

    if (!this.clientSecret) {
      errors.push('STRAVA_CLIENT_SECRET is not set');
    }

    if (!this.verifyToken) {
      errors.push('STRAVA_WEBHOOK_VERIFY_TOKEN is not set');
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      errors.push('NEXT_PUBLIC_APP_URL is not set');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const stravaWebhookManager = new StravaWebhookManager();