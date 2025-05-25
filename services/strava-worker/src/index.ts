import 'dotenv/config';
import fastify from 'fastify';
import Redis from 'ioredis';
import strava from 'strava-v3';
import { setupWebhookRoutes } from './routes/webhook';
import { startActivityProcessor } from './workers/activityProcessor';
import { createRateLimiter, verifyJWT } from './middleware/security';

// Configurar o logger
const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Configurar Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Configurar Strava
strava.config({
  access_token: process.env.STRAVA_ACCESS_TOKEN || '',
  client_id: process.env.STRAVA_CLIENT_ID || '',
  client_secret: process.env.STRAVA_CLIENT_SECRET || '',
  redirect_uri: process.env.STRAVA_REDIRECT_URI || '',
});

// Aplicar rate limiting global
server.register(async (instance) => {
  instance.addHook('onRequest', createRateLimiter(redis, {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por janela
    keyGenerator: (request) => {
      return request.ip || 'unknown';
    }
  }));
});

// Proteger rotas sensíveis
server.register(async (instance) => {
  instance.addHook('onRequest', verifyJWT(process.env.JWT_SECRET || 'default_secret_key'));

  // Rotas protegidas
  instance.get('/activities', async (request, reply) => {
    return { activities: [] };
  });

  instance.post('/tokens/mint', async (request, reply) => {
    return { success: true };
  });
});

// Iniciar o servidor
const start = async () => {
  try {
    // Importar as rotas e workers
    const { setupAuthRoutes } = await import('./routes/auth');
    const { setupActivityRoutes } = await import('./routes/activities');
    const { startTokenRefresher } = await import('./workers/tokenRefresher');

    // Configurar rotas
    setupWebhookRoutes(server, redis);
    setupAuthRoutes(server, redis, strava);
    setupActivityRoutes(server, redis, strava);

    // Iniciar servidor HTTP
    await server.listen({
      port: parseInt(process.env.PORT || '3001'),
      host: '0.0.0.0'
    });

    // Iniciar workers
    startActivityProcessor(server, redis, strava);
    startTokenRefresher(server, redis, strava);

    server.log.info(`Servidor iniciado na porta ${process.env.PORT || '3001'}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Iniciar a aplicação
start();
