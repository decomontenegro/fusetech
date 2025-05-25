/**
 * Tipos específicos da aplicação web
 * Este arquivo também serve para reexportar tipos dos pacotes compartilhados
 */

// Reexportamos tipos dos pacotes compartilhados
export * from '@fuseapp/types';

// Definição do contexto de aplicação
export interface AppContext {
  isAuthenticated: boolean;
  user: User | null;
  theme: 'light' | 'dark' | 'system';
}

// Interface User simplificada para quando não podemos importar de @fuseapp/types
export interface User {
  id: string;
  email: string;
  name?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
}

// Interface para o DesafioCard
export interface Desafio {
  id: string;
  title: string;
  description: string;
  type: 'distance' | 'count' | 'duration';
  targetValue: number;
  status: 'active' | 'completed' | 'upcoming';
  startDate: Date;
  endDate: Date;
  progress?: number;
  categories: string[];
  participants: number;
  reward: {
    points: number;
    tokens: number;
  };
}

// Enums que podem ser usados caso não consigamos importar de @fuseapp/types
export enum ActivityType {
  RUN = 'run',
  WALK = 'walk',
  CYCLE = 'cycle',
  SOCIAL_POST = 'social_post',
  OTHER = 'other'
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  UPCOMING = 'upcoming'
}

// Tipos específicos para API responses da aplicação web
export interface WebApiResponse<T> {
  data: T;
  status: number;
  message: string;
} 