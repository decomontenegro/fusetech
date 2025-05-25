import { Activity } from '@/stores/gameStore'

export interface StravaActivity {
  id: number
  name: string
  type: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  calories?: number
  average_speed: number
  max_speed: number
}

export interface StravaAthlete {
  id: number
  firstname: string
  lastname: string
  profile_medium: string
  profile: string
  city: string
  state: string
  country: string
}

class StravaAPI {
  private clientId: string
  private clientSecret: string
  private redirectUri: string

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || ''
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET || ''
    this.redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/strava/callback`
  }

  // Get authorization URL
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read,activity:read_all',
      approval_prompt: 'force',
      ...(state && { state }),
    })

    return `https://www.strava.com/oauth/authorize?${params.toString()}`
  }

  // Exchange code for access token
  async exchangeToken(code: string): Promise<{
    access_token: string
    refresh_token: string
    expires_at: number
    athlete: StravaAthlete
  }> {
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
    })

    if (!response.ok) {
      throw new Error('Failed to exchange Strava token')
    }

    return response.json()
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{
    access_token: string
    refresh_token: string
    expires_at: number
  }> {
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
    })

    if (!response.ok) {
      throw new Error('Failed to refresh Strava token')
    }

    return response.json()
  }

  // Get athlete activities
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
      ...(before && { before: before.toString() }),
    })

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Strava activities')
    }

    return response.json()
  }

  // Get specific activity
  async getActivity(accessToken: string, activityId: number): Promise<StravaActivity> {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Strava activity')
    }

    return response.json()
  }

  // Convert Strava activity to our Activity format
  convertToActivity(stravaActivity: StravaActivity): Omit<Activity, 'id' | 'timestamp' | 'fuseEarned' | 'multiplier'> {
    const activityTypeMap: Record<string, Activity['type']> = {
      'Run': 'running',
      'Ride': 'cycling',
      'Walk': 'walking',
      'Swim': 'swimming',
      'WeightTraining': 'gym',
      'Workout': 'gym',
    }

    return {
      type: activityTypeMap[stravaActivity.type] || 'other',
      distance: stravaActivity.distance / 1000, // Convert meters to km
      duration: stravaActivity.moving_time, // Duration in seconds
      calories: stravaActivity.calories,
      source: 'strava',
    }
  }

  // Setup webhook subscription
  async createWebhookSubscription(callbackUrl: string, verifyToken: string): Promise<void> {
    const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        callback_url: callbackUrl,
        verify_token: verifyToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create Strava webhook subscription')
    }
  }

  // Verify webhook challenge
  verifyWebhook(challenge: string, verifyToken: string, mode: string): string | null {
    const expectedToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
    
    if (mode === 'subscribe' && verifyToken === expectedToken) {
      return challenge
    }
    
    return null
  }
}

export const stravaAPI = new StravaAPI()

// Webhook event types
export interface StravaWebhookEvent {
  object_type: 'activity' | 'athlete'
  object_id: number
  aspect_type: 'create' | 'update' | 'delete'
  updates: Record<string, any>
  owner_id: number
  subscription_id: number
  event_time: number
}

// Process webhook events
export async function processStravaWebhook(event: StravaWebhookEvent, accessToken: string) {
  if (event.object_type === 'activity' && event.aspect_type === 'create') {
    try {
      // Fetch the new activity
      const activity = await stravaAPI.getActivity(accessToken, event.object_id)
      
      // Convert to our format
      const convertedActivity = stravaAPI.convertToActivity(activity)
      
      // Add to user's activities (this would be done via API call to your backend)
      console.log('New Strava activity:', convertedActivity)
      
      return convertedActivity
    } catch (error) {
      console.error('Error processing Strava webhook:', error)
      throw error
    }
  }
}
