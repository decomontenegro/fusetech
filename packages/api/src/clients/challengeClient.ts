import axios from 'axios';
import { Challenge, ActivityType, ChallengeStatus } from '@fuseapp/types';
import { apiConfig } from '../utils/apiConfig';
import { ApiError } from '../utils/apiErrors';

// Interfaces para as requisições
export interface ListChallengesParams {
  userId?: string;
  status?: ChallengeStatus;
  activityType?: ActivityType;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ListChallengesResponse {
  challenges: Challenge[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChallengeJoinResponse {
  success: boolean;
  challengeId: string;
  joinedAt: string;
}

export interface ChallengeCreationParams {
  title: string;
  description: string;
  type: string;
  targetValue: number;
  startDate: Date | string;
  endDate: Date | string;
  activityType: ActivityType;
  categories?: string[];
  rewardPoints: number;
  rewardTokens: number;
  coverImage?: string;
  rules?: string;
}

// Cliente para o serviço de desafios
export class ChallengeClient {
  private client;
  
  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseUrls.challenge,
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
   * Busca os desafios com base nos parâmetros
   */
  async listChallenges(params: ListChallengesParams): Promise<ListChallengesResponse> {
    const { data } = await this.client.get('/challenges', { params });
    return data as ListChallengesResponse;
  }
  
  /**
   * Busca um desafio específico
   */
  async getChallenge(challengeId: string): Promise<Challenge> {
    const { data } = await this.client.get(`/challenges/${challengeId}`);
    return data as Challenge;
  }
  
  /**
   * Participa de um desafio
   */
  async joinChallenge(userId: string, challengeId: string): Promise<ChallengeJoinResponse> {
    const { data } = await this.client.post(`/challenges/${challengeId}/join`, { userId });
    return data as ChallengeJoinResponse;
  }
  
  /**
   * Sai de um desafio
   */
  async leaveChallenge(userId: string, challengeId: string): Promise<{ success: boolean }> {
    const { data } = await this.client.post(`/challenges/${challengeId}/leave`, { userId });
    return data as { success: boolean };
  }
  
  /**
   * Cria um novo desafio
   */
  async createChallenge(params: ChallengeCreationParams): Promise<Challenge> {
    const { data } = await this.client.post('/challenges', params);
    return data as Challenge;
  }
  
  /**
   * Busca o progresso do usuário em um desafio
   */
  async getChallengeProgress(userId: string, challengeId: string): Promise<{ progress: number; completed: boolean }> {
    const { data } = await this.client.get(`/challenges/${challengeId}/progress?userId=${userId}`);
    return data as { progress: number; completed: boolean };
  }
}

// Instância singleton para uso em toda a aplicação
export const challengeClient = new ChallengeClient(); 