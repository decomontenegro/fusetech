import { FastifyInstance } from 'fastify';
import { CompetitionService } from '../services/competitionService';
import { NotificationService } from '../services/notificationService';

export function setupCompetitionsRoutes(server: FastifyInstance) {
  const competitionService = new CompetitionService(server.db, server.redis);
  const notificationService = new NotificationService(server.db, server.redis);

  // Obter competições do usuário
  server.get('/competitions', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { status, page = 1, limit = 20 } = request.query as any;
      
      const competitions = await competitionService.getUserCompetitions(userId, status, page, limit);
      
      return competitions;
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar competições do usuário');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao buscar competições do usuário'
      });
    }
  });

  // Obter detalhes de uma competição
  server.get('/competitions/:id', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { id } = request.params as { id: string };
      
      const competition = await competitionService.getCompetitionById(id, userId);
      
      if (!competition) {
        return reply.status(404).send({ 
          success: false,
          error: 'Competição não encontrada'
        });
      }
      
      return competition;
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar detalhes da competição');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao buscar detalhes da competição'
      });
    }
  });

  // Criar uma nova competição
  server.post('/competitions', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'type', 'goal', 'startDate', 'endDate'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          type: { type: 'string', enum: ['distance', 'duration', 'steps', 'calories'] },
          goal: { type: 'number', minimum: 1 },
          activityTypes: { 
            type: 'array',
            items: { type: 'string' }
          },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          isPrivate: { type: 'boolean' },
          invitedUsers: { 
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const competitionData = request.body as any;
      
      const result = await competitionService.createCompetition(userId, competitionData);
      
      // Enviar notificações para usuários convidados
      if (result.success && competitionData.invitedUsers && competitionData.invitedUsers.length > 0) {
        for (const invitedUserId of competitionData.invitedUsers) {
          await notificationService.sendNotification({
            userId: invitedUserId,
            type: 'competition_invite',
            title: 'Convite para competição',
            message: `${request.user.name} convidou você para a competição "${competitionData.name}"`,
            data: {
              competitionId: result.competition.id,
              competitionName: competitionData.name,
              inviterId: userId,
              inviterName: request.user.name
            }
          });
        }
      }
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao criar competição');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao criar competição'
      });
    }
  });

  // Atualizar uma competição
  server.put('/competitions/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          goal: { type: 'number', minimum: 1 },
          activityTypes: { 
            type: 'array',
            items: { type: 'string' }
          },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          isPrivate: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { id } = request.params as { id: string };
      const updateData = request.body as any;
      
      const result = await competitionService.updateCompetition(id, userId, updateData);
      
      if (!result.success) {
        return reply.status(result.code || 400).send(result);
      }
      
      // Notificar participantes sobre a atualização
      const participants = await competitionService.getCompetitionParticipants(id);
      
      for (const participant of participants) {
        if (participant.userId !== userId) {
          await notificationService.sendNotification({
            userId: participant.userId,
            type: 'competition_updated',
            title: 'Competição atualizada',
            message: `A competição "${result.competition.name}" foi atualizada`,
            data: {
              competitionId: id,
              competitionName: result.competition.name,
              updaterId: userId,
              updaterName: request.user.name
            }
          });
        }
      }
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar competição');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao atualizar competição'
      });
    }
  });

  // Convidar usuários para uma competição
  server.post('/competitions/:id/invite', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['userIds'],
        properties: {
          userIds: { 
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { id } = request.params as { id: string };
      const { userIds } = request.body as { userIds: string[] };
      
      const result = await competitionService.inviteUsers(id, userId, userIds);
      
      if (!result.success) {
        return reply.status(result.code || 400).send(result);
      }
      
      // Enviar notificações para usuários convidados
      const competition = await competitionService.getCompetitionById(id, userId);
      
      for (const invitedUserId of userIds) {
        await notificationService.sendNotification({
          userId: invitedUserId,
          type: 'competition_invite',
          title: 'Convite para competição',
          message: `${request.user.name} convidou você para a competição "${competition.name}"`,
          data: {
            competitionId: id,
            competitionName: competition.name,
            inviterId: userId,
            inviterName: request.user.name
          }
        });
      }
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao convidar usuários para competição');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao convidar usuários para competição'
      });
    }
  });

  // Aceitar convite para uma competição
  server.post('/competitions/:id/accept', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { id } = request.params as { id: string };
      
      const result = await competitionService.acceptInvite(id, userId);
      
      if (!result.success) {
        return reply.status(result.code || 400).send(result);
      }
      
      // Notificar criador da competição
      await notificationService.sendNotification({
        userId: result.competition.createdBy,
        type: 'competition_invite_accepted',
        title: 'Convite aceito',
        message: `${request.user.name} aceitou seu convite para a competição "${result.competition.name}"`,
        data: {
          competitionId: id,
          competitionName: result.competition.name,
          participantId: userId,
          participantName: request.user.name
        }
      });
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao aceitar convite para competição');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao aceitar convite para competição'
      });
    }
  });

  // Rejeitar convite para uma competição
  server.post('/competitions/:id/reject', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { id } = request.params as { id: string };
      
      const result = await competitionService.rejectInvite(id, userId);
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao rejeitar convite para competição');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao rejeitar convite para competição'
      });
    }
  });

  // Sair de uma competição
  server.post('/competitions/:id/leave', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { id } = request.params as { id: string };
      
      const result = await competitionService.leaveCompetition(id, userId);
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao sair da competição');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao sair da competição'
      });
    }
  });

  // Obter classificação de uma competição
  server.get('/competitions/:id/leaderboard', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { id } = request.params as { id: string };
      
      const leaderboard = await competitionService.getCompetitionLeaderboard(id, userId);
      
      return leaderboard;
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar classificação da competição');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao buscar classificação da competição'
      });
    }
  });

  // Obter participantes de uma competição
  server.get('/competitions/:id/participants', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { id } = request.params as { id: string };
      const { page = 1, limit = 20 } = request.query as any;
      
      const participants = await competitionService.getCompetitionParticipantsWithDetails(id, userId, page, limit);
      
      return participants;
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar participantes da competição');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao buscar participantes da competição'
      });
    }
  });
}
