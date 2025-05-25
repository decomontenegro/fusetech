import 'dotenv/config';
import fastify from 'fastify';
import Redis from 'ioredis';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { setupChallengesRoutes } from './routes/challenges';
import { setupAchievementsRoutes } from './routes/achievements';
import { setupLeaderboardRoutes } from './routes/leaderboard';
import { startChallengeProcessor } from './workers/challengeProcessor';
import { startAchievementProcessor } from './workers/achievementProcessor';

// Configuração do logger
const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Configuração do Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Iniciar o servidor
const start = async () => {
  try {
    // Configurar Swagger
    await server.register(swagger, {
      swagger: {
        info: {
          title: 'FuseLabs Gamification API',
          description: 'API para o serviço de gamificação do FuseLabs App',
          version: '1.0.0',
        },
        host: 'localhost:3005',
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'challenges', description: 'Endpoints de desafios' },
          { name: 'achievements', description: 'Endpoints de conquistas' },
          { name: 'leaderboard', description: 'Endpoints de leaderboard' },
        ],
      },
    });

    // Configurar Swagger UI
    await server.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
      staticCSP: true,
    });

    // Configurar rotas
    setupChallengesRoutes(server, redis);
    setupAchievementsRoutes(server, redis);
    setupLeaderboardRoutes(server, redis);

    // Iniciar o servidor HTTP
    await server.listen({
      port: parseInt(process.env.PORT || '3005'),
      host: '0.0.0.0'
    });

    // Iniciar workers
    startChallengeProcessor(server, redis);
    startAchievementProcessor(server, redis);

    server.log.info(`Servidor de gamificação iniciado na porta ${process.env.PORT || '3005'}`);
    server.log.info(`Documentação disponível em http://localhost:${process.env.PORT || '3005'}/documentation`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Iniciar a aplicação
start();
