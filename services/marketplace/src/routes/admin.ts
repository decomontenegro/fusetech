import { FastifyInstance } from 'fastify';
import { AdminService } from '../services/adminService';
import { RewardService } from '../services/rewardService';
import { RedemptionService } from '../services/redemptionService';
import { PartnerService } from '../services/partnerService';

export function setupAdminRoutes(server: FastifyInstance) {
  const adminService = new AdminService(server.db, server.redis);
  const rewardService = new RewardService(server.db, server.redis);
  const redemptionService = new RedemptionService(server.db, server.redis);
  const partnerService = new PartnerService(server.db);

  // Dashboard de administração
  server.get('/admin/dashboard', async (request, reply) => {
    try {
      const stats = await adminService.getDashboardStats();
      return stats;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter estatísticas do dashboard');
      return reply.status(500).send({ error: 'Erro ao obter estatísticas do dashboard' });
    }
  });

  // Gerenciar recompensas
  server.get('/admin/rewards', async (request, reply) => {
    try {
      const { page = 1, limit = 20, status, partnerId } = request.query as any;
      
      const result = await rewardService.getAllRewards({
        page,
        limit,
        status,
        partnerId
      });
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter recompensas');
      return reply.status(500).send({ error: 'Erro ao obter recompensas' });
    }
  });

  // Aprovar/rejeitar recompensa
  server.put('/admin/rewards/:id/status', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status, reason } = request.body as { status: 'approved' | 'rejected'; reason?: string };
      
      const reward = await rewardService.updateRewardStatus(id, status, reason);
      
      return reward;
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar status da recompensa');
      return reply.status(500).send({ error: 'Erro ao atualizar status da recompensa' });
    }
  });

  // Destacar recompensa
  server.put('/admin/rewards/:id/featured', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { featured } = request.body as { featured: boolean };
      
      const reward = await rewardService.setRewardFeatured(id, featured);
      
      return reward;
    } catch (error) {
      server.log.error({ error }, 'Erro ao destacar recompensa');
      return reply.status(500).send({ error: 'Erro ao destacar recompensa' });
    }
  });

  // Gerenciar parceiros
  server.get('/admin/partners', async (request, reply) => {
    try {
      const { page = 1, limit = 20, status } = request.query as any;
      
      const result = await partnerService.getAllPartners({
        page,
        limit,
        status
      });
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter parceiros');
      return reply.status(500).send({ error: 'Erro ao obter parceiros' });
    }
  });

  // Aprovar/rejeitar parceiro
  server.put('/admin/partners/:id/status', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status, reason } = request.body as { status: 'approved' | 'rejected'; reason?: string };
      
      const partner = await partnerService.updatePartnerStatus(id, status, reason);
      
      return partner;
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar status do parceiro');
      return reply.status(500).send({ error: 'Erro ao atualizar status do parceiro' });
    }
  });

  // Gerenciar resgates
  server.get('/admin/redemptions', async (request, reply) => {
    try {
      const { page = 1, limit = 20, status, userId, partnerId } = request.query as any;
      
      const result = await redemptionService.getAllRedemptions({
        page,
        limit,
        status,
        userId,
        partnerId
      });
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter resgates');
      return reply.status(500).send({ error: 'Erro ao obter resgates' });
    }
  });

  // Resolver disputa de resgate
  server.put('/admin/redemptions/:id/resolve', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { resolution, notes } = request.body as { resolution: 'approved' | 'rejected'; notes: string };
      
      const redemption = await redemptionService.resolveRedemptionDispute(id, resolution, notes);
      
      return redemption;
    } catch (error) {
      server.log.error({ error }, 'Erro ao resolver disputa de resgate');
      return reply.status(500).send({ error: 'Erro ao resolver disputa de resgate' });
    }
  });

  // Gerenciar categorias
  server.get('/admin/categories', async (request, reply) => {
    try {
      const categories = await rewardService.getAllCategories();
      return { categories };
    } catch (error) {
      server.log.error({ error }, 'Erro ao obter categorias');
      return reply.status(500).send({ error: 'Erro ao obter categorias' });
    }
  });

  // Criar categoria
  server.post('/admin/categories', async (request, reply) => {
    try {
      const { name, description, icon } = request.body as { name: string; description: string; icon: string };
      
      const category = await rewardService.createCategory({ name, description, icon });
      
      return category;
    } catch (error) {
      server.log.error({ error }, 'Erro ao criar categoria');
      return reply.status(500).send({ error: 'Erro ao criar categoria' });
    }
  });

  // Atualizar categoria
  server.put('/admin/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name, description, icon, active } = request.body as { name: string; description: string; icon: string; active: boolean };
      
      const category = await rewardService.updateCategory(id, { name, description, icon, active });
      
      return category;
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar categoria');
      return reply.status(500).send({ error: 'Erro ao atualizar categoria' });
    }
  });

  // Obter relatórios
  server.get('/admin/reports', async (request, reply) => {
    try {
      const { type, period, startDate, endDate } = request.query as any;
      
      const report = await adminService.generateReport({
        type,
        period,
        startDate,
        endDate
      });
      
      return report;
    } catch (error) {
      server.log.error({ error }, 'Erro ao gerar relatório');
      return reply.status(500).send({ error: 'Erro ao gerar relatório' });
    }
  });

  // Exportar dados
  server.get('/admin/export', async (request, reply) => {
    try {
      const { type, format, startDate, endDate } = request.query as any;
      
      const data = await adminService.exportData({
        type,
        format,
        startDate,
        endDate
      });
      
      // Configurar cabeçalhos para download
      if (format === 'csv') {
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename=${type}_${new Date().toISOString()}.csv`);
      } else if (format === 'json') {
        reply.header('Content-Type', 'application/json');
        reply.header('Content-Disposition', `attachment; filename=${type}_${new Date().toISOString()}.json`);
      }
      
      return data;
    } catch (error) {
      server.log.error({ error }, 'Erro ao exportar dados');
      return reply.status(500).send({ error: 'Erro ao exportar dados' });
    }
  });
}
