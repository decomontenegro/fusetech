import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { SocialPlatform } from '@fuseapp/types';
import { createSocialFraudDetector } from '../services/socialFraudDetector';

// Worker para verificar posts sociais
export async function startSocialVerifier(
  server: FastifyInstance,
  redis: Redis
): Promise<void> {
  server.log.info('Iniciando verificador de posts sociais');
  
  // Instanciar detector de fraudes
  const socialFraudDetector = createSocialFraudDetector(server);
  
  // Loop infinito para processar eventos
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
                         fields[fields.indexOf('platform') + 1] as SocialPlatform : null;
          const userId = fields.indexOf('userId') >= 0 ? 
                       fields[fields.indexOf('userId') + 1] : null;
          const dataIndex = fields.indexOf('data');
          
          if (platform && userId && dataIndex >= 0 && dataIndex < fields.length - 1) {
            try {
              const postData = JSON.parse(fields[dataIndex + 1]);
              
              // Adaptar dados para o formato esperado pelo detector
              const post = {
                id: `social_${Date.now()}`,
                userId,
                platform,
                postId: postData.id || 'unknown',
                content: postData.caption || postData.desc || '',
                mediaUrl: postData.media_url || postData.video_url || '',
                permalink: postData.permalink || postData.share_url || '',
                createdAt: postData.timestamp || postData.create_time || new Date().toISOString(),
                metadata: postData
              };
              
              // Verificar fraude
              const fraudResult = await socialFraudDetector.detectFraud(post);
              
              // Publicar resultado da verificação
              const verifiedPost = {
                ...post,
                isValid: fraudResult.isValid,
                fraudScore: fraudResult.fraudScore,
                fraudReasons: fraudResult.reasons,
              };
              
              await redis.xadd(
                'social:verified',
                '*',
                'data',
                JSON.stringify(verifiedPost)
              );
              
              // Se válido, processar o post para atribuição de pontos
              if (fraudResult.isValid) {
                // Pontuar posts com base na plataforma
                const points = platform === SocialPlatform.INSTAGRAM ? 25 : 30;
                
                await redis.xadd(
                  'earn:points',
                  '*',
                  'userId', userId,
                  'source', platform.toLowerCase(),
                  'postId', post.postId,
                  'points', points.toString(),
                  'data', JSON.stringify(verifiedPost)
                );
                
                server.log.info(
                  { postId: post.postId, userId, points, platform },
                  'Post social verificado e pontos atribuídos'
                );
              } else {
                server.log.warn(
                  { 
                    postId: post.postId, 
                    userId, 
                    platform,
                    fraudScore: fraudResult.fraudScore,
                    reasons: fraudResult.reasons
                  },
                  'Post social rejeitado por fraude'
                );
              }
            } catch (error) {
              server.log.error({ error, id }, 'Erro ao processar post social');
            }
            
            // Confirmar processamento (mesmo em caso de erro)
            await redis.xack('social:posts', 'social-verifier-group', id);
          }
        }
      }
    } catch (error) {
      server.log.error({ error }, 'Erro ao verificar posts sociais');
      // Esperar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
} 