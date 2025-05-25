import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from 'fastify-jwt';
import Redis from 'ioredis';
import { setupRewardRoutes } from './routes/rewards';
import { setupRedemptionRoutes } from './routes/redemptions';
import { setupPartnerRoutes } from './routes/partners';
import { setupAdminRoutes } from './routes/admin';
import { createRateLimiter, verifyJWT } from './middleware/security';
import { connectToDatabase } from './database';

// Configurar o logger
const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Configurar Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Registrar plugins
server.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'default_secret_key',
});

// Middleware de rate limiting
server.register(createRateLimiter(redis));

// Conectar ao banco de dados
connectToDatabase()
  .then((db) => {
    server.log.info('Conectado ao banco de dados');
    
    // Definir decoradores
    server.decorate('db', db);
    server.decorate('redis', redis);
    
    // Rotas públicas
    server.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });
    
    // Rotas protegidas
    server.register(async (instance) => {
      instance.addHook('onRequest', verifyJWT(server));
      
      // Configurar rotas
      setupRewardRoutes(instance);
      setupRedemptionRoutes(instance);
    });
    
    // Rotas de parceiros
    server.register(async (instance) => {
      instance.addHook('onRequest', verifyJWT(server, { role: 'partner' }));
      
      setupPartnerRoutes(instance);
    });
    
    // Rotas de administração
    server.register(async (instance) => {
      instance.addHook('onRequest', verifyJWT(server, { role: 'admin' }));
      
      setupAdminRoutes(instance);
    });
    
    // Iniciar servidor
    const start = async () => {
      try {
        await server.listen({ 
          port: parseInt(process.env.PORT || '3003'), 
          host: '0.0.0.0' 
        });
        
        server.log.info(`Servidor iniciado na porta ${process.env.PORT || '3003'}`);
      } catch (err) {
        server.log.error(err);
        process.exit(1);
      }
    };
    
    start();
  })
  .catch((err) => {
    server.log.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  });

// Tratamento de encerramento
const shutdown = async () => {
  server.log.info('Encerrando servidor...');
  await server.close();
  await redis.quit();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
