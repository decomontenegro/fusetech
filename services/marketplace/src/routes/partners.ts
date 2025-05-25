import { FastifyInstance } from 'fastify';
import { PartnerService } from '../services/partnerService';
import { RewardService } from '../services/rewardService';
import { RedemptionService } from '../services/redemptionService';
import { CreateRewardSchema, UpdateRewardSchema } from '../schemas/reward';

export function setupPartnerRoutes(server: FastifyInstance) {
  const partnerService = new PartnerService(server.db);
  const rewardService = new RewardService(server.db, server.redis);
  const redemptionService = new RedemptionService(server.db, server.redis);

  // Obter informações do parceiro
  server.get('/partner/profile', async (request, reply) => {
    try {
      const partnerId = request.user.partnerId;
      
      const partner = await partnerService.getPartnerById(partnerId);
      
      if (!partner) {
        return reply.status(404).send({ error: 'Parceiro não encontrado' });
      }
      
      return partner;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter perfil do parceiro');
      return reply.status(500).send({ error: 'Erro ao obter perfil do parceiro' });
    }
  });

  // Atualizar informações do parceiro
  server.put('/partner/profile', async (request, reply) => {
    try {
      const partnerId = request.user.partnerId;
      const data = request.body as any;
      
      const partner = await partnerService.updatePartner(partnerId, data);
      
      return partner;
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar perfil do parceiro');
      return reply.status(500).send({ error: 'Erro ao atualizar perfil do parceiro' });
    }
  });

  // Obter recompensas do parceiro
  server.get('/partner/rewards', async (request, reply) => {
    try {
      const partnerId = request.user.partnerId;
      const { page = 1, limit = 20, status } = request.query as any;
      
      const result = await rewardService.getPartnerRewards({
        partnerId,
        page,
        limit,
        status
      });
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter recompensas do parceiro');
      return reply.status(500).send({ error: 'Erro ao obter recompensas do parceiro' });
    }
  });

  // Criar nova recompensa
  server.post('/partner/rewards', {
    schema: {
      body: CreateRewardSchema
    }
  }, async (request, reply) => {
    try {
      const partnerId = request.user.partnerId;
      const data = request.body as any;
      
      const reward = await rewardService.createReward({
        ...data,
        partnerId
      });
      
      return reward;
    } catch (error) {
      server.log.error({ error }, 'Erro ao criar recompensa');
      return reply.status(500).send({ error: 'Erro ao criar recompensa' });
    }
  });

  // Atualizar recompensa
  server.put('/partner/rewards/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: UpdateRewardSchema
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const partnerId = request.user.partnerId;
      const data = request.body as any;
      
      // Verificar se a recompensa pertence ao parceiro
      const reward = await rewardService.getRewardById(id);
      
      if (!reward) {
        return reply.status(404).send({ error: 'Recompensa não encontrada' });
      }
      
      if (reward.partnerId !== partnerId) {
        return reply.status(403).send({ error: 'Acesso negado' });
      }
      
      const updatedReward = await rewardService.updateReward(id, data);
      
      return updatedReward;
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar recompensa');
      return reply.status(500).send({ error: 'Erro ao atualizar recompensa' });
    }
  });

  // Obter resgates das recompensas do parceiro
  server.get('/partner/redemptions', async (request, reply) => {
    try {
      const partnerId = request.user.partnerId;
      const { page = 1, limit = 20, status } = request.query as any;
      
      const result = await redemptionService.getPartnerRedemptions({
        partnerId,
        page,
        limit,
        status
      });
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter resgates do parceiro');
      return reply.status(500).send({ error: 'Erro ao obter resgates do parceiro' });
    }
  });

  // Atualizar status de um resgate
  server.put('/partner/redemptions/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const partnerId = request.user.partnerId;
      const { status, notes } = request.body as { status: string; notes?: string };
      
      // Verificar se o resgate pertence a uma recompensa do parceiro
      const redemption = await redemptionService.getRedemptionById(id);
      
      if (!redemption) {
        return reply.status(404).send({ error: 'Resgate não encontrado' });
      }
      
      const reward = await rewardService.getRewardById(redemption.rewardId);
      
      if (!reward || reward.partnerId !== partnerId) {
        return reply.status(403).send({ error: 'Acesso negado' });
      }
      
      const updatedRedemption = await redemptionService.updateRedemptionStatus(id, status, notes);
      
      return updatedRedemption;
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar status do resgate');
      return reply.status(500).send({ error: 'Erro ao atualizar status do resgate' });
    }
  });

  // Obter estatísticas do parceiro
  server.get('/partner/stats', async (request, reply) => {
    try {
      const partnerId = request.user.partnerId;
      const { period = 'month' } = request.query as { period?: 'day' | 'week' | 'month' | 'year' | 'all' };
      
      const stats = await partnerService.getPartnerStats(partnerId, period);
      
      return stats;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter estatísticas do parceiro');
      return reply.status(500).send({ error: 'Erro ao obter estatísticas do parceiro' });
    }
  });
}
