/**
 * Tipos compartilhados para o FuseLabs App
 */

// Tipos de usuário
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
}

// Tipos de atividades
export enum ActivityType {
  RUN = 'run',
  WALK = 'walk',
  CYCLE = 'cycle',
  SOCIAL_POST = 'social_post',
  OTHER = 'other'
}

export enum ActivityStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export type ActivitySource = 'strava' | 'manual' | 'garmin';

// Tipos de tokens
export interface TokenTransaction {
  id: string;
  userId: string;
  amount: number;
  txHash?: string;
  status: TokenTransactionStatus;
  type: TokenTransactionType;
  createdAt: Date;
  completedAt?: Date;
  activityId?: string;
  referenceId?: string;
}

export enum TokenTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TokenTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
  REWARD = 'reward',
  BURN = 'burn'
}

// Tipos para integração
export interface OAuthToken {
  userId: string;
  platform: 'strava' | 'instagram' | 'tiktok';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para gamificação
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  status: ChallengeStatus;
  startDate: Date;
}

export interface UserChallenge {
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

// Tipos para sistema antifraude
export interface FraudDetectionResult {
  activityId: string;
  score: number; // 0 a 100, quanto maior mais suspeito
  flags: FraudFlag[];
  reviewRequired: boolean;
}

export enum FraudFlag {
  UNUSUAL_SPEED = 'unusual_speed',
  UNUSUAL_LOCATION = 'unusual_location',
  UNUSUAL_PATTERN = 'unusual_pattern',
  SUSPICIOUS_TIMING = 'suspicious_timing',
  DUPLICATE_CONTENT = 'duplicate_content'
}

// Tipos relacionados a usuários
export interface Profile extends User {
  bio?: string;
  socialConnections: SocialConnection[];
  activityConnections: ActivityConnection[];
}

// Tipos relacionados a autenticação
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error?: string;
}

// Tipos relacionados a atividades e pontos
export interface Activity {
  id: string;
  userId: string;
  points: number;
  status: ActivityStatus;
  tokenized: boolean;
  createdAt: Date;
}

// Physical Activity
export interface PhysicalActivity extends Activity {
  type: ActivityType.RUN | ActivityType.WALK | ActivityType.CYCLE | ActivityType.OTHER;
  distance: number; // em metros
  duration: number; // em segundos
  stravaId?: string;
  source: ActivitySource;
}

// Social Activity
export interface SocialActivity extends Activity {
  type: ActivityType.SOCIAL_POST;
  platform: 'instagram' | 'tiktok';
  postId: string;
  postUrl: string;
  engagement: number;
  verified: boolean;
}

// Challenge Types
export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  UPCOMING = 'upcoming'
}

// Base Challenge interface
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  status: ChallengeStatus;
  startDate: Date;
}

// Tipos relacionados a conexões sociais
export interface SocialConnection {
  id: string;
  userId: string;
  platform: SocialPlatform;
  username: string;
  profileUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter'
}

// Tipos relacionados a conexões de atividades
export interface ActivityConnection {
  id: string;
  userId: string;
  platform: ActivitySource;
  externalId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos relacionados a desafios e gamificação
export enum ChallengeType {
  DISTANCE = 'distance',
  DURATION = 'duration',
  POSTS = 'posts',
  ACTIVITIES = 'activities'
}

export enum UserRank {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Tipos para perfil esportivo e fitness
export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ELITE = 'elite'
}

export enum ExerciseType {
  RUNNING = 'running',
  CYCLING = 'cycling',
  WALKING = 'walking',
  SWIMMING = 'swimming',
  STRENGTH = 'strength',
  HIIT = 'hiit',
  YOGA = 'yoga',
  OTHER = 'other'
}

export enum FitnessGoal {
  WEIGHT_LOSS = 'weight_loss',
  ENDURANCE = 'endurance',
  STRENGTH = 'strength',
  SPEED = 'speed',
  GENERAL_FITNESS = 'general_fitness',
  COMPETITION = 'competition',
  HEALTH = 'health'
}

export interface SportPreferences {
  preferredExercises: ExerciseType[];
  preferredDayTime?: 'morning' | 'afternoon' | 'evening' | 'any';
  preferredDuration?: number; // minutos
  preferredFrequency?: number; // dias por semana
  outdoorPreference?: number; // 0-1 (0: apenas indoor, 1: apenas outdoor)
}

export interface HealthMetrics {
  height?: number; // cm
  weight?: number; // kg
  restingHeartRate?: number; // bpm
  maxHeartRate?: number; // bpm
  vo2Max?: number; // mL/(kg·min)
  limitations?: string[];
  conditions?: string[];
}

export interface PersonalRecord {
  type: string; // ex: "5k", "10k", "marathon", "bench_press"
  value: number; // tempo em segundos para corridas, peso em kg para força
  date: Date;
}

export interface SportProfile {
  userId: string;
  fitnessLevel: FitnessLevel;
  primarySport: ExerciseType;
  secondarySports?: ExerciseType[];
  goals: FitnessGoal[];
  specificGoals?: string[];
  preferences: SportPreferences;
  healthMetrics?: HealthMetrics;
  personalRecords?: PersonalRecord[];
  experienceYears?: number;
  weeklyActiveMinutes?: number;
  weeklyDistance?: number; // metros
  updatedAt: Date;
  createdAt: Date;
}

// Tipos para avaliação de esforço
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
  createdAt: Date;
}

// Tipos para planos de treino personalizados da OpenAI
export interface TrainingDay {
  day: number; // 0-6 (domingo-sábado)
  workouts: AIWorkout[];
}

export interface AIWorkout {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  duration: number; // minutos
  distance?: number; // metros
  intensity: 'recovery' | 'easy' | 'moderate' | 'hard' | 'maximum';
  targetHeartRate?: {
    min: number;
    max: number;
  };
  instructions: string;
  completed?: boolean;
  completedAt?: Date;
  effortScore?: number; // 0-100
}

export interface AITrainingPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  level: FitnessLevel;
  primaryType: ExerciseType;
  duration: number; // em semanas
  goal: FitnessGoal;
  specificGoal?: string;
  targetValue?: number; // Valor específico para objetivo (ex: 5000m)
  targetUnit?: string; // Unidade (ex: "metros", "minutos")
  schedule: TrainingDay[];
  progressMetrics: {
    type: string; // "distance", "time", "pace", etc
    current: number;
    target: number;
    unit: string;
  }[];
  adaptations?: {
    date: Date;
    reason: string;
    changes: string[];
  }[];
  startDate?: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'completed' | 'paused' | 'abandoned';
  aiGenerated: boolean;
  aiModel?: string;
  createdAt: Date;
  updatedAt: Date;
} 