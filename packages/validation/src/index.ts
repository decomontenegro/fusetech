import { z } from 'zod';

// Exportar zod para uso em outros pacotes
export { z };

// Tipos básicos reutilizáveis
export const idSchema = z.string().min(1);
export const emailSchema = z.string().email();
export const usernameSchema = z.string().min(3).max(30);
export const passwordSchema = z.string().min(8).max(100);
export const dateSchema = z.string().datetime();
export const urlSchema = z.string().url();

// Esquemas para usuários
export const userSchema = z.object({
  id: idSchema.optional(),
  email: emailSchema,
  username: usernameSchema,
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  avatarUrl: urlSchema.optional(),
  createdAt: dateSchema.optional(),
  updatedAt: dateSchema.optional(),
});

export type User = z.infer<typeof userSchema>;

// Esquemas para autenticação
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = userSchema.extend({
  password: passwordSchema,
});

// Esquemas para atividades físicas
export const activityTypeSchema = z.enum([
  'run',
  'ride',
  'swim',
  'walk',
  'hike',
  'workout',
  'other',
]);

export const activitySchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  type: activityTypeSchema,
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  distance: z.number().min(0).optional(), // em metros
  duration: z.number().min(0), // em segundos
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  source: z.string().optional(), // ex: 'strava', 'manual'
  sourceId: z.string().optional(), // ID na fonte original
  calories: z.number().min(0).optional(),
  elevationGain: z.number().min(0).optional(), // em metros
  averageHeartRate: z.number().min(0).max(250).optional(),
  maxHeartRate: z.number().min(0).max(250).optional(),
  polyline: z.string().optional(), // Codificação do percurso
  isVerified: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export type Activity = z.infer<typeof activitySchema>;

// Esquemas para tokens
export const tokenTransactionTypeSchema = z.enum(['earn', 'burn']);
export const tokenTransactionStatusSchema = z.enum(['pending', 'confirmed', 'failed']);

export const tokenTransactionSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  amount: z.number().min(0),
  type: tokenTransactionTypeSchema,
  status: tokenTransactionStatusSchema.default('pending'),
  source: z.string(), // ex: 'strava', 'instagram', 'challenge'
  sourceId: z.string().optional(), // ID da fonte (atividade, desafio, etc)
  createdAt: dateSchema.optional(),
  updatedAt: dateSchema.optional(),
  metadata: z.record(z.any()).optional(),
});

export type TokenTransaction = z.infer<typeof tokenTransactionSchema>;

// Esquemas para desafios
export const challengeTypeSchema = z.enum([
  'distance',
  'activity_count',
  'social_posts',
  'streak',
]);

export const challengeSchema = z.object({
  id: idSchema.optional(),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  type: challengeTypeSchema,
  target: z.number().min(1),
  reward: z.number().min(0),
  startDate: dateSchema,
  endDate: dateSchema,
  isActive: z.boolean().default(true),
  requiredLevel: z.number().min(0).default(0),
  metadata: z.record(z.any()).optional(),
});

export type Challenge = z.infer<typeof challengeSchema>;

// Esquemas para conquistas
export const achievementTypeSchema = z.enum([
  'distance',
  'activity_count',
  'social_posts',
  'streak',
  'level',
]);

export const achievementSchema = z.object({
  id: idSchema.optional(),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  type: achievementTypeSchema,
  threshold: z.number().min(1),
  reward: z.number().min(0),
  icon: z.string().optional(),
  isSecret: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export type Achievement = z.infer<typeof achievementSchema>;

// Esquemas para redes sociais
export const socialPlatformSchema = z.enum([
  'instagram',
  'tiktok',
  'twitter',
  'facebook',
]);

export const socialAccountSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  platform: socialPlatformSchema,
  username: z.string().min(1),
  profileUrl: urlSchema.optional(),
  isVerified: z.boolean().default(false),
  connectedAt: dateSchema.optional(),
  metadata: z.record(z.any()).optional(),
});

export type SocialAccount = z.infer<typeof socialAccountSchema>;

// Função para validar e sanitizar entrada
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

// Função para validar e retornar erros sem lançar exceção
export function validateSafe<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  return result;
}

// Middleware para validação de entrada em APIs
export function createValidationMiddleware<T extends z.ZodType>(schema: T) {
  return (data: unknown) => {
    try {
      return { data: validate(schema, data), error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { data: null, error };
      }
      throw error;
    }
  };
}
