import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { effortService } from '../services/effort';
import config from '../config';

export function setupEffortRoutes(server: FastifyInstance, redis: Redis) {
  /**
   * Calcular recompensa baseada no esforço
   */
  server.post('/api/effort/calculate', {
    schema: {
      tags: ['effort'],
      summary: 'Calcular recompensa baseada no esforço',
      description: 'Calcula a recompensa de tokens para uma atividade com base no esforço relativo do usuário',
      body: {
        type: 'object',
        required: ['userId', 'activityId', 'activityType', 'effortMetrics'],
        properties: {
          userId: { type: 'string' },
          activityId: { type: 'string' },
          activityType: { type: 'string', enum: ['running', 'cycling', 'walking', 'swimming', 'strength', 'hiit', 'yoga', 'other'] },
          effortMetrics: {
            type: 'object',
            required: ['absoluteEffort'],
            properties: {
              absoluteEffort: { type: 'number', minimum: 0, maximum: 100 },
              perceivedExertion: { type: 'number', minimum: 0, maximum: 10 },
              heartRateData: {
                type: 'object',
                properties: {
                  average: { type: 'number' },
                  max: { type: 'number' },
                  timeInZones: { type: 'object' }
                }
              },
              contextualFactors: {
                type: 'object',
                properties: {
                  terrain: { type: 'string' },
                  weather: { type: 'string' },
                  altitude: { type: 'number' },
                  sleep: { type: 'number' },
                  recovery: { type: 'number' }
                }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            calculatedReward: { type: 'number' },
            baseReward: { type: 'number' },
            effortMultiplier: { type: 'number' },
            relativeEffort: { type: 'number' },
            userId: { type: 'string' },
            activityId: { type: 'string' }
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
        const { userId, activityId, activityType, effortMetrics } = request.body as any;
        
        // Calcular esforço e recompensa
        const effortResult = await effortService.calculateEffort(
          userId,
          activityId,
          activityType,
          effortMetrics
        );
        
        // Salvar o cálculo no banco de dados
        await effortService.saveEffortCalculation(effortResult);
        
        // Retornar resultado para o cliente
        return {
          calculatedReward: effortResult.calculatedReward,
          baseReward: effortResult.baseReward,
          effortMultiplier: effortResult.effortMultiplier,
          relativeEffort: effortResult.effortMetrics.relativeEffort,
          userId,
          activityId
        };
      } catch (error: any) {
        server.log.error('Erro ao calcular esforço:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Obter histórico de métricas de esforço de um usuário
   */
  server.get('/api/effort/:userId', {
    schema: {
      tags: ['effort'],
      summary: 'Obter histórico de esforço',
      description: 'Retorna o histórico de métricas de esforço para as atividades de um usuário',
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
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            efforts: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  activityId: { type: 'string' },
                  effortMetrics: { type: 'object' },
                  calculatedReward: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            total: { type: 'number' },
            averageEffort: { type: 'number' },
            totalRewards: { type: 'number' }
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
        const { 
          limit = 20, 
          offset = 0,
          startDate,
          endDate
        } = request.query as any;
        
        // Verificar cache para resultados frequentes
        const cacheKey = `effort_history:${userId}:${limit}:${offset}:${startDate}:${endDate}`;
        const cachedResult = await redis.get(cacheKey);
        
        if (cachedResult) {
          return JSON.parse(cachedResult);
        }
        
        // Buscar histórico no banco de dados
        const { efforts, total } = await effortService.getUserEffortHistory(
          userId, 
          limit, 
          offset, 
          startDate, 
          endDate
        );
        
        // Calcular estatísticas
        let totalEffort = 0;
        let totalRewards = 0;
        
        if (efforts.length > 0) {
          efforts.forEach(effort => {
            totalEffort += effort.effortMetrics.relativeEffort || 0;
            totalRewards += effort.calculatedReward || 0;
          });
        }
        
        const result = {
          efforts,
          total,
          averageEffort: efforts.length > 0 ? totalEffort / efforts.length : 0,
          totalRewards
        };
        
        // Salvar no cache
        await redis.set(
          cacheKey, 
          JSON.stringify(result), 
          'EX', 
          config.redis.cacheExpiry.effort
        );
        
        return result;
      } catch (error: any) {
        server.log.error('Erro ao buscar histórico:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
  
  /**
   * Obter tendências de esforço e progresso
   */
  server.get('/api/effort/:userId/trends', {
    schema: {
      tags: ['effort'],
      summary: 'Obter tendências de esforço',
      description: 'Retorna análise de tendências de esforço e progresso ao longo do tempo',
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
          period: { 
            type: 'string', 
            enum: ['week', 'month', '3months', '6months', 'year'],
            default: 'month'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            trend: { type: 'string', enum: ['improving', 'maintaining', 'declining'] },
            effortTrend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date' },
                  avgEffort: { type: 'number' },
                  count: { type: 'number' }
                }
              }
            },
            periodComparison: {
              type: 'object',
              properties: {
                currentPeriod: {
                  type: 'object',
                  properties: {
                    avgEffort: { type: 'number' },
                    totalActivities: { type: 'number' },
                    totalRewards: { type: 'number' }
                  }
                },
                previousPeriod: {
                  type: 'object',
                  properties: {
                    avgEffort: { type: 'number' },
                    totalActivities: { type: 'number' },
                    totalRewards: { type: 'number' }
                  }
                },
                effortChange: { type: 'number' }, // Porcentagem
                activityChange: { type: 'number' }, // Porcentagem
                rewardChange: { type: 'number' } // Porcentagem
              }
            }
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
        const { period = 'month' } = request.query as any;
        
        // Calcular datas de início e fim para o período atual
        const endDate = new Date();
        const startDate = getStartDateForPeriod(endDate, period);
        
        // Calcular datas para o período anterior
        const previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        const previousStartDate = getStartDateForPeriod(previousEndDate, period);
        
        // Buscar dados para o período atual
        const { efforts: currentData } = await effortService.getUserEffortHistory(
          userId, 
          1000, // Limite alto para buscar todos os dados do período
          0, 
          startDate.toISOString(), 
          endDate.toISOString()
        );
        
        // Buscar dados para o período anterior
        const { efforts: previousData } = await effortService.getUserEffortHistory(
          userId, 
          1000, // Limite alto para buscar todos os dados do período
          0, 
          previousStartDate.toISOString(), 
          previousEndDate.toISOString()
        );
        
        // Calcular estatísticas para o período atual
        const currentPeriod = calculatePeriodStats(currentData);
        
        // Calcular estatísticas para o período anterior
        const previousPeriod = calculatePeriodStats(previousData);
        
        // Calcular mudanças percentuais
        const effortChange = previousPeriod.avgEffort > 0 
          ? ((currentPeriod.avgEffort - previousPeriod.avgEffort) / previousPeriod.avgEffort) * 100 
          : 100;
          
        const activityChange = previousPeriod.totalActivities > 0 
          ? ((currentPeriod.totalActivities - previousPeriod.totalActivities) / previousPeriod.totalActivities) * 100 
          : 100;
          
        const rewardChange = previousPeriod.totalRewards > 0 
          ? ((currentPeriod.totalRewards - previousPeriod.totalRewards) / previousPeriod.totalRewards) * 100 
          : 100;
        
        // Determinar tendência geral
        let trend = 'maintaining';
        if (effortChange > 5 && activityChange >= 0) {
          trend = 'improving';
        } else if (effortChange < -5 || activityChange < -10) {
          trend = 'declining';
        }
        
        // Gerar dados de tendência para gráfico
        const effortTrend = generateEffortTrendData(
          [...previousData, ...currentData],
          period
        );
        
        // Retornar resultado
        return {
          trend,
          effortTrend,
          periodComparison: {
            currentPeriod,
            previousPeriod,
            effortChange,
            activityChange,
            rewardChange
          }
        };
      } catch (error: any) {
        server.log.error('Erro ao buscar tendências:', error);
        reply.status(500).send({ error: error.message });
      }
    }
  });
}

/**
 * Calcula a data de início com base no período
 */
function getStartDateForPeriod(endDate: Date, period: string): Date {
  const result = new Date(endDate);
  
  switch (period) {
    case 'week':
      result.setDate(result.getDate() - 7);
      break;
    case 'month':
      result.setMonth(result.getMonth() - 1);
      break;
    case '3months':
      result.setMonth(result.getMonth() - 3);
      break;
    case '6months':
      result.setMonth(result.getMonth() - 6);
      break;
    case 'year':
      result.setFullYear(result.getFullYear() - 1);
      break;
  }
  
  return result;
}

/**
 * Calcula estatísticas para um período
 */
function calculatePeriodStats(data: any[]) {
  let totalEffort = 0;
  let totalRewards = 0;
  
  data.forEach(item => {
    totalEffort += item.effortMetrics?.relativeEffort || 0;
    totalRewards += item.calculatedReward || 0;
  });
  
  return {
    avgEffort: data.length > 0 ? totalEffort / data.length : 0,
    totalActivities: data.length,
    totalRewards
  };
}

/**
 * Gera dados de tendência para gráfico
 */
function generateEffortTrendData(data: any[], period: string) {
  // Agrupar por data
  const groups: Record<string, { totalEffort: number, count: number }> = {};
  
  data.forEach(item => {
    const date = new Date(item.createdAt);
    const key = formatDateByPeriod(date, period);
    
    if (!groups[key]) {
      groups[key] = { totalEffort: 0, count: 0 };
    }
    
    groups[key].totalEffort += item.effortMetrics?.relativeEffort || 0;
    groups[key].count += 1;
  });
  
  // Converter para array e calcular médias
  return Object.keys(groups).sort().map(date => ({
    date,
    avgEffort: groups[date].count > 0 ? groups[date].totalEffort / groups[date].count : 0,
    count: groups[date].count
  }));
}

/**
 * Formata a data com base no período
 */
function formatDateByPeriod(date: Date, period: string): string {
  // YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  switch (period) {
    case 'week':
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    case 'month':
      return `${year}-${month}-${Math.floor(date.getDate() / 7) + 1}`;  // Semana do mês
    case '3months':
    case '6months':
      return `${year}-${month}`;  // Mês
    case 'year':
      return `${year}-${Math.floor(date.getMonth() / 3) + 1}`;  // Trimestre
    default:
      return `${year}-${month}`;
  }
} 