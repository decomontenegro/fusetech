import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';

// Configurar rotas para leaderboard
export function setupLeaderboardRoutes(server: FastifyInstance, redis: Redis) {
  // Obter leaderboard global
  server.get('/api/leaderboard', async (request, reply) => {
    try {
      const { limit = '10', offset = '0' } = request.query as { limit?: string; offset?: string };
      
      // Em produção, buscar do banco de dados
      // Aqui estamos retornando dados mockados
      const leaderboard = [
        { userId: '1', name: 'João Silva', points: 1250, rank: 'silver', level: 5 },
        { userId: '2', name: 'Maria Oliveira', points: 980, rank: 'bronze', level: 4 },
        { userId: '3', name: 'Pedro Santos', points: 1500, rank: 'silver', level: 6 },
        { userId: '4', name: 'Ana Costa', points: 2200, rank: 'gold', level: 8 },
        { userId: '5', name: 'Carlos Souza', points: 850, rank: 'bronze', level: 3 },
        { userId: '6', name: 'Fernanda Lima', points: 1100, rank: 'silver', level: 5 },
        { userId: '7', name: 'Ricardo Alves', points: 1800, rank: 'gold', level: 7 },
        { userId: '8', name: 'Juliana Martins', points: 950, rank: 'bronze', level: 4 },
        { userId: '9', name: 'Bruno Ferreira', points: 1300, rank: 'silver', level: 5 },
        { userId: '10', name: 'Camila Rodrigues', points: 2000, rank: 'gold', level: 8 },
      ]
        .sort((a, b) => b.points - a.points)
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
      
      return { 
        data: leaderboard,
        pagination: {
          total: 10,
          limit: parseInt(limit),
          offset: parseInt(offset),
        }
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar leaderboard');
      return reply.status(500).send({ error: 'Erro ao buscar leaderboard' });
    }
  });

  // Obter posição do usuário no leaderboard
  server.get('/api/leaderboard/users/:userId', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      
      // Em produção, buscar do banco de dados
      // Aqui estamos retornando dados mockados
      const userRank = {
        userId,
        name: 'João Silva',
        points: 1250,
        rank: 'silver',
        level: 5,
        position: 3,
        totalUsers: 10,
      };
      
      return { data: userRank };
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar posição do usuário no leaderboard');
      return reply.status(500).send({ error: 'Erro ao buscar posição do usuário no leaderboard' });
    }
  });

  // Obter leaderboard por tipo (amigos, cidade, país)
  server.get('/api/leaderboard/:type', async (request, reply) => {
    try {
      const { type } = request.params as { type: string };
      const { limit = '10', offset = '0' } = request.query as { limit?: string; offset?: string };
      
      // Validar tipo
      if (!['friends', 'city', 'country'].includes(type)) {
        return reply.status(400).send({ error: 'Tipo de leaderboard inválido' });
      }
      
      // Em produção, buscar do banco de dados
      // Aqui estamos retornando dados mockados
      const leaderboard = [
        { userId: '1', name: 'João Silva', points: 1250, rank: 'silver', level: 5 },
        { userId: '2', name: 'Maria Oliveira', points: 980, rank: 'bronze', level: 4 },
        { userId: '3', name: 'Pedro Santos', points: 1500, rank: 'silver', level: 6 },
        { userId: '4', name: 'Ana Costa', points: 2200, rank: 'gold', level: 8 },
        { userId: '5', name: 'Carlos Souza', points: 850, rank: 'bronze', level: 3 },
      ]
        .sort((a, b) => b.points - a.points)
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
      
      return { 
        data: leaderboard,
        pagination: {
          total: 5,
          limit: parseInt(limit),
          offset: parseInt(offset),
        }
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar leaderboard por tipo');
      return reply.status(500).send({ error: 'Erro ao buscar leaderboard por tipo' });
    }
  });
}
