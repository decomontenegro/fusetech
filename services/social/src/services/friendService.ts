import { Database } from '../database';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export class FriendService {
  private db: Database;
  private redis: Redis;

  constructor(db: Database, redis: Redis) {
    this.db = db;
    this.redis = redis;
  }

  /**
   * Obtém a lista de amigos do usuário
   */
  async getFriends(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      // Buscar amizades onde o usuário é o remetente ou destinatário
      const friendships = await this.db.collection('friendships').find({
        $or: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' }
        ]
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
      
      // Extrair IDs dos amigos
      const friendIds = friendships.map(friendship => 
        friendship.senderId === userId ? friendship.receiverId : friendship.senderId
      );
      
      // Buscar informações dos amigos
      const friends = await this.db.collection('users').find({
        id: { $in: friendIds }
      }, {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          avatar: 1,
          level: 1,
          createdAt: 1
        }
      }).toArray();
      
      // Mapear amigos com informações da amizade
      const friendsWithDetails = friends.map(friend => {
        const friendship = friendships.find(f => 
          f.senderId === friend.id || f.receiverId === friend.id
        );
        
        return {
          ...friend,
          friendshipId: friendship.id,
          friendsSince: friendship.updatedAt
        };
      });
      
      // Contar total
      const total = await this.db.collection('friendships').countDocuments({
        $or: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' }
        ]
      });
      
      return {
        friends: friendsWithDetails,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Erro ao buscar amigos:', error);
      throw error;
    }
  }

  /**
   * Obtém solicitações de amizade pendentes
   */
  async getFriendRequests(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      // Buscar solicitações recebidas pendentes
      const requests = await this.db.collection('friendships').find({
        receiverId: userId,
        status: 'pending'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
      
      // Extrair IDs dos remetentes
      const senderIds = requests.map(request => request.senderId);
      
      // Buscar informações dos remetentes
      const senders = await this.db.collection('users').find({
        id: { $in: senderIds }
      }, {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          avatar: 1,
          level: 1,
          createdAt: 1
        }
      }).toArray();
      
      // Mapear solicitações com informações dos remetentes
      const requestsWithDetails = requests.map(request => {
        const sender = senders.find(s => s.id === request.senderId);
        
        return {
          id: request.id,
          sender,
          createdAt: request.createdAt
        };
      });
      
      // Contar total
      const total = await this.db.collection('friendships').countDocuments({
        receiverId: userId,
        status: 'pending'
      });
      
      return {
        requests: requestsWithDetails,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Erro ao buscar solicitações de amizade:', error);
      throw error;
    }
  }

  /**
   * Envia uma solicitação de amizade
   */
  async sendFriendRequest(senderId: string, receiverId: string) {
    try {
      // Verificar se o destinatário existe
      const receiver = await this.db.collection('users').findOne({ id: receiverId });
      
      if (!receiver) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }
      
      // Verificar se já existe uma amizade ou solicitação
      const existingFriendship = await this.db.collection('friendships').findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      });
      
      if (existingFriendship) {
        if (existingFriendship.status === 'accepted') {
          return {
            success: false,
            error: 'Vocês já são amigos'
          };
        }
        
        if (existingFriendship.status === 'pending') {
          if (existingFriendship.senderId === senderId) {
            return {
              success: false,
              error: 'Você já enviou uma solicitação de amizade para este usuário'
            };
          } else {
            // O outro usuário já enviou uma solicitação, aceitar automaticamente
            return this.acceptFriendRequest(senderId, existingFriendship.id);
          }
        }
      }
      
      // Criar nova solicitação
      const friendshipId = uuidv4();
      const now = new Date();
      
      await this.db.collection('friendships').insertOne({
        id: friendshipId,
        senderId,
        receiverId,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
      
      return {
        success: true,
        message: 'Solicitação de amizade enviada com sucesso',
        friendshipId
      };
    } catch (error) {
      console.error('Erro ao enviar solicitação de amizade:', error);
      throw error;
    }
  }

  /**
   * Aceita uma solicitação de amizade
   */
  async acceptFriendRequest(userId: string, requestId: string) {
    try {
      // Buscar solicitação
      const request = await this.db.collection('friendships').findOne({
        id: requestId,
        receiverId: userId,
        status: 'pending'
      });
      
      if (!request) {
        return {
          success: false,
          error: 'Solicitação de amizade não encontrada'
        };
      }
      
      // Atualizar status
      const now = new Date();
      
      await this.db.collection('friendships').updateOne(
        { id: requestId },
        { 
          $set: { 
            status: 'accepted',
            updatedAt: now
          } 
        }
      );
      
      // Buscar informações do remetente
      const sender = await this.db.collection('users').findOne(
        { id: request.senderId },
        {
          projection: {
            id: 1,
            name: 1,
            email: 1,
            avatar: 1,
            level: 1
          }
        }
      );
      
      return {
        success: true,
        message: 'Solicitação de amizade aceita com sucesso',
        friendship: {
          ...request,
          status: 'accepted',
          updatedAt: now
        },
        friend: sender
      };
    } catch (error) {
      console.error('Erro ao aceitar solicitação de amizade:', error);
      throw error;
    }
  }

  /**
   * Rejeita uma solicitação de amizade
   */
  async rejectFriendRequest(userId: string, requestId: string) {
    try {
      // Buscar solicitação
      const request = await this.db.collection('friendships').findOne({
        id: requestId,
        receiverId: userId,
        status: 'pending'
      });
      
      if (!request) {
        return {
          success: false,
          error: 'Solicitação de amizade não encontrada'
        };
      }
      
      // Excluir solicitação
      await this.db.collection('friendships').deleteOne({ id: requestId });
      
      return {
        success: true,
        message: 'Solicitação de amizade rejeitada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao rejeitar solicitação de amizade:', error);
      throw error;
    }
  }

  /**
   * Remove uma amizade
   */
  async removeFriend(userId: string, friendId: string) {
    try {
      // Buscar amizade
      const friendship = await this.db.collection('friendships').findOne({
        $or: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ],
        status: 'accepted'
      });
      
      if (!friendship) {
        return {
          success: false,
          error: 'Amizade não encontrada'
        };
      }
      
      // Excluir amizade
      await this.db.collection('friendships').deleteOne({ id: friendship.id });
      
      return {
        success: true,
        message: 'Amizade removida com sucesso'
      };
    } catch (error) {
      console.error('Erro ao remover amizade:', error);
      throw error;
    }
  }

  /**
   * Obtém sugestões de amizade
   */
  async getFriendSuggestions(userId: string, query: string = '', page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      // Buscar amigos atuais
      const friendships = await this.db.collection('friendships').find({
        $or: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' }
        ]
      }).toArray();
      
      // Extrair IDs dos amigos
      const friendIds = friendships.map(friendship => 
        friendship.senderId === userId ? friendship.receiverId : friendship.senderId
      );
      
      // Adicionar o próprio usuário à lista de exclusão
      const excludeIds = [...friendIds, userId];
      
      // Buscar solicitações pendentes
      const pendingRequests = await this.db.collection('friendships').find({
        $or: [
          { senderId: userId, status: 'pending' },
          { receiverId: userId, status: 'pending' }
        ]
      }).toArray();
      
      // Adicionar usuários com solicitações pendentes à lista de exclusão
      pendingRequests.forEach(request => {
        if (request.senderId === userId) {
          excludeIds.push(request.receiverId);
        } else {
          excludeIds.push(request.senderId);
        }
      });
      
      // Construir filtro de busca
      const filter: any = {
        id: { $nin: excludeIds }
      };
      
      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ];
      }
      
      // Buscar usuários
      const users = await this.db.collection('users').find(filter, {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          avatar: 1,
          level: 1,
          createdAt: 1
        }
      })
      .sort({ level: -1, name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
      
      // Contar total
      const total = await this.db.collection('users').countDocuments(filter);
      
      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Erro ao buscar sugestões de amizade:', error);
      throw error;
    }
  }

  /**
   * Obtém amigos em comum com outro usuário
   */
  async getCommonFriends(userId: string, otherUserId: string, page: number = 1, limit: number = 20) {
    try {
      // Buscar amigos do usuário
      const userFriendships = await this.db.collection('friendships').find({
        $or: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' }
        ]
      }).toArray();
      
      const userFriendIds = userFriendships.map(friendship => 
        friendship.senderId === userId ? friendship.receiverId : friendship.senderId
      );
      
      // Buscar amigos do outro usuário
      const otherUserFriendships = await this.db.collection('friendships').find({
        $or: [
          { senderId: otherUserId, status: 'accepted' },
          { receiverId: otherUserId, status: 'accepted' }
        ]
      }).toArray();
      
      const otherUserFriendIds = otherUserFriendships.map(friendship => 
        friendship.senderId === otherUserId ? friendship.receiverId : friendship.senderId
      );
      
      // Encontrar amigos em comum
      const commonFriendIds = userFriendIds.filter(id => otherUserFriendIds.includes(id));
      
      // Aplicar paginação
      const skip = (page - 1) * limit;
      const paginatedIds = commonFriendIds.slice(skip, skip + limit);
      
      // Buscar informações dos amigos em comum
      const commonFriends = await this.db.collection('users').find({
        id: { $in: paginatedIds }
      }, {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          avatar: 1,
          level: 1,
          createdAt: 1
        }
      }).toArray();
      
      return {
        friends: commonFriends,
        total: commonFriendIds.length,
        page,
        limit,
        totalPages: Math.ceil(commonFriendIds.length / limit)
      };
    } catch (error) {
      console.error('Erro ao buscar amigos em comum:', error);
      throw error;
    }
  }

  /**
   * Verifica o status de amizade entre dois usuários
   */
  async getFriendshipStatus(userId: string, otherUserId: string) {
    try {
      // Buscar amizade
      const friendship = await this.db.collection('friendships').findOne({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      });
      
      if (!friendship) {
        return {
          status: 'none'
        };
      }
      
      if (friendship.status === 'accepted') {
        return {
          status: 'friends',
          since: friendship.updatedAt
        };
      }
      
      if (friendship.status === 'pending') {
        if (friendship.senderId === userId) {
          return {
            status: 'pending_sent',
            since: friendship.createdAt
          };
        } else {
          return {
            status: 'pending_received',
            since: friendship.createdAt,
            requestId: friendship.id
          };
        }
      }
      
      return {
        status: 'none'
      };
    } catch (error) {
      console.error('Erro ao verificar status de amizade:', error);
      throw error;
    }
  }
}
