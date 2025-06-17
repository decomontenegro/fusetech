/**
 * FUSEtech Lite - Simplified Strava Sync Service
 * 
 * Focuses on core activity syncing without complex webhook management
 * Simple approach: Fetch recent activities and calculate tokens
 */

import { SimpleActivity, SimpleTokenCalculator } from '../tokens/simple-calculator';

// Strava API configuration
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

// Simplified Strava activity interface
interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  achievement_count?: number;
  kudos_count?: number;
  comment_count?: number;
  athlete_count?: number;
  photo_count?: number;
  trainer?: boolean;
  commute?: boolean;
  manual?: boolean;
  private?: boolean;
  flagged?: boolean;
  gear_id?: string;
  average_speed?: number;
  max_speed?: number;
  has_heartrate?: boolean;
  heartrate_opt_out?: boolean;
  display_hide_heartrate_option?: boolean;
  elev_high?: number;
  elev_low?: number;
  total_elevation_gain?: number;
  pr_count?: number;
  total_photo_count?: number;
  has_kudoed?: boolean;
}

// Sync result interface
export interface SyncResult {
  success: boolean;
  activitiesSynced: number;
  tokensEarned: number;
  newActivities: SimpleActivity[];
  errors: string[];
  lastSyncAt: Date;
}

/**
 * Fetch recent activities from Strava
 */
export async function fetchStravaActivities(
  accessToken: string,
  page: number = 1,
  perPage: number = 30
): Promise<StravaActivity[]> {
  try {
    const url = new URL(`${STRAVA_API_BASE}/athlete/activities`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('per_page', perPage.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Strava access token expired');
      }
      throw new Error(`Strava API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    throw error;
  }
}

/**
 * Convert Strava activity to SimpleActivity format
 */
export function convertStravaActivity(stravaActivity: StravaActivity): SimpleActivity {
  return {
    id: `strava_${stravaActivity.id}`,
    stravaId: stravaActivity.id,
    type: stravaActivity.type,
    name: stravaActivity.name,
    distanceMeters: stravaActivity.distance,
    movingTimeSeconds: stravaActivity.moving_time,
    startDate: new Date(stravaActivity.start_date)
  };
}

/**
 * Sync user activities from Strava
 */
export async function syncUserActivities(
  userId: string,
  accessToken: string,
  lastSyncDate?: Date
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    activitiesSynced: 0,
    tokensEarned: 0,
    newActivities: [],
    errors: [],
    lastSyncAt: new Date()
  };

  try {
    // Fetch activities from Strava
    const stravaActivities = await fetchStravaActivities(accessToken);
    
    // Filter activities since last sync
    const filteredActivities = lastSyncDate 
      ? stravaActivities.filter(activity => 
          new Date(activity.start_date) > lastSyncDate
        )
      : stravaActivities;

    // Convert to SimpleActivity format
    const newActivities = filteredActivities.map(convertStravaActivity);

    // Calculate tokens for each activity
    const calculations = newActivities.map(activity => ({
      activity,
      tokens: SimpleTokenCalculator.calculate(activity)
    }));

    // TODO: Save activities to database
    // In a real implementation, you would:
    // 1. Check if activity already exists
    // 2. Save new activities to database
    // 3. Create transaction records
    // 4. Update user token balance

    // For now, simulate the process
    const totalTokens = calculations.reduce(
      (sum, calc) => sum + calc.tokens.finalTokens, 
      0
    );

    result.success = true;
    result.activitiesSynced = newActivities.length;
    result.tokensEarned = Math.round(totalTokens * 100) / 100;
    result.newActivities = newActivities;

    console.log(`Synced ${newActivities.length} activities for user ${userId}`);
    console.log(`Total tokens earned: ${result.tokensEarned}`);

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    console.error('Sync failed:', error);
  }

  return result;
}

/**
 * Get activity summary for user dashboard
 */
export async function getActivitySummary(
  accessToken: string,
  days: number = 30
): Promise<{
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
  averagePace: number;
  activityTypes: Record<string, number>;
  recentActivities: SimpleActivity[];
}> {
  try {
    const stravaActivities = await fetchStravaActivities(accessToken, 1, 50);
    
    // Filter activities from last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentStravaActivities = stravaActivities.filter(activity =>
      new Date(activity.start_date) >= cutoffDate
    );

    const recentActivities = recentStravaActivities.map(convertStravaActivity);
    
    // Calculate summary statistics
    const totalDistance = recentActivities.reduce(
      (sum, activity) => sum + activity.distanceMeters, 
      0
    ) / 1000; // Convert to km

    const totalTime = recentActivities.reduce(
      (sum, activity) => sum + activity.movingTimeSeconds, 
      0
    ) / 3600; // Convert to hours

    const averagePace = totalDistance > 0 ? totalTime / totalDistance : 0;

    // Count activity types
    const activityTypes: Record<string, number> = {};
    recentActivities.forEach(activity => {
      activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
    });

    return {
      totalActivities: recentActivities.length,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalTime: Math.round(totalTime * 100) / 100,
      averagePace: Math.round(averagePace * 100) / 100,
      activityTypes,
      recentActivities: recentActivities.slice(0, 10) // Last 10 activities
    };

  } catch (error) {
    console.error('Error getting activity summary:', error);
    throw error;
  }
}

/**
 * Validate Strava access token
 */
export async function validateStravaToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Error validating Strava token:', error);
    return false;
  }
}

/**
 * Get athlete information from Strava
 */
export async function getStravaAthlete(accessToken: string): Promise<{
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: string;
  updated_at: string;
}> {
  try {
    const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch athlete: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Strava athlete:', error);
    throw error;
  }
}

/**
 * Schedule automatic sync for user
 */
export async function scheduleAutoSync(userId: string): Promise<void> {
  // In a real implementation, this would:
  // 1. Add user to sync queue
  // 2. Set up periodic sync job
  // 3. Handle sync failures and retries
  
  console.log(`Scheduled auto-sync for user ${userId}`);
  
  // TODO: Implement with your job queue system
  // Example: Bull Queue, Agenda, or simple cron job
}

/**
 * Manual sync trigger for user
 */
export async function triggerManualSync(
  userId: string, 
  accessToken: string
): Promise<SyncResult> {
  console.log(`Manual sync triggered for user ${userId}`);
  
  // Get last sync date from database
  // const lastSync = await getUserLastSync(userId);
  
  return await syncUserActivities(userId, accessToken);
}

// Export simplified Strava service
export const SimpleStravaSync = {
  fetchActivities: fetchStravaActivities,
  convertActivity: convertStravaActivity,
  syncUser: syncUserActivities,
  getSummary: getActivitySummary,
  validateToken: validateStravaToken,
  getAthlete: getStravaAthlete,
  scheduleAutoSync,
  triggerManualSync
};
