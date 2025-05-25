import { FastifyInstance } from 'fastify';
import { RedemptionService } from '../services/redemptionService';
import { TokenService } from '../services/tokenService';
import { RedemptionSchema, CreateRedemptionSchema } from '../schemas/redemption';

export function setupRedemptionRoutes(server: FastifyInstance) {
  const redemptionService = new RedemptionService(server.db, server.redis);
  const tokenService = new TokenService(server.redis);

  // Resgatar uma recompensa
  server.post('/redemptions', {
    schema: {
      body: CreateRedemptionSchema,
      response: {
        200: RedemptionSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { rewardId } = request.body as { rewardId: string };
      const userId = request.user.id;
      
      // Verificar se o usuário tem saldo suficiente
      const reward = await redemptionService.getRewardById(rewardId);
      
      if (!reward) {
        return reply.status(404).send({ error: 'Recompensa não encontrada' });
      }
      
      if (!reward.available) {
        return reply.status(400).send({ error: 'Recompensa não disponível' });
      }
      
      // Verificar saldo do usuário
      const userBalance = await tokenService.getUserBalance(userId);
      
      if (userBalance < reward.price) {
        return reply.status(400).send({ 
          error: 'Saldo insuficiente',
          required: reward.price,
          balance: userBalance
        });
      }
      
      // Processar o resgate
      const redemption = await redemptionService.createRedemption({
        userId,
        rewardId,
        price: reward.price
      });
      
      // Queimar tokens
      await tokenService.burnTokens({
        userId,
        amount: reward.price,
        reason: `Resgate: ${reward.name}`
      });
      
      return redemption;
    } catch (error) {
      server.log.error({ error }, 'Erro ao resgatar recompensa');
      return reply.status(500).send({ error: 'Erro ao resgatar recompensa' });
    }
  });

  // Obter histórico de resgates do usuário
  server.get('/redemptions', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          status: { type: 'string', enum: ['pending', 'completed', 'failed', 'all'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            redemptions: { type: 'array', items: RedemptionSchema },
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
      const { page = 1, limit = 20, status = 'all' } = request.query as any;
      const userId = request.user.id;
      
      const result = await redemptionService.getUserRedemptions({
        userId,
        page,
        limit,
        status
      });
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter histórico de resgates');
      return reply.status(500).send({ error: 'Erro ao obter histórico de resgates' });
    }
  });

  // Obter detalhes de um resgate
  server.get('/redemptions/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: RedemptionSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.id;
      
      const redemption = await redemptionService.getRedemptionById(id, userId);
      
      if (!redemption) {
        return reply.status(404).send({ error: 'Resgate não encontrado' });
      }
      
      // Verificar se o resgate pertence ao usuário
      if (redemption.userId !== userId) {
        return reply.status(403).send({ error: 'Acesso negado' });
      }
      
      return redemption;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter detalhes do resgate');
      return reply.status(500).send({ error: 'Erro ao obter detalhes do resgate' });
    }
  });

  // Verificar código de resgate
  server.get('/redemptions/verify/:code', {
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { code } = request.params as { code: string };
      const userId = request.user.id;
      
      const redemption = await redemptionService.verifyRedemptionCode(code, userId);
      
      if (!redemption) {
        return reply.status(404).send({ error: 'Código de resgate inválido' });
      }
      
      return {
        valid: true,
        redemption
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao verificar código de resgate');
      return reply.status(500).send({ error: 'Erro ao verificar código de resgate' });
    }
  });
}
