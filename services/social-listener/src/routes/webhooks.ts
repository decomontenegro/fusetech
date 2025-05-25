import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { SocialPlatform } from '@fuseapp/types';

// Configura as rotas de webhook para receber notificações de redes sociais
export function setupWebhookRoutes(server: FastifyInstance, redis: Redis): void {
  // Webhook para novas postagens do Instagram
  server.post('/api/webhooks/instagram', async (request, reply) => {
    try {
      const body = request.body as any;
      
      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (entry.changes && Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              if (change.field === 'media' && change.value) {
                // Publicar novo post para processamento
                await redis.xadd(
                  'social:posts',
                  '*',
                  'platform', SocialPlatform.INSTAGRAM,
                  'userId', entry.id, // ID do usuário Instagram
                  'data', JSON.stringify(change.value)
                );
              }
            }
          }
        }
      }
      
      return reply.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      server.log.error({ error }, 'Erro ao processar webhook do Instagram');
      return reply.status(500).send('EVENT_PROCESSING_ERROR');
    }
  });

  // Webhook para novas postagens do TikTok
  server.post('/api/webhooks/tiktok', async (request, reply) => {
    try {
      const body = request.body as any;
      
      if (body.event_type === 'video.publish' && body.event_body) {
        // Publicar novo vídeo para processamento
        await redis.xadd(
          'social:posts',
          '*',
          'platform', SocialPlatform.TIKTOK,
          'userId', body.event_body.creator_id, // ID do criador no TikTok
          'data', JSON.stringify(body.event_body)
        );
      }
      
      return reply.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      server.log.error({ error }, 'Erro ao processar webhook do TikTok');
      return reply.status(500).send('EVENT_PROCESSING_ERROR');
    }
  });
} 