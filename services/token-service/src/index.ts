import 'dotenv/config';
import fastify from 'fastify';
import Redis from 'ioredis';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { createTokenService } from './services/tokenService';
import { createTransactionService } from './services/transactionService';
import { setupTokenRoutes } from './routes/tokens';
import { startTokenTransactionProcessor } from './workers/transactionProcessor';

// Configurar o logger
const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Configurar Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Inicializar os serviços
let tokenService;
let transactionService;
try {
  tokenService = createTokenService(server, redis);
  transactionService = createTransactionService(server, redis, tokenService);
} catch (error) {
  server.log.error({ error }, 'Erro ao inicializar os serviços');
  process.exit(1);
}

// Iniciar o servidor e o worker
const start = async () => {
  try {
    // Configurar Swagger
    await server.register(swagger, {
      swagger: {
        info: {
          title: 'FuseLabs Token API',
          description: 'API para o serviço de token do FuseLabs App',
          version: '1.0.0',
        },
        host: 'localhost:3003',
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'tokens', description: 'Endpoints de tokens' },
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
    setupTokenRoutes(server, tokenService);

    // Iniciar o servidor HTTP
    await server.listen({
      port: parseInt(process.env.PORT || '3003'),
      host: '0.0.0.0'
    });

    server.log.info(`Servidor iniciado na porta ${process.env.PORT || '3003'}`);
    server.log.info(`Documentação disponível em http://localhost:${process.env.PORT || '3003'}/documentation`);

    // Iniciar worker de processamento de transações
    startTokenTransactionProcessor(server, redis, tokenService, transactionService);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Iniciar a aplicação
start();