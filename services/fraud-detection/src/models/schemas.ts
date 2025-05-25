import { z } from 'zod';
import { ActivitySource, ActivityStatus, ActivityType, SocialPlatform } from '@fuseapp/types';

// Schemas de validação para atividades do Strava
export const stravaActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  source: z.literal(ActivitySource.STRAVA),
  externalId: z.string(),
  type: z.nativeEnum(ActivityType),
  name: z.string().optional(),
  distance: z.number().optional(),
  duration: z.number().optional(),
  startDate: z.string(),
  metadata: z.record(z.any()),
});

export type StravaActivity = z.infer<typeof stravaActivitySchema>;

// Schemas de validação para posts sociais
export const socialPostSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: z.nativeEnum(SocialPlatform),
  postId: z.string(),
  content: z.string().optional(),
  mediaUrl: z.string().optional(),
  permalink: z.string().optional(),
  createdAt: z.string(),
  metadata: z.record(z.any()),
});

export type SocialPost = z.infer<typeof socialPostSchema>;

// Resultado da verificação de fraude
export interface FraudCheckResult {
  isValid: boolean;
  fraudScore: number;
  reasons: string[];
} 