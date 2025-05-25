import { FastifyInstance } from 'fastify';
import { AppleHealthService } from '../services/appleHealthService';
import { ActivityService } from '../services/activityService';
import { AppleHealthDataSchema } from '../schemas/appleHealth';

export function setupAppleHealthRoutes(server: FastifyInstance) {
  const appleHealthService = new AppleHealthService(server.db, server.redis);
  const activityService = new ActivityService(server.db, server.redis);

  // Receber dados do Apple Health
  server.post('/apple-health/sync', {
    schema: {
      body: {
        type: 'object',
        required: ['workouts', 'steps'],
        properties: {
          workouts: {
            type: 'array',
            items: AppleHealthDataSchema.workout
          },
          steps: {
            type: 'array',
            items: AppleHealthDataSchema.steps
          },
          heartRate: {
            type: 'array',
            items: AppleHealthDataSchema.heartRate
          },
          activeEnergy: {
            type: 'array',
            items: AppleHealthDataSchema.activeEnergy
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const healthData = request.body as any;
      
      server.log.info({ userId }, 'Recebendo dados do Apple Health');
      
      // Processar dados
      const result = await appleHealthService.processHealthData(userId, healthData);
      
      // Enfileirar para processamento assíncrono
      await server.redis.rpush('health:sync:queue', JSON.stringify({
        userId,
        source: 'apple_health',
        data: healthData,
        timestamp: new Date().toISOString()
      }));
      
      return {
        success: true,
        processed: result.processed,
        activities: result.activities,
        message: 'Dados recebidos e enfileirados para processamento'
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao processar dados do Apple Health');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao processar dados do Apple Health'
      });
    }
  });

  // Verificar status da conexão com Apple Health
  server.get('/apple-health/status', async (request, reply) => {
    try {
      const userId = request.user.id;
      
      const status = await appleHealthService.getConnectionStatus(userId);
      
      return status;
    } catch (error) {
      server.log.error({ error }, 'Erro ao verificar status da conexão com Apple Health');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao verificar status da conexão com Apple Health'
      });
    }
  });

  // Configurar preferências do Apple Health
  server.post('/apple-health/preferences', {
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
      
      const result = await appleHealthService.updatePreferences(userId, preferences);
      
      return {
        success: true,
        preferences: result
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar preferências do Apple Health');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao atualizar preferências do Apple Health'
      });
    }
  });

  // Obter atividades sincronizadas do Apple Health
  server.get('/apple-health/activities', {
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
        source: 'apple_health',
        page,
        limit,
        startDate,
        endDate,
        type,
        status
      });
      
      return activities;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter atividades do Apple Health');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao obter atividades do Apple Health'
      });
    }
  });

  // Desconectar Apple Health
  server.delete('/apple-health/connection', async (request, reply) => {
    try {
      const userId = request.user.id;
      
      await appleHealthService.removeConnection(userId);
      
      return {
        success: true,
        message: 'Conexão com Apple Health removida com sucesso'
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao remover conexão com Apple Health');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao remover conexão com Apple Health'
      });
    }
  });
}
