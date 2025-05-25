import { FastifyInstance } from 'fastify';
import { RewardService } from '../services/rewardService';
import { RewardSchema, RewardQuerySchema } from '../schemas/reward';

export function setupRewardRoutes(server: FastifyInstance) {
  const rewardService = new RewardService(server.db, server.redis);

  // Obter todas as recompensas disponíveis
  server.get('/rewards', {
    schema: {
      querystring: RewardQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            rewards: { type: 'array', items: RewardSchema },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, category, minPrice, maxPrice, sortBy, sortOrder } = request.query as any;
      const userId = request.user.id;
      
      const result = await rewardService.getRewards({
        page,
        limit,
        category,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        userId
      });
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter recompensas');
      return reply.status(500).send({ error: 'Erro ao obter recompensas' });
    }
  });

  // Obter recompensa por ID
  server.get('/rewards/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: RewardSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.id;
      
      const reward = await rewardService.getRewardById(id, userId);
      
      if (!reward) {
        return reply.status(404).send({ error: 'Recompensa não encontrada' });
      }
      
      return reward;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter recompensa');
      return reply.status(500).send({ error: 'Erro ao obter recompensa' });
    }
  });

  // Obter categorias de recompensas
  server.get('/rewards/categories', async (request, reply) => {
    try {
      const categories = await rewardService.getCategories();
      return { categories };
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter categorias');
      return reply.status(500).send({ error: 'Erro ao obter categorias' });
    }
  });

  // Obter recompensas em destaque
  server.get('/rewards/featured', async (request, reply) => {
    try {
      const userId = request.user.id;
      const featuredRewards = await rewardService.getFeaturedRewards(userId);
      return { rewards: featuredRewards };
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter recompensas em destaque');
      return reply.status(500).send({ error: 'Erro ao obter recompensas em destaque' });
    }
  });

  // Obter recompensas populares
  server.get('/rewards/popular', async (request, reply) => {
    try {
      const userId = request.user.id;
      const popularRewards = await rewardService.getPopularRewards(userId);
      return { rewards: popularRewards };
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter recompensas populares');
      return reply.status(500).send({ error: 'Erro ao obter recompensas populares' });
    }
  });

  // Obter recompensas recomendadas para o usuário
  server.get('/rewards/recommended', async (request, reply) => {
    try {
      const userId = request.user.id;
      const recommendedRewards = await rewardService.getRecommendedRewards(userId);
      return { rewards: recommendedRewards };
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter recompensas recomendadas');
      return reply.status(500).send({ error: 'Erro ao obter recompensas recomendadas' });
    }
  });
}
