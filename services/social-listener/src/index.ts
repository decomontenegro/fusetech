import 'dotenv/config';
import fastify from 'fastify';
import Redis from 'ioredis';
import { CronJob } from 'cron';
import { setupAuthRoutes } from './routes/auth';
import { setupWebhookRoutes } from './routes/webhooks';
import { createInstagramAPI } from './services/instagramAPI';
import { createTiktokAPI } from './services/tiktokAPI';
import { startSocialPointsProcessor } from './workers/pointsProcessor';
import { startTokenRefresher } from './workers/tokenRefresher';

// Configuração do logger
const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Configuração do Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Instâncias de APIs
const instagramAPI = createInstagramAPI(server);
const tiktokAPI = createTiktokAPI(server);

// Iniciar o servidor
const start = async () => {
  try {
    // Configurar rotas de autenticação
    setupAuthRoutes(server, redis);
    
    // Configurar rotas de webhook
    setupWebhookRoutes(server, redis);
    
    // Iniciar o servidor HTTP
    await server.listen({ 
      port: parseInt(process.env.PORT || '3002'), 
      host: '0.0.0.0' 
    });
    
    // Iniciar workers
    startSocialPointsProcessor(server, redis);
    startTokenRefresher(server, redis, instagramAPI, tiktokAPI);
    
    server.log.info(`Servidor iniciado na porta ${process.env.PORT || '3002'}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Iniciar a aplicação
start(); 