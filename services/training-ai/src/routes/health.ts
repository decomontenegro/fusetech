import { FastifyInstance } from 'fastify';
import '../types'; // Importa a extensão de tipos

/**
 * Configuração das rotas de verificação de saúde do serviço
 */
export function setupHealthRoutes(server: FastifyInstance) {
  /**
   * Rota básica de health check
   */
  server.get('/health', {
    schema: {
      tags: ['health'],
      summary: 'Verificar se o serviço está funcionando',
      description: 'Retorna status 200 se o serviço estiver operacional',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            service: { type: 'string' },
            version: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'training-ai',
        version: '0.1.0'
      };
    }
  });

  /**
   * Rota de diagnóstico detalhado
   */
  server.get('/health/diagnostics', {
    schema: {
      tags: ['health'],
      summary: 'Obter diagnóstico detalhado do serviço',
      description: 'Retorna informações detalhadas sobre o status do serviço e suas dependências',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            memory: {
              type: 'object',
              properties: {
                rss: { type: 'number' },
                heapTotal: { type: 'number' },
                heapUsed: { type: 'number' },
                external: { type: 'number' }
              }
            },
            services: {
              type: 'object',
              properties: {
                openai: { type: 'string' },
                redis: { type: 'string' }
              }
            }
          }
        }
      }
    },
    handler: async (request, reply) => {
      // Verificar status do Redis (isso deveria ser injetado, mas simplificando)
      let redisStatus = 'unknown';
      try {
        // Tentar acessar a instância do Redis no contexto do servidor
        if (server.redis) {
          await server.redis.ping();
          redisStatus = 'ok';
        } else {
          redisStatus = 'not_configured';
        }
      } catch (err) {
        redisStatus = 'error';
        server.log.error('Redis health check error:', err);
      }

      // Verificar status da OpenAI (simplificado, idealmente um ping real)
      const openaiStatus = process.env.OPENAI_API_KEY ? 'configured' : 'not_configured';

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          openai: openaiStatus,
          redis: redisStatus
        }
      };
    }
  });
} 