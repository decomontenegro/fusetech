/**
 * Integração com Strava API
 * Handles OAuth flow, activity sync, and webhook processing
 */

import crypto from 'crypto';

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  calories?: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
}

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  summit: boolean;
  created_at: string;
  updated_at: string;
  profile_medium: string;
  profile: string;
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
}

class StravaService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly baseUrl = 'https://www.strava.com/api/v3';

  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID || '';
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET || '';
    this.redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/strava/callback`;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read,activity:read_all,profile:read_all',
      ...(state && { state })
    });

    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(code: string): Promise<StravaTokens & { athlete: StravaAthlete }> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Strava token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<StravaTokens> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Strava token refresh failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get athlete activities
   */
  async getActivities(
    accessToken: string,
    page = 1,
    perPage = 30,
    after?: number,
    before?: number
  ): Promise<StravaActivity[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(after && { after: after.toString() }),
      ...(before && { before: before.toString() })
    });

    const response = await fetch(`${this.baseUrl}/athlete/activities?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Strava activities: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get detailed activity
   */
  async getActivity(accessToken: string, activityId: number): Promise<StravaActivity> {
    const response = await fetch(`${this.baseUrl}/activities/${activityId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Strava activity: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get athlete profile
   */
  async getAthlete(accessToken: string): Promise<StravaAthlete> {
    const response = await fetch(`${this.baseUrl}/athlete`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Strava athlete: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Calculate FUSE tokens for activity
   */
  calculateTokensForActivity(activity: StravaActivity): number {
    const { type, distance, moving_time } = activity;
    
    // Base multipliers per activity type (tokens per km)
    const multipliers: Record<string, number> = {
      'Run': 5,
      'Ride': 2,
      'Walk': 3,
      'Swim': 8,
      'Hike': 4,
      'VirtualRun': 4,
      'VirtualRide': 1.5,
      'Workout': 3,
      'WeightTraining': 2,
      'Yoga': 2,
    };

    const multiplier = multipliers[type] || 1;
    const distanceKm = distance / 1000; // Convert meters to km
    const baseTokens = distanceKm * multiplier;

    // Performance bonus (if pace is good)
    let performanceBonus = 0;
    if (type === 'Run' && moving_time > 0) {
      const paceMinPerKm = (moving_time / 60) / distanceKm;
      if (paceMinPerKm < 6) { // Sub 6-minute pace
        performanceBonus = baseTokens * 0.2;
      }
    }

    // Minimum 1 token for any activity
    return Math.max(1, Math.round(baseTokens + performanceBonus));
  }

  /**
   * Verify webhook signature using HMAC
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || '';
    
    // Create HMAC signature
    const hmac = crypto.createHmac('sha256', verifyToken);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(calculatedSignature, 'hex')
      );
    } catch (error) {
      // If signatures are different lengths or invalid hex, return false
      return false;
    }
  }

  /**
   * Validate webhook subscription (for initial setup)
   */
  validateWebhookSubscription(mode: string, token: string, challenge: string): { valid: boolean; challenge?: string } {
    const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || '';
    
    if (mode === 'subscribe' && token === verifyToken) {
      return { valid: true, challenge };
    }
    
    return { valid: false };
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: any): Promise<void> {
    const { object_type, aspect_type, object_id, owner_id } = event;

    if (object_type === 'activity' && aspect_type === 'create') {
      // New activity created - process it
      console.log(`New Strava activity created: ${object_id} for athlete ${owner_id}`);
      
      // Here you would:
      // 1. Get user's access token from database
      // 2. Fetch activity details
      // 3. Calculate FUSE tokens
      // 4. Update user's balance
      // 5. Send notification
    }
  }
}

export const stravaService = new StravaService();
