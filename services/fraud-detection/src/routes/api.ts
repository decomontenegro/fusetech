import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { stravaActivitySchema, socialPostSchema } from '../models/schemas';
import { createActivityFraudDetector } from '../services/activityFraudDetector';
import { createSocialFraudDetector } from '../services/socialFraudDetector';

// Configurar rotas da API para verificação de fraudes
export function setupFraudCheckRoutes(server: FastifyInstance) {
  // Instanciar detectores
  const activityFraudDetector = createActivityFraudDetector(server);
  const socialFraudDetector = createSocialFraudDetector(server);

  // API para verificação manual de atividades
  server.post('/api/fraud-check/activity', async (request, reply) => {
    try {
      const activity = stravaActivitySchema.parse(request.body);
      const result = await activityFraudDetector.detectFraud(activity);
      
      return {
        data: {
          activity,
          ...result
        }
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao analisar atividade');
      return reply.status(400).send({ 
        error: error instanceof z.ZodError 
          ? 'Dados da atividade inválidos' 
          : 'Erro ao analisar atividade'
      });
    }
  });

  // API para verificação manual de posts sociais
  server.post('/api/fraud-check/social', async (request, reply) => {
    try {
      const post = socialPostSchema.parse(request.body);
      const result = await socialFraudDetector.detectFraud(post);
      
      return {
        data: {
          post,
          ...result
        }
      };
    } catch (error) {
      server.log.error({ error }, 'Erro ao analisar post social');
      return reply.status(400).send({ 
        error: error instanceof z.ZodError 
          ? 'Dados do post inválidos' 
          : 'Erro ao analisar post social'
      });
    }
  });
} 