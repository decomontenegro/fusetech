import { z } from 'zod';
import { SocialPlatform } from '@fuseapp/types';

// Schema para conexões sociais
export const socialConnectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: z.nativeEnum(SocialPlatform),
  username: z.string(),
  profileUrl: z.string().optional(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().optional(),
});

export type SocialConnection = z.infer<typeof socialConnectionSchema>;

// Schema para posts do Instagram
export const instagramPostSchema = z.object({
  id: z.string(),
  caption: z.string().optional(),
  media_type: z.string(),
  media_url: z.string(),
  permalink: z.string(),
  timestamp: z.string(),
});

export type InstagramPost = z.infer<typeof instagramPostSchema>;

// Schema para vídeos do TikTok
export const tiktokVideoSchema = z.object({
  id: z.string(),
  desc: z.string().optional(),
  create_time: z.number(),
  share_url: z.string(),
  stats: z.object({
    comment_count: z.number(),
    digg_count: z.number(),
    share_count: z.number(),
    view_count: z.number(),
  }),
});

export type TiktokVideo = z.infer<typeof tiktokVideoSchema>; 