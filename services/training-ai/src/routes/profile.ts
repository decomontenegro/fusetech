import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export function setupProfileRoutes(server: FastifyInstance, redis: Redis) {
  /**
   * Criar ou atualizar perfil esportivo
   */
  server.post('/api/profiles', {
    schema: {
      tags: ['profile'],
      summary: 'Criar ou atualizar perfil esportivo',
      description: 'Salva ou atualiza as informações de perfil esportivo de um usuário',
      body: {
        type: 'object',
        required: ['userId', 'fitnessLevel', 'primarySport', 'goals', 'preferences'],
        properties: {
          userId: { type: 'string' },
          fitnessLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'elite'] },
          primarySport: { type: 'string' },
          secondarySports: { type: 'array', items: { type: 'string' } },
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
              vo2Max: { type: 'number' },
              limitations: { type: 'array', items: { type: 'string' } },
              conditions: { type: 'array', items: { type: 'string' } }
            }
          },
          personalRecords: {
            type: 'array',
            items: {
              type: 'object',
              required: ['type', 'value', 'date'],
              properties: {
                type: { type: 'string' },
                value: { type: 'number' },
                date: { type: 'string', format: 'date-time' }
              }
            }
          },
          experienceYears: { type: 'number' },
          weeklyActiveMinutes: { type: 'number' },
          weeklyDistance: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
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
        const profile = request.body as any;
        
        // Validar dados básicos
        if (!profile.userId || !profile.fitnessLevel || !profile.primarySport) {
          return reply.status(400).send({ 
            error: 'Dados obrigatórios do perfil estão faltando'
          });
        }
        
        // Adicionar timestamps
        const now = new Date().toISOString();
        const data = {
          ...profile,
          updatedAt: now
        };
        
        // Verificar se o perfil já existe
        const { data: existingProfile, error: findError } = await supabase
          .from('sport_profiles')
          .select('id')
          .eq('userId', profile.userId)
          .single();
        
        let result;
        
        if (existingProfile) {
          // Atualizar perfil existente
          const { data: updatedProfile, error: updateError } = await supabase
            .from('sport_profiles')
            .update(data)
            .eq('userId', profile.userId)
            .select()
            .single();
          
          if (updateError) {
            server.log.error('Erro ao atualizar perfil:', updateError);
            return reply.status(500).send({ error: 'Falha ao atualizar perfil esportivo' });
          }
          
          result = updatedProfile;
        } else {
          // Criar novo perfil
          data.createdAt = now;
          
          const { data: newProfile, error: insertError } = await supabase
            .from('sport_profiles')
            .insert(data)
            .select()
            .single();
          
          if (insertError) {
            server.log.error('Erro ao criar perfil:', insertError);
            return reply.status(500).send({ error: 'Falha ao criar perfil esportivo' });
          }
          
          result = newProfile;
        }
        
        // Invalidar cache relacionado
        const cacheKey = `sport_profile:${profile.userId}`;
        await redis.del(cacheKey);
        
        return result;
      } catch (error: any) {
        server.log.error('Erro ao salvar perfil esportivo:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Obter perfil esportivo de um usuário
   */
  server.get('/api/profiles/:userId', {
    schema: {
      tags: ['profile'],
      summary: 'Obter perfil esportivo',
      description: 'Retorna os dados do perfil esportivo de um usuário',
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            fitnessLevel: { type: 'string' },
            primarySport: { type: 'string' },
            secondarySports: { type: 'array', items: { type: 'string' } },
            goals: { type: 'array', items: { type: 'string' } },
            specificGoals: { type: 'array', items: { type: 'string' } },
            preferences: { type: 'object' },
            healthMetrics: { type: 'object' },
            personalRecords: { type: 'array' },
            experienceYears: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
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
        const { userId } = request.params as { userId: string };
        
        // Verificar cache
        const cacheKey = `sport_profile:${userId}`;
        const cachedProfile = await redis.get(cacheKey);
        
        if (cachedProfile) {
          return JSON.parse(cachedProfile);
        }
        
        // Buscar do banco de dados
        const { data: profile, error } = await supabase
          .from('sport_profiles')
          .select('*')
          .eq('userId', userId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            return reply.status(404).send({ error: 'Perfil esportivo não encontrado' });
          }
          
          server.log.error('Erro ao buscar perfil:', error);
          return reply.status(500).send({ error: 'Falha ao buscar perfil esportivo' });
        }
        
        // Salvar no cache por 1 hora
        await redis.set(cacheKey, JSON.stringify(profile), 'EX', 3600);
        
        return profile;
      } catch (error: any) {
        server.log.error('Erro ao obter perfil esportivo:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Adicionar um novo recorde pessoal
   */
  server.post('/api/profiles/:userId/records', {
    schema: {
      tags: ['profile'],
      summary: 'Adicionar recorde pessoal',
      description: 'Adiciona um novo recorde pessoal ao perfil do usuário',
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['type', 'value', 'date'],
        properties: {
          type: { type: 'string' },
          value: { type: 'number' },
          date: { type: 'string', format: 'date-time' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            record: { 
              type: 'object',
              properties: {
                type: { type: 'string' },
                value: { type: 'number' },
                date: { type: 'string', format: 'date-time' }
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
        const { userId } = request.params as { userId: string };
        const newRecord = request.body as any;
        
        // Buscar perfil atual
        const { data: profile, error: findError } = await supabase
          .from('sport_profiles')
          .select('personalRecords')
          .eq('userId', userId)
          .single();
        
        if (findError) {
          if (findError.code === 'PGRST116') {
            return reply.status(404).send({ error: 'Perfil esportivo não encontrado' });
          }
          
          server.log.error('Erro ao buscar perfil:', findError);
          return reply.status(500).send({ error: 'Falha ao buscar perfil esportivo' });
        }
        
        // Adicionar novo recorde
        const records = profile.personalRecords || [];
        records.push(newRecord);
        
        // Atualizar perfil
        const { error: updateError } = await supabase
          .from('sport_profiles')
          .update({
            personalRecords: records,
            updatedAt: new Date().toISOString()
          })
          .eq('userId', userId);
        
        if (updateError) {
          server.log.error('Erro ao atualizar recordes:', updateError);
          return reply.status(500).send({ error: 'Falha ao adicionar recorde pessoal' });
        }
        
        // Invalidar cache
        const cacheKey = `sport_profile:${userId}`;
        await redis.del(cacheKey);
        
        return {
          success: true,
          record: newRecord
        };
      } catch (error: any) {
        server.log.error('Erro ao adicionar recorde:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
} 