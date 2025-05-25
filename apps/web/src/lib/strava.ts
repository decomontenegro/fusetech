import { createSupabaseBrowserClient } from './supabase'
import { tokenService } from './tokens'

export interface StravaActivity {
  id: number
  name: string
  type: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  start_date_local: string
}

export interface StravaTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

export class StravaService {
  private supabase = createSupabaseBrowserClient()
  private clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!
  private clientSecret = process.env.STRAVA_CLIENT_SECRET!
  private redirectUri = process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI!

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'read,activity:read_all',
      approval_prompt: 'force',
    })

    return `https://www.strava.com/oauth/authorize?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string): Promise<StravaTokens> {
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
      throw new Error('Failed to exchange code for tokens')
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    }
  }

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
    })

    if (!response.ok) {
      throw new Error('Failed to refresh access token')
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    }
  }

  async getActivities(accessToken: string, page: number = 1, perPage: number = 30): Promise<StravaActivity[]> {
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch activities')
    }

    return response.json()
  }

  async saveUserTokens(userId: string, tokens: StravaTokens, stravaId: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({
        strava_id: stravaId.toString(),
        strava_access_token: tokens.access_token,
        strava_refresh_token: tokens.refresh_token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
  }

  async syncActivities(userId: string): Promise<number> {
    // Get user's Strava tokens
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('strava_access_token, strava_refresh_token')
      .eq('id', userId)
      .single()

    if (userError || !user.strava_access_token) {
      throw new Error('User not connected to Strava')
    }

    // Get existing activities to avoid duplicates
    const { data: existingActivities } = await this.supabase
      .from('activities')
      .select('strava_id')
      .eq('user_id', userId)

    const existingStravaIds = new Set(existingActivities?.map(a => a.strava_id) || [])

    // Fetch recent activities from Strava
    const stravaActivities = await this.getActivities(user.strava_access_token)
    
    let newActivitiesCount = 0

    for (const activity of stravaActivities) {
      if (existingStravaIds.has(activity.id.toString())) {
        continue // Skip existing activities
      }

      // Calculate tokens for this activity
      const tokensEarned = tokenService.calculateActivityTokens(activity.distance, activity.type)

      // Save activity to database
      const { error: activityError } = await this.supabase
        .from('activities')
        .insert({
          user_id: userId,
          strava_id: activity.id.toString(),
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          moving_time: activity.moving_time,
          elapsed_time: activity.elapsed_time,
          total_elevation_gain: activity.total_elevation_gain,
          start_date: activity.start_date,
          tokens_earned: tokensEarned,
        })

      if (activityError) {
        console.error('Error saving activity:', activityError)
        continue
      }

      // Award tokens to user
      await tokenService.addTokens(userId, tokensEarned, 'activity', {
        activity_id: activity.id,
        activity_name: activity.name,
        distance: activity.distance,
        type: activity.type,
      })

      newActivitiesCount++
    }

    return newActivitiesCount
  }

  async getUserActivities(userId: string, limit: number = 20) {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}

export const stravaService = new StravaService()
