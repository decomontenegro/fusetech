import apiService, { PaginatedResponse } from './api';

// Tipos
export enum ChallengeType {
  DISTANCE = 'distance',
  ACTIVITY_COUNT = 'activity_count',
  SOCIAL_POSTS = 'social_posts',
  STREAK = 'streak',
}

export enum AchievementType {
  DISTANCE = 'distance',
  ACTIVITY_COUNT = 'activity_count',
  SOCIAL_POSTS = 'social_posts',
  STREAK = 'streak',
  LEVEL = 'level',
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  target: number;
  reward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  requiredLevel: number;
  metadata?: Record<string, any>;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  rewardClaimed: boolean;
  challenge: Challenge;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  threshold: number;
  reward: number;
  icon?: string;
  isSecret: boolean;
  metadata?: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  rewardClaimed: boolean;
  achievement: Achievement;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  rank: string;
  level: number;
  position?: number;
  totalUsers?: number;
}

// Serviço de gamificação
export class GamificationService {
  // Obter lista de desafios
  async getChallenges(
    limit: number = 10,
    offset: number = 0,
    status?: 'active' | 'completed' | 'upcoming'
  ): Promise<PaginatedResponse<Challenge>> {
    return apiService.get<PaginatedResponse<Challenge>>('/api/challenges', {
      params: { limit, offset, status },
    });
  }

  // Obter detalhes de um desafio
  async getChallenge(challengeId: string): Promise<Challenge> {
    return apiService.get<Challenge>(`/api/challenges/${challengeId}`);
  }

  // Obter desafios do usuário atual
  async getUserChallenges(
    limit: number = 10,
    offset: number = 0,
    status?: 'active' | 'completed'
  ): Promise<PaginatedResponse<UserChallenge>> {
    return apiService.get<PaginatedResponse<UserChallenge>>('/api/users/me/challenges', {
      params: { limit, offset, status },
    });
  }

  // Reivindicar recompensa de desafio
  async claimChallengeReward(challengeId: string): Promise<{ success: boolean; transactionId?: string }> {
    return apiService.post<{ success: boolean; transactionId?: string }>(
      `/api/users/me/challenges/${challengeId}/claim`
    );
  }

  // Obter lista de conquistas
  async getAchievements(): Promise<Achievement[]> {
    return apiService.get<Achievement[]>('/api/achievements');
  }

  // Obter conquistas do usuário atual
  async getUserAchievements(): Promise<UserAchievement[]> {
    return apiService.get<UserAchievement[]>('/api/users/me/achievements');
  }

  // Reivindicar recompensa de conquista
  async claimAchievementReward(achievementId: string): Promise<{ success: boolean; transactionId?: string }> {
    return apiService.post<{ success: boolean; transactionId?: string }>(
      `/api/users/me/achievements/${achievementId}/claim`
    );
  }

  // Obter leaderboard global
  async getLeaderboard(
    limit: number = 10,
    offset: number = 0,
    type: 'global' | 'friends' | 'city' | 'country' = 'global'
  ): Promise<PaginatedResponse<LeaderboardEntry>> {
    return apiService.get<PaginatedResponse<LeaderboardEntry>>('/api/leaderboard', {
      params: { limit, offset, type },
    });
  }

  // Obter posição do usuário atual no leaderboard
  async getUserRank(): Promise<LeaderboardEntry> {
    return apiService.get<LeaderboardEntry>('/api/leaderboard/users/me');
  }
}

// Instância única do serviço
export const gamificationService = new GamificationService();

export default gamificationService;
