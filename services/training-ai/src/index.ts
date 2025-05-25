import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Redis from 'ioredis';
import { setupProfileRoutes } from './routes/profile';
import { setupPlanRoutes } from './routes/plan';
import { setupEffortRoutes } from './routes/effort';
import { setupOpenAIRoutes } from './routes/openai';
import { setupHealthRoutes } from './routes/health';

// Logger configuration
const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Redis client for cache and rate limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Register plugins
server.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

// Rate limit configuration for OpenAI endpoints
server.register(rateLimit, {
  max: 50, // max requests per minute
  timeWindow: '1 minute',
  redis: redis,
  allowList: ['127.0.0.1', 'localhost'],
  prefix: 'ratelimit:training-ai:'
});

// Swagger documentation
server.register(swagger, {
  swagger: {
    info: {
      title: 'FuseLabs Training AI API',
      description: 'API para serviço de planos de treino personalizados com IA',
      version: '0.1.0',
    },
    host: process.env.SWAGGER_HOST || 'localhost:3007',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'profile', description: 'Operações de perfil esportivo' },
      { name: 'plan', description: 'Operações de planos de treino' },
      { name: 'effort', description: 'Operações de cálculo de esforço' },
      { name: 'openai', description: 'Operações diretas com OpenAI' },
      { name: 'health', description: 'Verificação de saúde do serviço' },
    ],
  },
});

server.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
});

// Register routes
setupProfileRoutes(server, redis);
setupPlanRoutes(server, redis);
setupEffortRoutes(server, redis);
setupOpenAIRoutes(server, redis);
setupHealthRoutes(server);

// Start the server
const start = async () => {
  try {
    await server.listen({
      port: parseInt(process.env.PORT || '3007'),
      host: '0.0.0.0'
    });
    server.log.info(`Training AI service started on port ${process.env.PORT || '3007'}`);
    server.log.info(`Documentation available at http://localhost:${process.env.PORT || '3007'}/documentation`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  server.log.info('Shutting down server...');
  await server.close();
  await redis.quit();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start(); 