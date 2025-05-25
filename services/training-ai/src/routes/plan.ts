import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from '../services/openai';
import { phaseService } from '../services/phase';
import config from '../config';
import '../types';

// Inicializar cliente Supabase
const supabase = createClient(
  config.db.supabaseUrl,
  config.db.supabaseKey
);

export function setupPlanRoutes(server: FastifyInstance, redis: Redis) {
  /**
   * Gerar um novo plano de treino
   */
  server.post('/api/plans', {
    schema: {
      tags: ['plan'],
      summary: 'Gerar um novo plano de treino',
      description: 'Cria um novo plano de treino personalizado para o usuário',
      body: {
        type: 'object',
        required: ['userId', 'planOptions'],
        properties: {
          userId: { type: 'string' },
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
          },
          useProfile: { type: 'boolean', default: true },
          usePhasedProgression: { type: 'boolean', default: false }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            plan: { type: 'object' },
            phases: { 
              type: 'array',
              items: { type: 'object' }
            },
            phasedPlanId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        404: {
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
        const { 
          userId, 
          planOptions, 
          useProfile = true,
          usePhasedProgression = false
        } = request.body as any;
        
        // Obter perfil do usuário se solicitado
        let profile = null;
        if (useProfile) {
          const { data, error } = await supabase
            .from('sport_profiles')
            .select('*')
            .eq('userId', userId)
            .single();
            
          if (error) {
            if (error.code === 'PGRST116') {
              return reply.status(404).send({ 
                error: 'Perfil esportivo não encontrado. É necessário criar um perfil primeiro.'
              });
            }
            
            server.log.error('Erro ao buscar perfil:', error);
            return reply.status(500).send({ error: 'Falha ao buscar perfil esportivo' });
          }
          
          profile = data;
        }
        
        // Verificar se deve criar um plano em fases ou um plano único
        if (usePhasedProgression) {
          // Criar plano em fases
          const result = await phaseService.createPhasedPlan(
            userId,
            planOptions.goal,
            planOptions.primaryType,
            planOptions.duration,
            profile?.fitnessLevel
          );
          
          return {
            id: result.phases[0].id,
            userId,
            phases: result.phases,
            phasedPlanId: result.phasedPlanId,
            createdAt: result.phases[0].createdAt
          };
        } else {
          // Criar plano único tradicional
          
          // Preparar solicitação para a OpenAI
          const openAIRequest = {
            userId,
            profile: profile || {
              fitnessLevel: 'beginner',
              primarySport: planOptions.primaryType,
              goals: [planOptions.goal],
              preferences: {
                preferredExercises: [planOptions.primaryType]
              }
            },
            planOptions
          };
          
          // Gerar plano com a OpenAI
          const aiPlan = await openAIService.generateTrainingPlan(openAIRequest);
          
          // Gerar ID único para o plano
          const planId = uuidv4();
          const now = new Date().toISOString();
          
          // Preparar dados para salvar no banco
          const planData = {
            id: planId,
            userId,
            title: aiPlan.title,
            description: aiPlan.description,
            level: aiPlan.level,
            primaryType: aiPlan.primaryType,
            duration: aiPlan.duration,
            goal: aiPlan.goal,
            specificGoal: aiPlan.specificGoal,
            targetValue: planOptions.targetValue,
            targetUnit: planOptions.targetUnit,
            schedule: aiPlan.schedule,
            progressMetrics: aiPlan.progressMetrics,
            notes: aiPlan.notes,
            adaptationRules: aiPlan.adaptationRules,
            status: 'draft',
            aiGenerated: true,
            aiModel: process.env.OPENAI_MODEL || 'gpt-4',
            createdAt: now,
            updatedAt: now
          };
          
          // Salvar no banco de dados
          const { error: insertError } = await supabase
            .from('training_plans')
            .insert(planData);
            
          if (insertError) {
            server.log.error('Erro ao salvar plano:', insertError);
            return reply.status(500).send({ error: 'Falha ao salvar plano de treino' });
          }
          
          return {
            id: planId,
            userId,
            plan: aiPlan,
            createdAt: now
          };
        }
      } catch (error: any) {
        server.log.error('Erro ao gerar plano:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Avançar para a próxima fase do plano
   */
  server.post('/api/plans/:userId/:phasedPlanId/next-phase', {
    schema: {
      tags: ['plan'],
      summary: 'Avançar para próxima fase do plano',
      description: 'Conclui a fase atual e ativa a próxima fase do plano progressivo',
      params: {
        type: 'object',
        required: ['userId', 'phasedPlanId'],
        properties: {
          userId: { type: 'string' },
          phasedPlanId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            newPhase: { type: 'number' },
            plan: { 
              type: 'object',
              nullable: true
            },
            message: { type: 'string' }
          }
        },
        404: {
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
        const { userId, phasedPlanId } = request.params as { 
          userId: string; 
          phasedPlanId: string 
        };
        
        // Verificar se o plano existe
        const { data: phasedPlan, error: findError } = await supabase
          .from('phased_plans')
          .select('*')
          .eq('id', phasedPlanId)
          .eq('userId', userId)
          .single();
          
        if (findError) {
          if (findError.code === 'PGRST116') {
            return reply.status(404).send({ error: 'Plano em fases não encontrado' });
          }
          
          server.log.error('Erro ao buscar plano em fases:', findError);
          return reply.status(500).send({ error: 'Falha ao buscar plano em fases' });
        }
        
        // Verificar se já está na última fase
        if (phasedPlan.currentPhase >= phasedPlan.totalPhases) {
          return {
            success: false,
            newPhase: phasedPlan.currentPhase,
            plan: null,
            message: 'Você já completou todas as fases deste plano'
          };
        }
        
        // Avançar para a próxima fase
        const result = await phaseService.advanceToNextPhase(userId, phasedPlanId);
        
        if (result.success) {
          return {
            success: true,
            newPhase: result.newPhase,
            plan: result.plan,
            message: `Parabéns! Você avançou para a fase ${result.newPhase} de ${phasedPlan.totalPhases}`
          };
        } else {
          return {
            success: false,
            newPhase: result.newPhase,
            plan: null,
            message: 'Não foi possível avançar para a próxima fase'
          };
        }
      } catch (error: any) {
        server.log.error('Erro ao avançar fase:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Obter informações sobre o plano em fases
   */
  server.get('/api/plans/:userId/:phasedPlanId/phases', {
    schema: {
      tags: ['plan'],
      summary: 'Obter informações do plano em fases',
      description: 'Retorna informações sobre o progresso e fases do plano progressivo',
      params: {
        type: 'object',
        required: ['userId', 'phasedPlanId'],
        properties: {
          userId: { type: 'string' },
          phasedPlanId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            phasedPlan: { type: 'object' },
            phases: { 
              type: 'array',
              items: { 
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  phaseNumber: { type: 'number' },
                  phaseName: { type: 'string' },
                  title: { type: 'string' },
                  status: { type: 'string' },
                  level: { type: 'string' }
                }
              }
            },
            currentPhase: { type: 'object' }
          }
        },
        404: {
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
        const { userId, phasedPlanId } = request.params as { 
          userId: string; 
          phasedPlanId: string 
        };
        
        // Verificar cache
        const cacheKey = `phased_plan:${phasedPlanId}`;
        const cachedData = await redis.get(cacheKey);
        
        if (cachedData) {
          return JSON.parse(cachedData);
        }
        
        // Buscar informações do plano em fases
        const { data: phasedPlan, error: planError } = await supabase
          .from('phased_plans')
          .select('*')
          .eq('id', phasedPlanId)
          .eq('userId', userId)
          .single();
          
        if (planError) {
          if (planError.code === 'PGRST116') {
            return reply.status(404).send({ error: 'Plano em fases não encontrado' });
          }
          
          server.log.error('Erro ao buscar plano em fases:', planError);
          return reply.status(500).send({ error: 'Falha ao buscar plano em fases' });
        }
        
        // Buscar todas as fases do plano
        const { data: phases, error: phasesError } = await supabase
          .from('training_plans')
          .select('id, phaseNumber, phaseName, title, status, level')
          .eq('phasedPlanId', phasedPlanId)
          .eq('userId', userId)
          .order('phaseNumber', { ascending: true });
          
        if (phasesError) {
          server.log.error('Erro ao buscar fases:', phasesError);
          return reply.status(500).send({ error: 'Falha ao buscar fases do plano' });
        }
        
        // Buscar detalhes da fase atual
        const { data: currentPhase, error: currentError } = await supabase
          .from('training_plans')
          .select('*')
          .eq('phasedPlanId', phasedPlanId)
          .eq('phaseNumber', phasedPlan.currentPhase)
          .single();
          
        if (currentError) {
          server.log.error('Erro ao buscar fase atual:', currentError);
          return reply.status(500).send({ error: 'Falha ao buscar fase atual do plano' });
        }
        
        const result = {
          phasedPlan,
          phases: phases || [],
          currentPhase
        };
        
        // Salvar no cache
        await redis.set(cacheKey, JSON.stringify(result), 'EX', config.redis.cacheExpiry.plan);
        
        return result;
      } catch (error: any) {
        server.log.error('Erro ao obter plano em fases:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Listar planos de treino do usuário
   */
  server.get('/api/plans/:userId', {
    schema: {
      tags: ['plan'],
      summary: 'Listar planos de treino',
      description: 'Retorna a lista de planos de treino do usuário',
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          status: { 
            type: 'string', 
            enum: ['all', 'draft', 'active', 'completed', 'paused', 'abandoned'],
            default: 'all'
          },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            plans: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  level: { type: 'string' },
                  primaryType: { type: 'string' },
                  duration: { type: 'number' },
                  goal: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' }
                }
              }
            },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' }
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
        const { userId } = request.params as { userId: string };
        const { status = 'all', limit = 10, offset = 0 } = request.query as any;
        
        // Construir query
        let query = supabase
          .from('training_plans')
          .select('id, title, description, level, primaryType, duration, goal, status, createdAt, updatedAt, startDate, endDate', { count: 'exact' })
          .eq('userId', userId)
          .order('createdAt', { ascending: false })
          .range(offset, offset + limit - 1);
          
        // Aplicar filtro de status se não for 'all'
        if (status !== 'all') {
          query = query.eq('status', status);
        }
        
        // Executar query
        const { data: plans, count, error } = await query;
        
        if (error) {
          server.log.error('Erro ao listar planos:', error);
          return reply.status(500).send({ error: 'Falha ao listar planos de treino' });
        }
        
        return {
          plans: plans || [],
          total: count || 0,
          limit,
          offset
        };
      } catch (error: any) {
        server.log.error('Erro ao listar planos:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Obter detalhes de um plano de treino
   */
  server.get('/api/plans/:userId/:planId', {
    schema: {
      tags: ['plan'],
      summary: 'Obter plano de treino',
      description: 'Retorna os detalhes completos de um plano de treino',
      params: {
        type: 'object',
        required: ['userId', 'planId'],
        properties: {
          userId: { type: 'string' },
          planId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object'
        },
        404: {
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
        const { userId, planId } = request.params as { userId: string; planId: string };
        
        // Verificar cache
        const cacheKey = `training_plan:${planId}`;
        const cachedPlan = await redis.get(cacheKey);
        
        if (cachedPlan) {
          return JSON.parse(cachedPlan);
        }
        
        // Buscar do banco de dados
        const { data: plan, error } = await supabase
          .from('training_plans')
          .select('*')
          .eq('id', planId)
          .eq('userId', userId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return reply.status(404).send({ error: 'Plano de treino não encontrado' });
          }
          
          server.log.error('Erro ao buscar plano:', error);
          return reply.status(500).send({ error: 'Falha ao buscar plano de treino' });
        }
        
        // Salvar no cache por 1 hora
        await redis.set(cacheKey, JSON.stringify(plan), 'EX', 3600);
        
        return plan;
      } catch (error: any) {
        server.log.error('Erro ao obter plano:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Atualizar status de um plano de treino
   */
  server.patch('/api/plans/:userId/:planId/status', {
    schema: {
      tags: ['plan'],
      summary: 'Atualizar status do plano',
      description: 'Atualiza o status de um plano de treino (ex: ativar, pausar, concluir)',
      params: {
        type: 'object',
        required: ['userId', 'planId'],
        properties: {
          userId: { type: 'string' },
          planId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { 
            type: 'string',
            enum: ['draft', 'active', 'completed', 'paused', 'abandoned']
          },
          startDate: { 
            type: 'string', 
            format: 'date-time' 
          },
          endDate: { 
            type: 'string', 
            format: 'date-time' 
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            plan: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                status: { type: 'string' },
                updatedAt: { type: 'string', format: 'date-time' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        404: {
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
        const { userId, planId } = request.params as { userId: string; planId: string };
        const { status, startDate, endDate } = request.body as any;
        
        // Verificar se o plano existe
        const { data: existingPlan, error: findError } = await supabase
          .from('training_plans')
          .select('status')
          .eq('id', planId)
          .eq('userId', userId)
          .single();
          
        if (findError) {
          if (findError.code === 'PGRST116') {
            return reply.status(404).send({ error: 'Plano de treino não encontrado' });
          }
          
          server.log.error('Erro ao buscar plano:', findError);
          return reply.status(500).send({ error: 'Falha ao buscar plano de treino' });
        }
        
        // Preparar dados para atualização
        const updateData: any = {
          status,
          updatedAt: new Date().toISOString()
        };
        
        // Adicionar datas se fornecidas
        if (status === 'active' && !startDate) {
          updateData.startDate = new Date().toISOString();
        } else if (startDate) {
          updateData.startDate = startDate;
        }
        
        if (endDate) {
          updateData.endDate = endDate;
        } else if (status === 'completed' && !endDate) {
          updateData.endDate = new Date().toISOString();
        }
        
        // Atualizar no banco de dados
        const { data: updatedPlan, error: updateError } = await supabase
          .from('training_plans')
          .update(updateData)
          .eq('id', planId)
          .eq('userId', userId)
          .select('id, status, updatedAt, startDate, endDate')
          .single();
          
        if (updateError) {
          server.log.error('Erro ao atualizar status:', updateError);
          return reply.status(500).send({ error: 'Falha ao atualizar status do plano' });
        }
        
        // Invalidar cache
        const cacheKey = `training_plan:${planId}`;
        await redis.del(cacheKey);
        
        return {
          success: true,
          plan: updatedPlan
        };
      } catch (error: any) {
        server.log.error('Erro ao atualizar status:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Marcar treino como concluído
   */
  server.post('/api/plans/:userId/:planId/complete-workout', {
    schema: {
      tags: ['plan'],
      summary: 'Marcar treino como concluído',
      description: 'Marca um treino específico como concluído no plano',
      params: {
        type: 'object',
        required: ['userId', 'planId'],
        properties: {
          userId: { type: 'string' },
          planId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['day', 'workoutIndex', 'effortLevel'],
        properties: {
          day: { type: 'number' },
          workoutIndex: { type: 'number' },
          actualDistance: { type: 'number' },
          actualDuration: { type: 'number' },
          perceivedExertion: { type: 'number', minimum: 1, maximum: 10 },
          effortLevel: { type: 'number', minimum: 1, maximum: 100 },
          notes: { type: 'string' },
          feedback: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            tokens: { type: 'number' }
          }
        },
        404: {
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
        const { userId, planId } = request.params as { userId: string; planId: string };
        const { 
          day, 
          workoutIndex, 
          actualDistance,
          actualDuration, 
          perceivedExertion,
          effortLevel,
          notes,
          feedback
        } = request.body as any;
        
        // Buscar plano atual
        const { data: plan, error: findError } = await supabase
          .from('training_plans')
          .select('*')
          .eq('id', planId)
          .eq('userId', userId)
          .single();
          
        if (findError) {
          if (findError.code === 'PGRST116') {
            return reply.status(404).send({ error: 'Plano de treino não encontrado' });
          }
          
          server.log.error('Erro ao buscar plano:', findError);
          return reply.status(500).send({ error: 'Falha ao buscar plano de treino' });
        }
        
        // Verificar se o dia e treino existem
        if (!plan.schedule || 
            !plan.schedule[day] || 
            !plan.schedule[day].workouts || 
            !plan.schedule[day].workouts[workoutIndex]) {
          return reply.status(404).send({ error: 'Treino não encontrado no plano' });
        }
        
        // Atualizar o treino
        const now = new Date().toISOString();
        const schedule = [...plan.schedule];
        schedule[day] = {
          ...schedule[day],
          workouts: [...schedule[day].workouts]
        };
        
        schedule[day].workouts[workoutIndex] = {
          ...schedule[day].workouts[workoutIndex],
          completed: true,
          completedAt: now,
          actualDistance,
          actualDuration,
          perceivedExertion,
          effortScore: effortLevel,
          userNotes: notes,
          userFeedback: feedback
        };
        
        // Atualizar plano no banco de dados
        const { error: updateError } = await supabase
          .from('training_plans')
          .update({
            schedule,
            updatedAt: now
          })
          .eq('id', planId)
          .eq('userId', userId);
          
        if (updateError) {
          server.log.error('Erro ao atualizar treino:', updateError);
          return reply.status(500).send({ error: 'Falha ao marcar treino como concluído' });
        }
        
        // Invalidar cache
        const cacheKey = `training_plan:${planId}`;
        await redis.del(cacheKey);
        
        // Calcular tokens baseado no esforço
        const baseTokens = 10;
        const effortMultiplier = effortLevel / 50; // Normaliza para um multiplicador entre 0-2
        const tokens = Math.round(baseTokens * (1 + effortMultiplier));
        
        // Registrar atividade para recompensa de tokens
        // Em uma implementação real, chamaríamos o token-service aqui
        // await tokenService.rewardForActivity(userId, tokens, 'training_completion');
        
        return {
          success: true,
          tokens
        };
      } catch (error: any) {
        server.log.error('Erro ao concluir treino:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
} 