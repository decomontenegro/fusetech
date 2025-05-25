import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { openAIService } from '../services/openai';
import { OpenAIPlanRequest } from '../types';

export function setupOpenAIRoutes(server: FastifyInstance, redis: Redis) {
  /**
   * Gerar um plano de treino usando a OpenAI
   */
  server.post('/api/openai/generate-plan', {
    schema: {
      tags: ['openai'],
      summary: 'Gerar um plano de treino personalizado',
      description: 'Utiliza a API da OpenAI para gerar um plano de treino personalizado baseado nos dados do usuário',
      body: {
        type: 'object',
        required: ['userId', 'profile', 'planOptions'],
        properties: {
          userId: { type: 'string' },
          profile: {
            type: 'object',
            required: ['fitnessLevel', 'primarySport', 'goals', 'preferences'],
            properties: {
              fitnessLevel: { type: 'string' },
              primarySport: { type: 'string' },
              goals: { type: 'array', items: { type: 'string' } },
              specificGoals: { type: 'array', items: { type: 'string' } },
              preferences: {
                type: 'object',
                required: ['preferredExercises'],
                properties: {
                  preferredExercises: { type: 'array', items: { type: 'string' } },
                  preferredDayTime: { type: 'string' },
                  preferredDuration: { type: 'number' },
                  preferredFrequency: { type: 'number' },
                  outdoorPreference: { type: 'number' }
                }
              },
              healthMetrics: {
                type: 'object',
                properties: {
                  height: { type: 'number' },
                  weight: { type: 'number' },
                  restingHeartRate: { type: 'number' },
                  maxHeartRate: { type: 'number' },
                  limitations: { type: 'array', items: { type: 'string' } }
                }
              },
              personalRecords: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    value: { type: 'number' },
                    date: { type: 'string', format: 'date-time' }
                  }
                }
              },
              experienceYears: { type: 'number' }
            }
          },
          planOptions: {
            type: 'object',
            required: ['duration', 'goal', 'primaryType'],
            properties: {
              duration: { type: 'number' },
              goal: { type: 'string' },
              primaryType: { type: 'string' },
              targetValue: { type: 'number' },
              targetUnit: { type: 'string' }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            plan: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                level: { type: 'string' },
                primaryType: { type: 'string' },
                duration: { type: 'number' },
                goal: { type: 'string' },
                schedule: { type: 'array' },
                progressMetrics: { type: 'array' },
                notes: { type: 'array' },
                adaptationRules: { type: 'array' }
              }
            },
            cacheHit: { type: 'boolean' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const planRequest = request.body as OpenAIPlanRequest;
        
        // Verificar se há uma versão em cache
        const cacheKey = `training-plan:${planRequest.userId}:${JSON.stringify(planRequest)}`;
        const cachedPlan = await redis.get(cacheKey);
        
        if (cachedPlan) {
          return {
            plan: JSON.parse(cachedPlan),
            cacheHit: true
          };
        }
        
        // Gerar novo plano
        const plan = await openAIService.generateTrainingPlan(planRequest);
        
        // Salvar no cache por 24 horas
        await redis.set(cacheKey, JSON.stringify(plan), 'EX', 86400);
        
        return {
          plan,
          cacheHit: false
        };
      } catch (error: any) {
        server.log.error('Erro ao gerar plano:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Adaptar um plano existente com base no feedback
   */
  server.post('/api/openai/adapt-plan', {
    schema: {
      tags: ['openai'],
      summary: 'Adaptar um plano de treino existente',
      description: 'Ajusta um plano de treino existente com base no feedback e resultados recentes',
      body: {
        type: 'object',
        required: ['originalPlan', 'userFeedback'],
        properties: {
          originalPlan: { type: 'object' },
          userFeedback: { type: 'string' },
          recentPerformance: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            plan: { type: 'object' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const { originalPlan, userFeedback, recentPerformance } = request.body as any;
        
        if (!originalPlan || !userFeedback) {
          return reply.status(400).send({ 
            error: 'Plano original e feedback do usuário são obrigatórios' 
          });
        }
        
        const adaptedPlan = await openAIService.adaptTrainingPlan(
          originalPlan,
          userFeedback,
          recentPerformance || {}
        );
        
        return { plan: adaptedPlan };
      } catch (error: any) {
        server.log.error('Erro ao adaptar plano:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
} 