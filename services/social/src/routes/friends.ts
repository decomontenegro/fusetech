import { FastifyInstance } from 'fastify';
import { FriendService } from '../services/friendService';
import { NotificationService } from '../services/notificationService';

export function setupFriendsRoutes(server: FastifyInstance) {
  const friendService = new FriendService(server.db, server.redis);
  const notificationService = new NotificationService(server.db, server.redis);

  // Buscar amigos
  server.get('/friends', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { page = 1, limit = 20 } = request.query as any;
      
      const friends = await friendService.getFriends(userId, page, limit);
      
      return friends;
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar amigos');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao buscar amigos'
      });
    }
  });

  // Buscar solicitações de amizade pendentes
  server.get('/friends/requests', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { page = 1, limit = 20 } = request.query as any;
      
      const requests = await friendService.getFriendRequests(userId, page, limit);
      
      return requests;
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar solicitações de amizade');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao buscar solicitações de amizade'
      });
    }
  });

  // Enviar solicitação de amizade
  server.post('/friends/request', {
    schema: {
      body: {
        type: 'object',
        required: ['targetUserId'],
        properties: {
          targetUserId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { targetUserId } = request.body as { targetUserId: string };
      
      // Verificar se o usuário está tentando adicionar a si mesmo
      if (userId === targetUserId) {
        return reply.status(400).send({ 
          success: false,
          error: 'Não é possível enviar solicitação de amizade para si mesmo'
        });
      }
      
      const result = await friendService.sendFriendRequest(userId, targetUserId);
      
      // Enviar notificação
      if (result.success) {
        await notificationService.sendNotification({
          userId: targetUserId,
          type: 'friend_request',
          title: 'Nova solicitação de amizade',
          message: `${request.user.name} enviou uma solicitação de amizade`,
          data: {
            senderId: userId,
            senderName: request.user.name,
            senderAvatar: request.user.avatar
          }
        });
      }
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao enviar solicitação de amizade');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao enviar solicitação de amizade'
      });
    }
  });

  // Aceitar solicitação de amizade
  server.post('/friends/accept', {
    schema: {
      body: {
        type: 'object',
        required: ['requestId'],
        properties: {
          requestId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { requestId } = request.body as { requestId: string };
      
      const result = await friendService.acceptFriendRequest(userId, requestId);
      
      // Enviar notificação
      if (result.success) {
        await notificationService.sendNotification({
          userId: result.friendship.senderId,
          type: 'friend_accepted',
          title: 'Solicitação de amizade aceita',
          message: `${request.user.name} aceitou sua solicitação de amizade`,
          data: {
            friendId: userId,
            friendName: request.user.name,
            friendAvatar: request.user.avatar
          }
        });
      }
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao aceitar solicitação de amizade');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao aceitar solicitação de amizade'
      });
    }
  });

  // Rejeitar solicitação de amizade
  server.post('/friends/reject', {
    schema: {
      body: {
        type: 'object',
        required: ['requestId'],
        properties: {
          requestId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { requestId } = request.body as { requestId: string };
      
      const result = await friendService.rejectFriendRequest(userId, requestId);
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao rejeitar solicitação de amizade');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao rejeitar solicitação de amizade'
      });
    }
  });

  // Remover amizade
  server.delete('/friends/:friendId', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { friendId } = request.params as { friendId: string };
      
      const result = await friendService.removeFriend(userId, friendId);
      
      return result;
    } catch (error) {
      server.log.error({ error }, 'Erro ao remover amizade');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao remover amizade'
      });
    }
  });

  // Buscar usuários para adicionar como amigos
  server.get('/friends/suggestions', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { query, page = 1, limit = 20 } = request.query as any;
      
      const suggestions = await friendService.getFriendSuggestions(userId, query, page, limit);
      
      return suggestions;
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar sugestões de amizade');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao buscar sugestões de amizade'
      });
    }
  });

  // Buscar amigos em comum com outro usuário
  server.get('/friends/common/:userId', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { userId: otherUserId } = request.params as { userId: string };
      const { page = 1, limit = 20 } = request.query as any;
      
      const commonFriends = await friendService.getCommonFriends(userId, otherUserId, page, limit);
      
      return commonFriends;
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar amigos em comum');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao buscar amigos em comum'
      });
    }
  });

  // Verificar status de amizade com outro usuário
  server.get('/friends/status/:userId', async (request, reply) => {
    try {
      const userId = request.user.id;
      const { userId: otherUserId } = request.params as { userId: string };
      
      const status = await friendService.getFriendshipStatus(userId, otherUserId);
      
      return status;
    } catch (error) {
      server.log.error({ error }, 'Erro ao verificar status de amizade');
      return reply.status(500).send({ 
        success: false,
        error: 'Erro ao verificar status de amizade'
      });
    }
  });
}
