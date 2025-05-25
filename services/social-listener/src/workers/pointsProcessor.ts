import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { SocialPlatform } from '@fuseapp/types';
import { 
  instagramPostSchema, 
  tiktokVideoSchema 
} from '../models/schemas';

// Worker para processar postagens e atribuir pontos
export async function startSocialPointsProcessor(
  server: FastifyInstance,
  redis: Redis
): Promise<void> {
  server.log.info('Iniciando processador de pontos por publicações sociais');
  
  // Loop infinito para processar eventos de posts sociais
  while (true) {
    try {
      // Ler eventos do stream Redis
      const results = await redis.xread(
        'BLOCK', 
        2000, 
        'STREAMS', 
        'social:posts', 
        '0'
      );
      
      if (!results) continue;
      
      for (const [stream, messages] of results) {
        for (const [id, fields] of messages) {
          // Extrair platform, userId e data do evento
          const platform = fields.indexOf('platform') >= 0 ? 
                         fields[fields.indexOf('platform') + 1] : null;
          const userId = fields.indexOf('userId') >= 0 ? 
                       fields[fields.indexOf('userId') + 1] : null;
          const dataIndex = fields.indexOf('data');
          
          if (platform && userId && dataIndex >= 0 && dataIndex < fields.length - 1) {
            const postData = JSON.parse(fields[dataIndex + 1]);
            
            // Processar a publicação e calcular pontos
            await processSocialPost(server, redis, platform as SocialPlatform, userId, postData);
            
            // Confirmar processamento do evento
            await redis.xack('social:posts', 'social-processor-group', id);
          }
        }
      }
    } catch (error) {
      server.log.error({ error }, 'Erro ao processar pontos sociais');
      // Esperar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Função para processar uma publicação social e atribuir pontos
async function processSocialPost(
  server: FastifyInstance,
  redis: Redis,
  platform: SocialPlatform,
  platformUserId: string,
  postData: any
): Promise<void> {
  try {
    // Recuperar o usuário interno pelo ID da plataforma
    // Em produção, isso viria do banco de dados
    // Este é apenas um exemplo simulado
    const mockUserId = 'user123';
    
    // Validar a publicação de acordo com a plataforma
    if (platform === SocialPlatform.INSTAGRAM) {
      const post = instagramPostSchema.parse(postData);
      
      // Verificar se o post contém hashtags específicas ou menções
      const caption = post.caption || '';
      const hasRequiredTags = caption.includes('#fuselabs') || caption.includes('@fuselabsapp');
      
      if (!hasRequiredTags) {
        server.log.info({ postId: post.id }, 'Post do Instagram não contém tags/menções necessárias');
        return;
      }
      
      // Calcular pontos (exemplo: pontos base por post do Instagram)
      const points = 25;
      
      // Publicar pontos para processamento
      await redis.xadd(
        'earn:points',
        '*',
        'userId', mockUserId,
        'source', 'instagram',
        'postId', post.id,
        'points', points.toString(),
        'data', JSON.stringify({
          platform: SocialPlatform.INSTAGRAM,
          postId: post.id,
          permalink: post.permalink,
          timestamp: post.timestamp,
        })
      );
      
      server.log.info(
        { userId: mockUserId, postId: post.id, points },
        'Pontos por post do Instagram atribuídos'
      );
    } else if (platform === SocialPlatform.TIKTOK) {
      const video = tiktokVideoSchema.parse(postData);
      
      // Verificar se o vídeo contém hashtags específicas ou menções
      const description = video.desc || '';
      const hasRequiredTags = description.includes('#fuselabs') || description.includes('@fuselabsapp');
      
      if (!hasRequiredTags) {
        server.log.info({ videoId: video.id }, 'Vídeo do TikTok não contém tags/menções necessárias');
        return;
      }
      
      // Calcular pontos base por vídeo + bônus por visualizações e likes
      const basePoints = 30;
      const viewBonus = Math.floor(video.stats.view_count / 1000) * 5; // 5 pontos a cada 1000 views
      const likeBonus = Math.floor(video.stats.digg_count / 100) * 2; // 2 pontos a cada 100 likes
      const totalPoints = basePoints + viewBonus + likeBonus;
      
      // Publicar pontos para processamento
      await redis.xadd(
        'earn:points',
        '*',
        'userId', mockUserId,
        'source', 'tiktok',
        'postId', video.id,
        'points', totalPoints.toString(),
        'data', JSON.stringify({
          platform: SocialPlatform.TIKTOK,
          postId: video.id,
          shareUrl: video.share_url,
          timestamp: video.create_time,
          stats: {
            views: video.stats.view_count,
            likes: video.stats.digg_count,
          },
        })
      );
      
      server.log.info(
        { userId: mockUserId, videoId: video.id, points: totalPoints },
        'Pontos por vídeo do TikTok atribuídos'
      );
    }
  } catch (error) {
    server.log.error(
      { error, platform, platformUserId },
      'Erro ao processar publicação social'
    );
  }
} 