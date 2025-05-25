import apiService, { PaginatedResponse } from './api';

// Tipos
export enum ActivityType {
  RUN = 'run',
  RIDE = 'ride',
  SWIM = 'swim',
  WALK = 'walk',
  HIKE = 'hike',
  WORKOUT = 'workout',
  OTHER = 'other',
}

export enum ActivitySource {
  STRAVA = 'strava',
  MANUAL = 'manual',
  GARMIN = 'garmin',
  FITBIT = 'fitbit',
  APPLE = 'apple',
  OTHER = 'other',
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  distance?: number; // em metros
  duration: number; // em segundos
  startDate: string;
  endDate?: string;
  source: ActivitySource;
  sourceId?: string;
  points: number;
  isVerified: boolean;
  polyline?: string;
  calories?: number;
  elevationGain?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateActivityData {
  type: ActivityType;
  title: string;
  description?: string;
  distance?: number;
  duration: number;
  startDate: string;
  endDate?: string;
  calories?: number;
  elevationGain?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
}

// Serviço de atividades
export class ActivityService {
  // Obter lista de atividades
  async getActivities(
    limit: number = 10,
    offset: number = 0,
    type?: ActivityType,
    source?: ActivitySource
  ): Promise<PaginatedResponse<Activity>> {
    return apiService.get<PaginatedResponse<Activity>>('/api/activities', {
      params: { limit, offset, type, source },
    });
  }

  // Obter detalhes de uma atividade
  async getActivity(activityId: string): Promise<Activity> {
    return apiService.get<Activity>(`/api/activities/${activityId}`);
  }

  // Criar atividade manual
  async createActivity(data: CreateActivityData): Promise<Activity> {
    return apiService.post<Activity>('/api/activities', data);
  }

  // Obter estatísticas de atividades
  async getStats(): Promise<{
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
    totalPoints: number;
    activitiesByType: Record<ActivityType, number>;
  }> {
    return apiService.get<{
      totalActivities: number;
      totalDistance: number;
      totalDuration: number;
      totalPoints: number;
      activitiesByType: Record<ActivityType, number>;
    }>('/api/activities/stats');
  }
}

// Instância única do serviço
export const activityService = new ActivityService();

export default activityService;
