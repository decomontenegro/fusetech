import { FastifyInstance } from 'fastify';
import { SocialPlatform } from '@fuseapp/types';
import { SocialPost, FraudCheckResult } from '../models/schemas';

// Classe para detecção de fraudes em posts sociais
export class SocialFraudDetector {
  private logger: FastifyInstance['log'];

  constructor(server: FastifyInstance) {
    this.logger = server.log;
  }

  // Detecta se um post é fraudulento (conteúdo falso, sem hashtags relevantes, etc)
  async detectFraud(post: SocialPost): Promise<FraudCheckResult> {
    const { content = '', platform } = post;
    const reasons: string[] = [];
    let fraudScore = 0;
    
    // Verificar presença de hashtags necessárias
    const requiredHashtags = ['#fuselabs', '#fitness', '#workout'];
    const containsRequiredHashtag = requiredHashtags.some(
      tag => content.toLowerCase().includes(tag.toLowerCase())
    );
    
    if (!containsRequiredHashtag) {
      reasons.push('Post não contém nenhuma das hashtags necessárias');
      fraudScore += 50;
    }
    
    // Verificar frequência de publicação (simulado)
    // Em produção, buscar histórico real do usuário
    const userPostsLast24h = Math.floor(Math.random() * 5); // 0-4 posts
    
    if (userPostsLast24h >= 3) {
      reasons.push(`Usuário fez ${userPostsLast24h} posts nas últimas 24h (máx. recomendado: 3)`);
      fraudScore += 20 * (userPostsLast24h - 2); // +20 por post extra
    }
    
    // Verificar conteúdo do post (simulado)
    // Em produção, usar NLP para análise de sentimento/classificação
    const isContentRelevant = content.toLowerCase().includes('workout') || 
                            content.toLowerCase().includes('training') ||
                            content.toLowerCase().includes('exercise') ||
                            content.toLowerCase().includes('run') ||
                            content.toLowerCase().includes('fitness');
    
    if (!isContentRelevant) {
      reasons.push('Conteúdo não parece relacionado a fitness ou exercícios');
      fraudScore += 30;
    }
    
    // Limitar pontuação a 100
    fraudScore = Math.min(100, fraudScore);
    
    // Considerar válido se score < 60
    const isValid = fraudScore < 60;
    
    return {
      isValid,
      fraudScore,
      reasons
    };
  }
}

// Factory function para criar instância do detector
export function createSocialFraudDetector(server: FastifyInstance): SocialFraudDetector {
  return new SocialFraudDetector(server);
} 