import { FastifyInstance } from 'fastify';
import { GoogleFitService } from '../services/googleFitService';
import { ActivityService } from '../services/activityService';

export function setupGoogleFitRoutes(server: FastifyInstance) {
  const googleFitService = new GoogleFitService(server.db, server.redis);
  const activityService = new ActivityService(server.db, server.redis);

  // Iniciar conexão com Google Fit (OAuth)
  server.get('/google-fit/auth', async (request, reply) => {
    try {
      const userId = request.user.id;
      const redirectUri = request.query.redirectUri as string;
      
      if (!redirectUri) {
        return reply.status(400).send({ 
          success: false,
          error: 'redirectUri é obrigatório'
        });
      }
      
      const authUrl = await googleFitService.getAuthUrl(userId, redirectUri);
      
      return {
        success: true,
        authUrl
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao gerar URL de autenticação do Google Fit');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao gerar URL de autenticação do Google Fit'
      });
    }
  });

  // Callback do OAuth do Google Fit
  server.post('/google-fit/callback', {
    schema: {
      body: {
        type: 'object',
        required: ['code', 'redirectUri'],
        properties: {
          code: { type: 'string' },
          redirectUri: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { code, redirectUri } = request.body as { code: string; redirectUri: string };
      
      const result = await googleFitService.handleAuthCallback(userId, code, redirectUri);
      
      // Iniciar sincronização inicial
      await server.redis.rpush('health:sync:queue', JSON.stringify({
        userId,
        source: 'google_fit',
        action: 'initial_sync',
        timestamp: new Date().toISOString()
      }));
      
      return {
        success: true,
        connected: result.connected,
        message: 'Conexão com Google Fit estabelecida com sucesso'
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao processar callback do Google Fit');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao processar callback do Google Fit'
      });
    }
  });

  // Sincronizar dados do Google Fit manualmente
  server.post('/google-fit/sync', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { startDate, endDate } = request.body as { startDate?: string; endDate?: string };
      
      // Verificar se o usuário tem conexão ativa
      const isConnected = await googleFitService.isConnected(userId);
      
      if (!isConnected) {
        return reply.status(400).send({ 
          success: false,
          error: 'Usuário não está conectado ao Google Fit'
        });
      }
      
      // Enfileirar para sincronização
      await server.redis.rpush('health:sync:queue', JSON.stringify({
        userId,
        source: 'google_fit',
        action: 'manual_sync',
        startDate,
        endDate,
        timestamp: new Date().toISOString()
      }));
      
      return {
        success: true,
        message: 'Sincronização iniciada'
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao iniciar sincronização com Google Fit');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao iniciar sincronização com Google Fit'
      });
    }
  });

  // Verificar status da conexão com Google Fit
  server.get('/google-fit/status', async (request, reply) => {
    try {
      const userId = request.user.id;
      
      const status = await googleFitService.getConnectionStatus(userId);
      
      return status;
    } catch (error) {
      server.log.error({ error }, 'Erro ao verificar status da conexão com Google Fit');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao verificar status da conexão com Google Fit'
      });
    }
  });

  // Configurar preferências do Google Fit
  server.post('/google-fit/preferences', {
    schema: {
      body: {
        type: 'object',
        properties: {
          syncWorkouts: { type: 'boolean' },
          syncSteps: { type: 'boolean' },
          syncHeartRate: { type: 'boolean' },
          syncActiveEnergy: { type: 'boolean' },
          autoSync: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const preferences = request.body as any;
      
      const result = await googleFitService.updatePreferences(userId, preferences);
      
      return {
        success: true,
        preferences: result
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar preferências do Google Fit');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao atualizar preferências do Google Fit'
      });
    }
  });

  // Obter atividades sincronizadas do Google Fit
  server.get('/google-fit/activities', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          type: { type: 'string' },
          status: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { page = 1, limit = 20, startDate, endDate, type, status } = request.query as any;
      
      const activities = await activityService.getUserActivities({
        userId,
        source: 'google_fit',
        page,
        limit,
        startDate,
        endDate,
        type,
        status
      });
      
      return activities;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter atividades do Google Fit');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao obter atividades do Google Fit'
      });
    }
  });

  // Desconectar Google Fit
  server.delete('/google-fit/connection', async (request, reply) => {
    try {
      const userId = request.user.id;
      
      await googleFitService.removeConnection(userId);
      
      return {
        success: true,
        message: 'Conexão com Google Fit removida com sucesso'
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao remover conexão com Google Fit');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao remover conexão com Google Fit'
      });
    }
  });
}
