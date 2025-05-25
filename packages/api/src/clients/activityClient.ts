import axios from 'axios';
import { ActivityStatus, ActivityType, PhysicalActivity, SocialActivity } from '@fuseapp/types';
import { apiConfig } from '../utils/apiConfig';
import { ApiError } from '../utils/apiErrors';

// Interfaces para as requisições
export interface ListActivitiesParams {
  userId: string;
  status?: ActivityStatus;
  type?: ActivityType;
  limit?: number;
  offset?: number;
  fromDate?: Date | string;
  toDate?: Date | string;
}

export interface ActivityResponse {
  activities: (PhysicalActivity | SocialActivity)[];
  total: number;
  limit: number;
  offset: number;
}

export interface StravaConnectParams {
  code: string;
  userId: string;
}

export interface StravaConnectResponse {
  success: boolean;
  athleteId: string;
  expiresAt: number;
}

// Cliente para o serviço de atividades
export class ActivityClient {
  private client;
  
  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseUrls.activity,
      timeout: apiConfig.timeouts.default,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Interceptor para tratamento de erros
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        throw ApiError.fromAxiosError(error);
      }
    );
  }
  
  /**
   * Busca as atividades de um usuário
   */
  async listActivities(params: ListActivitiesParams): Promise<ActivityResponse> {
    const { data } = await this.client.get('/activities', { params });
    return data as ActivityResponse;
  }
  
  /**
   * Busca uma atividade específica
   */
  async getActivity(activityId: string): Promise<PhysicalActivity | SocialActivity> {
    const { data } = await this.client.get(`/activities/${activityId}`);
    return data as PhysicalActivity | SocialActivity;
  }
  
  /**
   * Conecta uma conta Strava
   */
  async connectStrava(params: StravaConnectParams): Promise<StravaConnectResponse> {
    const { data } = await this.client.post('/connect/strava', params);
    return data as StravaConnectResponse;
  }
  
  /**
   * Verifica o status da conexão Strava
   */
  async getStravaStatus(userId: string): Promise<{ connected: boolean; expiresAt?: number }> {
    const { data } = await this.client.get(`/connect/strava/status?userId=${userId}`);
    return data as { connected: boolean; expiresAt?: number };
  }
  
  /**
   * Desconecta a conta Strava
   */
  async disconnectStrava(userId: string): Promise<{ success: boolean }> {
    const { data } = await this.client.delete(`/connect/strava?userId=${userId}`);
    return data as { success: boolean };
  }
  
  /**
   * Conecta uma conta de rede social
   */
  async connectSocial(userId: string, platform: 'instagram' | 'tiktok', code: string): Promise<{ success: boolean }> {
    const { data } = await this.client.post(`/connect/${platform}`, {
      userId,
      code
    });
    return data as { success: boolean };
  }
  
  /**
   * Sincronia manual de atividades
   */
  async syncActivities(userId: string): Promise<{ success: boolean; synced: number }> {
    const { data } = await this.client.post('/sync', { userId });
    return data as { success: boolean; synced: number };
  }
}

// Instância singleton para uso em toda a aplicação
export const activityClient = new ActivityClient(); 