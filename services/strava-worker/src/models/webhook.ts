import { z } from 'zod';

// Schema de validação para webhook Strava
export const stravaWebhookSchema = z.object({
  object_type: z.string(),
  object_id: z.number(),
  aspect_type: z.enum(['create', 'update', 'delete']),
  owner_id: z.number(),
  subscription_id: z.number(),
  event_time: z.number(),
});

export type StravaWebhookEvent = z.infer<typeof stravaWebhookSchema>; 