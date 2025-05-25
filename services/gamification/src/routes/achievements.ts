import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { z } from 'zod';

// Schema para validação de conquistas
const achievementSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['distance', 'activity_count', 'social_posts', 'streak', 'level']),
  threshold: z.number(),
  reward: z.number(),
  icon: z.string().optional(),
  isSecret: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export type Achievement = z.infer<typeof achievementSchema>;

// Configurar rotas para conquistas
export function setupAchievementsRoutes(server: FastifyInstance, redis: Redis) {
  // Listar todas as conquistas
  server.get('/api/achievements', async (request, reply) => {
    try {
      // Em produção, buscar do banco de dados
      // Aqui estamos retornando dados mockados
      const achievements: Achievement[] = [
        {
          id: '1',
          title: 'Primeiro Passo',
          description: 'Complete sua primeira atividade física',
          type: 'activity_count',
          threshold: 1,
          reward: 100,
          icon: 'trophy',
          isSecret: false,
        },
        {
          id: '2',
          title: 'Maratonista',
          description: 'Acumule 42km de corrida',
          type: 'distance',
          threshold: 42000, // 42km em metros
          reward: 500,
          icon: 'medal',
          isSecret: false,
        },
        {
          id: '3',
          title: 'Influencer',
          description: 'Faça 10 posts sobre suas atividades',
          type: 'social_posts',
          threshold: 10,
          reward: 300,
          icon: 'star',
          isSecret: false,
        },
      ];
      
      return { data: achievements };
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar conquistas');
      return reply.status(500).send({ error: 'Erro ao buscar conquistas' });
    }
  });

  // Obter conquista por ID
  server.get('/api/achievements/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      // Em produção, buscar do banco de dados
      // Aqui estamos retornando dados mockados
      const achievement: Achievement = {
        id,
        title: 'Primeiro Passo',
        description: 'Complete sua primeira atividade física',
        type: 'activity_count',
        threshold: 1,
        reward: 100,
        icon: 'trophy',
        isSecret: false,
      };
      
      return { data: achievement };
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar conquista');
      return reply.status(500).send({ error: 'Erro ao buscar conquista' });
    }
  });

  // Listar conquistas do usuário
  server.get('/api/users/:userId/achievements', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      
      // Em produção, buscar do banco de dados
      // Aqui estamos retornando dados mockados
      const userAchievements = [
        {
          id: '1',
          achievementId: '1',
          userId,
          unlockedAt: new Date().toISOString(),
          rewardClaimed: true,
        },
        {
          id: '2',
          achievementId: '3',
          userId,
          unlockedAt: new Date().toISOString(),
          rewardClaimed: false,
        },
      ];
      
      return { data: userAchievements };
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar conquistas do usuário');
      return reply.status(500).send({ error: 'Erro ao buscar conquistas do usuário' });
    }
  });

  // Criar nova conquista
  server.post('/api/achievements', async (request, reply) => {
    try {
      const achievement = achievementSchema.parse(request.body);
      
      // Em produção, salvar no banco de dados
      // Aqui estamos apenas simulando
      const newAchievement: Achievement = {
        ...achievement,
        id: Math.random().toString(36).substring(2, 9),
      };
      
      return { data: newAchievement };
    } catch (error) {
      server.log.error({ error }, 'Erro ao criar conquista');
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors });
      }
      
      return reply.status(500).send({ error: 'Erro ao criar conquista' });
    }
  });
}
