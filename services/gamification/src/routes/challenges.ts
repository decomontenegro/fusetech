import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { z } from 'zod';

// Schema para validação de desafios
const challengeSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['distance', 'activity_count', 'social_posts', 'streak']),
  target: z.number(),
  reward: z.number(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().default(true),
  requiredLevel: z.number().default(0),
  metadata: z.record(z.any()).optional(),
});

export type Challenge = z.infer<typeof challengeSchema>;

// Configurar rotas para desafios
export function setupChallengesRoutes(server: FastifyInstance, redis: Redis) {
  // Listar todos os desafios
  server.get('/api/challenges', {
    schema: {
      tags: ['challenges'],
      summary: 'Lista todos os desafios disponíveis',
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', default: 10 },
          offset: { type: 'integer', default: 0 },
          status: { type: 'string', enum: ['active', 'completed', 'upcoming'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  type: { type: 'string' },
                  target: { type: 'number' },
                  reward: { type: 'number' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  isActive: { type: 'boolean' },
                  requiredLevel: { type: 'number' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                limit: { type: 'number' },
                offset: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Em produção, buscar do banco de dados
      // Aqui estamos retornando dados mockados
      const challenges: Challenge[] = [
        {
          id: '1',
          title: 'Corredor Iniciante',
          description: 'Complete 50km de corrida em 30 dias',
          type: 'distance',
          target: 50000, // 50km em metros
          reward: 500,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          requiredLevel: 0,
        },
        {
          id: '2',
          title: 'Compartilhador Social',
          description: 'Compartilhe 5 posts sobre suas atividades',
          type: 'social_posts',
          target: 5,
          reward: 300,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          requiredLevel: 0,
        },
      ];

      return {
        data: challenges,
        pagination: {
          total: challenges.length,
          limit: 10,
          offset: 0
        }
      };
    } catch (error) {
      const { handleError, createError } = await import('../utils/errorHandler');
      return handleError(
        createError.internal('Erro ao buscar desafios', error),
        reply
      );
    }
  });

  // Obter desafio por ID
  server.get('/api/challenges/:id', {
    schema: {
      tags: ['challenges'],
      summary: 'Obtém um desafio pelo ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string' },
                target: { type: 'number' },
                reward: { type: 'number' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                isActive: { type: 'boolean' },
                requiredLevel: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // Em produção, buscar do banco de dados
      // Aqui estamos retornando dados mockados
      const challenge: Challenge = {
        id,
        title: 'Corredor Iniciante',
        description: 'Complete 50km de corrida em 30 dias',
        type: 'distance',
        target: 50000, // 50km em metros
        reward: 500,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        requiredLevel: 0,
      };

      // Simular desafio não encontrado
      if (id === '999') {
        const { handleError, createError } = await import('../utils/errorHandler');
        return handleError(
          createError.notFound(`Desafio com ID ${id} não encontrado`),
          reply
        );
      }

      return { data: challenge };
    } catch (error) {
      const { handleError, createError } = await import('../utils/errorHandler');
      return handleError(
        createError.internal('Erro ao buscar desafio', error),
        reply
      );
    }
  });

  // Criar novo desafio
  server.post('/api/challenges', {
    schema: {
      tags: ['challenges'],
      summary: 'Cria um novo desafio',
      body: {
        type: 'object',
        required: ['title', 'description', 'type', 'target', 'reward', 'startDate', 'endDate'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['distance', 'activity_count', 'social_posts', 'streak'] },
          target: { type: 'number' },
          reward: { type: 'number' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean', default: true },
          requiredLevel: { type: 'number', default: 0 },
          metadata: { type: 'object', additionalProperties: true }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string' },
                target: { type: 'number' },
                reward: { type: 'number' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                isActive: { type: 'boolean' },
                requiredLevel: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const challenge = challengeSchema.parse(request.body);

      // Em produção, salvar no banco de dados
      // Aqui estamos apenas simulando
      const newChallenge: Challenge = {
        ...challenge,
        id: Math.random().toString(36).substring(2, 9),
      };

      return reply.status(201).send({ data: newChallenge });
    } catch (error) {
      const { handleError, createError } = await import('../utils/errorHandler');

      if (error instanceof z.ZodError) {
        return handleError(
          createError.validation('Dados inválidos para criação de desafio', error.errors),
          reply
        );
      }

      return handleError(
        createError.internal('Erro ao criar desafio', error),
        reply
      );
    }
  });

  // Atualizar desafio
  server.put('/api/challenges/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const challenge = challengeSchema.parse(request.body);

      // Em produção, atualizar no banco de dados
      // Aqui estamos apenas simulando
      const updatedChallenge: Challenge = {
        ...challenge,
        id,
      };

      return { data: updatedChallenge };
    } catch (error) {
      server.log.error({ error }, 'Erro ao atualizar desafio');

      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors });
      }

      return reply.status(500).send({ error: 'Erro ao atualizar desafio' });
    }
  });

  // Excluir desafio
  server.delete('/api/challenges/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // Em produção, excluir do banco de dados
      // Aqui estamos apenas simulando

      return { success: true };
    } catch (error) {
      server.log.error({ error }, 'Erro ao excluir desafio');
      return reply.status(500).send({ error: 'Erro ao excluir desafio' });
    }
  });
}
