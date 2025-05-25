import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export interface EffortMetrics {
  absoluteEffort: number; // 0-100
  relativeEffort: number; // 0-100 (relativo à capacidade do usuário)
  perceivedExertion?: number; // 0-10 (escala de percepção de esforço)
  heartRateData?: {
    average: number;
    max: number;
    timeInZones?: Record<string, number>; // Minutos em cada zona
  };
  contextualFactors?: {
    terrain?: 'flat' | 'hilly' | 'mixed' | 'mountainous';
    weather?: 'normal' | 'hot' | 'cold' | 'rainy' | 'windy';
    altitude?: number; // metros
    sleep?: number; // horas
    recovery?: number; // 0-100
  };
}

export interface ActivityEffort {
  activityId: string;
  userId: string;
  effortMetrics: EffortMetrics;
  calculatedReward: number; // tokens calculados
  baseReward: number; // tokens base (sem multiplicador)
  effortMultiplier: number; // multiplicador baseado em esforço
  createdAt: string; // ISO string
}

export interface OpenAIPlanRequest {
  userId: string;
  profile: {
    fitnessLevel: string;
    primarySport: string;
    goals: string[];
    specificGoals?: string[];
    preferences: {
      preferredExercises: string[];
      preferredDayTime?: string;
      preferredDuration?: number;
      preferredFrequency?: number;
      outdoorPreference?: number;
    };
    healthMetrics?: {
      height?: number;
      weight?: number;
      restingHeartRate?: number;
      maxHeartRate?: number;
      limitations?: string[];
    };
    personalRecords?: {
      type: string;
      value: number;
      date: string;
    }[];
    experienceYears?: number;
  };
  planOptions: {
    duration: number; // em semanas
    goal: string;
    primaryType: string;
    targetValue?: number;
    targetUnit?: string;
  };
}

export interface OpenAIPlanResponse {
  title: string;
  description: string;
  level: string;
  primaryType: string;
  duration: number;
  goal: string;
  specificGoal?: string;
  schedule: {
    day: number;
    workouts: {
      title: string;
      description: string;
      type: string;
      duration: number;
      distance?: number;
      intensity: string;
      targetHeartRate?: {
        min: number;
        max: number;
      };
      instructions: string;
    }[];
  }[];
  progressMetrics: {
    type: string;
    current: number;
    target: number;
    unit: string;
  }[];
  notes: string[];
  adaptationRules: string[];
} 