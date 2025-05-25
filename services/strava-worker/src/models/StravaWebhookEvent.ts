/**
 * Interfaces para eventos de webhook do Strava
 */

export interface StravaWebhookEvent {
  object_type: 'activity' | 'athlete';
  object_id: number;
  aspect_type: 'create' | 'update' | 'delete';
  owner_id: number;
  subscription_id: number;
  event_time: number;
  updates?: Record<string, any>;
}

export interface StravaWebhookSubscription {
  id: number;
  resource_state: number;
  application_id: number;
  callback_url: string;
  created_at: string;
  updated_at: string;
}

export interface StravaWebhookChallenge {
  hub_mode: string;
  hub_verify_token: string;
  hub_challenge: string;
}

export interface StravaActivity {
  id: number;
  athlete: {
    id: number;
    resource_state: number;
  };
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type: number | null;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  map: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  start_latitude?: number;
  start_longitude?: number;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gear_id?: string;
  device_name?: string;
  upload_id?: number;
  upload_id_str?: string;
  external_id?: string;
  from_accepted_tag?: boolean;
  pr_count?: number;
  total_photo_count?: number;
  has_kudoed?: boolean;
} 