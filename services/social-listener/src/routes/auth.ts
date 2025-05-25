import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { SocialPlatform } from '@fuseapp/types';

// Configura as rotas de autenticação OAuth para redes sociais
export function setupAuthRoutes(server: FastifyInstance, redis: Redis): void {
  // Rota para callback do Instagram
  server.get('/api/auth/instagram/callback', async (request, reply) => {
    const query = request.query as { code?: string; state?: string };
    
    if (!query.code || !query.state) {
      return reply.status(400).send({ error: 'Parâmetros inválidos' });
    }
    
    // O state contém o userId
    const userId = query.state;
    
    try {
      // Em produção, trocar código por token permanente
      // Este é apenas um exemplo simulado
      const mockConnection = {
        id: `instagram_${Date.now()}`,
        userId,
        platform: SocialPlatform.INSTAGRAM,
        username: 'usuario_instagram',
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
      };
      
      // Publicar conexão para processamento
      await redis.xadd(
        'social:connections',
        '*',
        'data',
        JSON.stringify(mockConnection)
      );
      
      // Redirecionar para dashboard
      return reply.redirect('/dashboard?connected=instagram');
    } catch (error) {
      server.log.error({ error }, 'Erro ao processar callback do Instagram');
      return reply.redirect('/dashboard?error=instagram_auth_failed');
    }
  });

  // Rota para callback do TikTok
  server.get('/api/auth/tiktok/callback', async (request, reply) => {
    const query = request.query as { code?: string; state?: string };
    
    if (!query.code || !query.state) {
      return reply.status(400).send({ error: 'Parâmetros inválidos' });
    }
    
    // O state contém o userId
    const userId = query.state;
    
    try {
      // Em produção, trocar código por token
      // Este é apenas um exemplo simulado
      const mockConnection = {
        id: `tiktok_${Date.now()}`,
        userId,
        platform: SocialPlatform.TIKTOK,
        username: 'usuario_tiktok',
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        tokenExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias
      };
      
      // Publicar conexão para processamento
      await redis.xadd(
        'social:connections',
        '*',
        'data',
        JSON.stringify(mockConnection)
      );
      
      // Redirecionar para dashboard
      return reply.redirect('/dashboard?connected=tiktok');
    } catch (error) {
      server.log.error({ error }, 'Erro ao processar callback do TikTok');
      return reply.redirect('/dashboard?error=tiktok_auth_failed');
    }
  });
} 