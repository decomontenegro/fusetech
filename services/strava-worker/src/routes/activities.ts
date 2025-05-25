import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { ActivityType, ActivityStatus } from '@fuseapp/types';

/**
 * Configura as rotas de atividades do Strava
 */
export function setupActivityRoutes(server: FastifyInstance, redis: Redis, stravaClient: any) {
  // Rota para obter atividades do usuário
  server.get('/activities', async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      
      if (!userId) {
        return reply.status(401).send({ error: 'Usuário não autenticado' });
      }
      
      // Verificar se existe conexão com Strava
      const connectionData = await redis.get(`strava:connection:${userId}`);
      
      if (!connectionData) {
        return reply.status(400).send({ error: 'Usuário não conectado ao Strava' });
      }
      
      const connection = JSON.parse(connectionData);
      
      // Obter atividades do Redis (temporário, em produção seria do banco de dados)
      const activitiesData = await redis.lrange(`strava:activities:${userId}`, 0, -1);
      
      const activities = activitiesData.map(data => JSON.parse(data));
      
      return reply.status(200).send({ activities });
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter atividades do Strava');
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
  
  // Rota para sincronizar atividades manualmente
  server.post('/activities/sync', async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      
      if (!userId) {
        return reply.status(401).send({ error: 'Usuário não autenticado' });
      }
      
      // Verificar se existe conexão com Strava
      const connectionData = await redis.get(`strava:connection:${userId}`);
      
      if (!connectionData) {
        return reply.status(400).send({ error: 'Usuário não conectado ao Strava' });
      }
      
      const connection = JSON.parse(connectionData);
      
      // Adicionar à fila de sincronização
      await redis.rpush('strava:sync', JSON.stringify({
        userId,
        stravaId: connection.stravaId,
        accessToken: connection.accessToken,
      }));
      
      return reply.status(200).send({ success: true, message: 'Sincronização iniciada' });
    } catch (error) {
      server.log.error({ error }, 'Erro ao sincronizar atividades do Strava');
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
  
  // Rota para obter detalhes de uma atividade específica
  server.get('/activities/:id', async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      const { id } = request.params as { id: string };
      
      if (!userId) {
        return reply.status(401).send({ error: 'Usuário não autenticado' });
      }
      
      // Verificar se existe conexão com Strava
      const connectionData = await redis.get(`strava:connection:${userId}`);
      
      if (!connectionData) {
        return reply.status(400).send({ error: 'Usuário não conectado ao Strava' });
      }
      
      // Obter atividade do Redis (temporário, em produção seria do banco de dados)
      const activityData = await redis.get(`strava:activity:${id}`);
      
      if (!activityData) {
        return reply.status(404).send({ error: 'Atividade não encontrada' });
      }
      
      const activity = JSON.parse(activityData);
      
      // Verificar se a atividade pertence ao usuário
      if (activity.userId !== userId) {
        return reply.status(403).send({ error: 'Acesso negado' });
      }
      
      return reply.status(200).send({ activity });
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter detalhes da atividade');
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
