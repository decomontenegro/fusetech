import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { CronJob } from 'cron';

/**
 * Worker para atualizar tokens do Strava que estão prestes a expirar
 */
export function startTokenRefresher(
  server: FastifyInstance,
  redis: Redis,
  stravaClient: any
) {
  // Criar job para executar a cada hora
  const job = new CronJob('0 * * * *', async () => {
    server.log.info('Iniciando atualização de tokens do Strava');
    
    try {
      // Em produção, buscar todas as conexões do banco de dados
      // Aqui estamos simulando com Redis
      const keys = await redis.keys('strava:connection:*');
      
      for (const key of keys) {
        try {
          const connectionData = await redis.get(key);
          
          if (!connectionData) continue;
          
          const connection = JSON.parse(connectionData);
          
          // Verificar se o token expira nas próximas 2 horas
          const expiresAt = connection.expiresAt * 1000; // Converter para milissegundos
          const now = Date.now();
          const twoHoursFromNow = now + (2 * 60 * 60 * 1000);
          
          if (expiresAt > twoHoursFromNow) {
            // Token ainda é válido por mais de 2 horas
            continue;
          }
          
          server.log.info(
            { userId: connection.userId, stravaId: connection.stravaId },
            'Atualizando token do Strava'
          );
          
          // Atualizar token
          const response = await stravaClient.oauth.refreshToken(connection.refreshToken);
          
          // Atualizar conexão
          const updatedConnection = {
            ...connection,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresAt: response.expires_at,
          };
          
          // Salvar conexão atualizada
          await redis.set(key, JSON.stringify(updatedConnection));
          
          server.log.info(
            { userId: connection.userId, stravaId: connection.stravaId },
            'Token do Strava atualizado com sucesso'
          );
        } catch (error) {
          server.log.error(
            { error, key },
            'Erro ao atualizar token do Strava'
          );
        }
      }
    } catch (error) {
      server.log.error(
        { error },
        'Erro ao processar atualização de tokens do Strava'
      );
    }
  });
  
  // Iniciar o job
  job.start();
  
  server.log.info('Worker de atualização de tokens do Strava iniciado');
}
