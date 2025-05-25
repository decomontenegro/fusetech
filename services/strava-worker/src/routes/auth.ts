import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'jsonwebtoken';

/**
 * Configura as rotas de autenticação do Strava
 */
export function setupAuthRoutes(server: FastifyInstance, redis: Redis, stravaClient: any) {
  // Rota para conectar conta do Strava
  server.post('/strava/connect', async (request, reply) => {
    try {
      const { access_token, refresh_token, expires_at, athlete } = request.body as any;
      const userId = (request as any).user?.id;
      
      if (!userId) {
        return reply.status(401).send({ error: 'Usuário não autenticado' });
      }
      
      // Validar dados
      if (!access_token || !refresh_token || !expires_at || !athlete) {
        return reply.status(400).send({ error: 'Dados incompletos' });
      }
      
      // Criar conexão
      const connection = {
        id: uuidv4(),
        userId,
        stravaId: athlete.id,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_at,
        athleteData: athlete,
        createdAt: new Date().toISOString(),
      };
      
      // Salvar conexão no Redis (temporário, em produção seria no banco de dados)
      await redis.set(`strava:connection:${userId}`, JSON.stringify(connection));
      
      // Publicar evento de nova conexão
      await redis.publish('strava:events', JSON.stringify({
        type: 'connection_created',
        data: {
          userId,
          stravaId: athlete.id,
        }
      }));
      
      // Iniciar sincronização de atividades
      await redis.rpush('strava:sync', JSON.stringify({
        userId,
        stravaId: athlete.id,
        accessToken: access_token,
      }));
      
      return reply.status(200).send({ success: true });
    } catch (error) {
      server.log.error({ error }, 'Erro ao conectar conta do Strava');
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
  
  // Rota para desconectar conta do Strava
  server.delete('/strava/connect', async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      
      if (!userId) {
        return reply.status(401).send({ error: 'Usuário não autenticado' });
      }
      
      // Remover conexão do Redis
      await redis.del(`strava:connection:${userId}`);
      
      // Publicar evento de conexão removida
      await redis.publish('strava:events', JSON.stringify({
        type: 'connection_removed',
        data: {
          userId,
        }
      }));
      
      return reply.status(200).send({ success: true });
    } catch (error) {
      server.log.error({ error }, 'Erro ao desconectar conta do Strava');
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
  
  // Rota para verificar status da conexão
  server.get('/strava/status', async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      
      if (!userId) {
        return reply.status(401).send({ error: 'Usuário não autenticado' });
      }
      
      // Verificar se existe conexão
      const connectionData = await redis.get(`strava:connection:${userId}`);
      
      if (!connectionData) {
        return reply.status(200).send({ connected: false });
      }
      
      const connection = JSON.parse(connectionData);
      
      return reply.status(200).send({
        connected: true,
        athlete: {
          id: connection.athleteData.id,
          username: connection.athleteData.username,
          firstname: connection.athleteData.firstname,
          lastname: connection.athleteData.lastname,
          profile: connection.athleteData.profile,
        },
        connectedAt: connection.createdAt,
      });
    } catch (error) {
      server.log.error({ error }, 'Erro ao verificar status da conexão com Strava');
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
