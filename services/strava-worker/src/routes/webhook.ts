import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { StravaWebhookChallenge, StravaWebhookEvent } from '../models/StravaWebhookEvent';

/**
 * Setup das rotas de webhook do Strava
 */
export function setupWebhookRoutes(server: FastifyInstance, redis: Redis) {
  // Rota para validação do webhook (recebe desafio do Strava)
  server.get<{ Querystring: StravaWebhookChallenge }>('/webhook', async (request, reply) => {
    const { hub_mode, hub_verify_token, hub_challenge } = request.query;
    
    // Verificar se é uma solicitação de verificação
    if (hub_mode === 'subscribe' && hub_verify_token === process.env.STRAVA_VERIFY_TOKEN) {
      server.log.info('Webhook Strava verificado com sucesso');
      return { hub_challenge };
    }
    
    // Token inválido ou outro erro
    server.log.error(`Falha na verificação do webhook Strava: ${JSON.stringify(request.query)}`);
    return reply.code(403).send({ error: 'Token de verificação inválido' });
  });
  
  // Rota para receber eventos do webhook
  server.post<{ Body: StravaWebhookEvent }>('/webhook', async (request, reply) => {
    const event = request.body;
    
    server.log.info({ event }, 'Evento Strava recebido');
    
    // Validar se é um evento de atividade
    if (event.object_type === 'activity' && event.aspect_type === 'create') {
      // Adicionar evento à fila Redis para processamento
      try {
        await redis.rpush('strava:events', JSON.stringify(event));
        server.log.info({ activityId: event.object_id }, 'Evento Strava adicionado à fila');
        
        // Enviar notificação ao serviço de processamento (opcional)
        await redis.publish('strava:notifications', 'new_event');
      } catch (error) {
        server.log.error({ error, event }, 'Erro ao processar evento Strava');
      }
    }
    
    // Responder sempre com 200 para o Strava
    return { status: 'success' };
  });
} 