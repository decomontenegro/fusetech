import 'dotenv/config';
import fastify from 'fastify';
import Redis from 'ioredis';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { z } from '@fuseapp/validation';
import { ActivitySource, ActivityStatus, ActivityType, SocialPlatform } from '@fuseapp/types';
import { calculateActivityPoints } from '@fuseapp/utils';
import SimpleLinearRegression from 'ml-regression-simple-linear';
import euclidean from 'ml-distance-euclidean';
import { Matrix } from 'ml-matrix';
import { setupFraudCheckRoutes } from './routes/api';
import { startActivityVerifier } from './workers/activityVerifier';
import { startSocialVerifier } from './workers/socialVerifier';

// Configuração do logger
const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Configuração do Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Schemas de validação
const stravaActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  source: z.literal(ActivitySource.STRAVA),
  externalId: z.string(),
  type: z.nativeEnum(ActivityType),
  name: z.string().optional(),
  distance: z.number().optional(),
  duration: z.number().optional(),
  startDate: z.string(),
  metadata: z.record(z.any()),
});

const socialPostSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: z.nativeEnum(SocialPlatform),
  postId: z.string(),
  content: z.string().optional(),
  mediaUrl: z.string().optional(),
  permalink: z.string().optional(),
  createdAt: z.string(),
  metadata: z.record(z.any()),
});

// Classe para detecção de fraudes em atividades físicas
class ActivityFraudDetector {
  // Dados históricos (simulados) para treinamento do modelo
  private historicalData = {
    // Dados de corrida (velocidade média em km/h)
    run: {
      mean: 10.5, // média da velocidade
      stdDev: 2.5, // desvio padrão
      maxSpeed: 20, // velocidade máxima plausível
      samples: [
        // simulação de amostras [distância_km, tempo_min]
        [5, 30], [10, 60], [3, 18], [7, 42], [8, 48],
        [5, 28], [10, 65], [3, 20], [7, 40], [8, 50]
      ]
    },
    // Dados de ciclismo (velocidade média em km/h)
    ride: {
      mean: 25.0,
      stdDev: 5.0,
      maxSpeed: 50,
      samples: [
        [20, 48], [30, 72], [15, 36], [40, 96], [25, 60],
        [20, 45], [30, 80], [15, 38], [40, 90], [25, 65]
      ]
    },
    // Dados de caminhada (velocidade média em km/h)
    walk: {
      mean: 5.0,
      stdDev: 1.0,
      maxSpeed: 8,
      samples: [
        [3, 36], [5, 60], [2, 24], [4, 48], [6, 72],
        [3, 38], [5, 58], [2, 26], [4, 45], [6, 75]
      ]
    }
  };

  // Modelos de regressão linear por tipo de atividade
  private models: { [key in ActivityType]?: SimpleLinearRegression } = {};

  constructor() {
    // Inicializar modelos de regressão
    this.initModels();
  }

  private initModels() {
    const trainModel = (type: 'run' | 'ride' | 'walk') => {
      const samples = this.historicalData[type].samples;
      const x = samples.map(s => s[0]); // distâncias em km
      const y = samples.map(s => s[1]); // tempos em minutos

      return new SimpleLinearRegression(x, y);
    };

    this.models[ActivityType.RUN] = trainModel('run');
    this.models[ActivityType.RIDE] = trainModel('ride');
    this.models[ActivityType.WALK] = trainModel('walk');

    // Outros tipos usam o modelo de caminhada como fallback
    this.models[ActivityType.HIKE] = trainModel('walk');
    this.models[ActivityType.OTHER] = trainModel('walk');
  }

  // Detecção baseada em velocidade implausível
  private detectAnomalousSpeed(
    type: ActivityType,
    distance: number,
    duration: number
  ): { isSuspicious: boolean; score: number; reason?: string } {
    // Cálculo da velocidade em km/h
    const distanceKm = distance / 1000;
    const durationHours = duration / 3600;
    const speed = distanceKm / durationHours;

    // Valores de referência para o tipo de atividade
    let refData;
    switch (type) {
      case ActivityType.RUN:
        refData = this.historicalData.run;
        break;
      case ActivityType.RIDE:
        refData = this.historicalData.ride;
        break;
      default:
        refData = this.historicalData.walk;
    }

    // Calcular Z-score (desvios padrão em relação à média)
    const zScore = Math.abs(speed - refData.mean) / refData.stdDev;

    // Velocidade implausível?
    const isTooFast = speed > refData.maxSpeed;

    // Pontuação de fraude (0-100), quanto maior, mais suspeito
    const anomalyScore = Math.min(100, Math.round(zScore * 20));

    if (isTooFast) {
      return {
        isSuspicious: true,
        score: Math.max(anomalyScore, 80),
        reason: `Velocidade de ${speed.toFixed(1)} km/h é implausível para ${type}`
      };
    }

    return {
      isSuspicious: zScore > 2.5, // mais de 2.5 desvios padrão é suspeito
      score: anomalyScore,
      reason: zScore > 2.5 ? `Velocidade ${speed.toFixed(1)} km/h está ${zScore.toFixed(1)} desvios padrão da média` : undefined
    };
  }

  // Detecção baseada em predição de tempo esperado
  private detectDeviationFromExpectedTime(
    type: ActivityType,
    distance: number,
    duration: number
  ): { isSuspicious: boolean; score: number; reason?: string } {
    const model = this.models[type] || this.models[ActivityType.WALK];
    if (!model) {
      return { isSuspicious: false, score: 0 };
    }

    // Converter para unidades usadas no treinamento
    const distanceKm = distance / 1000;
    const durationMin = duration / 60;

    // Prever o tempo em minutos para a distância dada
    const predictedTimeMin = model.predict(distanceKm);

    // Calcular o desvio (em percentual)
    const deviation = Math.abs(durationMin - predictedTimeMin) / predictedTimeMin;

    // Mais de 40% de desvio é suspeito
    const isSuspicious = deviation > 0.4;

    // Pontuação de fraude (0-100)
    const anomalyScore = Math.min(100, Math.round(deviation * 100));

    return {
      isSuspicious,
      score: anomalyScore,
      reason: isSuspicious
        ? `Tempo ${durationMin.toFixed(1)} min desvia ${(deviation * 100).toFixed(0)}% do esperado (${predictedTimeMin.toFixed(1)} min)`
        : undefined
    };
  }

  // Detecção baseada em padrão atípico para o usuário
  private async detectUserAbnormalPattern(
    userId: string,
    type: ActivityType,
    distance: number,
    duration: number
  ): Promise<{ isSuspicious: boolean; score: number; reason?: string }> {
    try {
      // Em produção, buscar histórico real do usuário
      // Aqui estamos simulando dados
      const userHistory = [
        { type: ActivityType.RUN, distance: 5000, duration: 1800 },  // 5km, 30min
        { type: ActivityType.RUN, distance: 8000, duration: 3000 },  // 8km, 50min
        { type: ActivityType.RUN, distance: 4000, duration: 1500 },  // 4km, 25min
        { type: ActivityType.RIDE, distance: 20000, duration: 3600 }, // 20km, 1h
        { type: ActivityType.WALK, distance: 3000, duration: 2100 },  // 3km, 35min
      ];

      // Filtrar atividades do mesmo tipo
      const sameTypeActivities = userHistory.filter(a => a.type === type);

      if (sameTypeActivities.length < 3) {
        // Não há dados suficientes para comparação
        return { isSuspicious: false, score: 0 };
      }

      // Extrair características para comparação (pace = segundos por metro)
      const paces = sameTypeActivities.map(a => a.duration / a.distance);
      const currentPace = duration / distance;

      // Calcular média e desvio padrão dos paces anteriores
      const avgPace = paces.reduce((sum, p) => sum + p, 0) / paces.length;
      const stdDevPace = Math.sqrt(
        paces.reduce((sum, p) => sum + Math.pow(p - avgPace, 2), 0) / paces.length
      );

      // Calcular Z-score do pace atual
      const zScore = Math.abs(currentPace - avgPace) / (stdDevPace || 1);

      // Mais de 3 desvios padrão é muito suspeito
      const isSuspicious = zScore > 3;

      // Pontuação de fraude (0-100)
      const anomalyScore = Math.min(100, Math.round(zScore * 25));

      return {
        isSuspicious,
        score: anomalyScore,
        reason: isSuspicious
          ? `Ritmo de ${(currentPace * 1000).toFixed(1)} seg/km desvia ${zScore.toFixed(1)} desvios padrão do seu histórico`
          : undefined
      };

    } catch (error) {
      server.log.error({ error, userId }, 'Erro ao analisar padrão do usuário');
      return { isSuspicious: false, score: 0 };
    }
  }

  // Detecta fraude em uma atividade física
  async detectFraud(activity: z.infer<typeof stravaActivitySchema>): Promise<{
    isValid: boolean;
    fraudScore: number;
    reasons: string[];
  }> {
    const { userId, type, distance = 0, duration = 0 } = activity;

    // Não podemos analisar atividades sem distância ou duração
    if (distance <= 0 || duration <= 0) {
      return {
        isValid: true,
        fraudScore: 0,
        reasons: []
      };
    }

    // Executar todos os detectores
    const [speedCheck, timeCheck, patternCheck] = await Promise.all([
      this.detectAnomalousSpeed(type, distance, duration),
      this.detectDeviationFromExpectedTime(type, distance, duration),
      this.detectUserAbnormalPattern(userId, type, distance, duration)
    ]);

    // Consolidar resultados
    const reasons: string[] = [];
    if (speedCheck.reason) reasons.push(speedCheck.reason);
    if (timeCheck.reason) reasons.push(timeCheck.reason);
    if (patternCheck.reason) reasons.push(patternCheck.reason);

    // Calcular pontuação média de fraude
    const fraudScore = Math.round(
      (speedCheck.score + timeCheck.score + patternCheck.score) / 3
    );

    // Determinar validade com base na pontuação
    // Escala:
    // 0-30: Provavelmente legítimo
    // 31-70: Suspeito, mas aprovado
    // 71-100: Provavelmente fraudulento
    const isValid = fraudScore <= 70;

    return {
      isValid,
      fraudScore,
      reasons
    };
  }
}

// Classe para detecção de fraudes em posts sociais
class SocialFraudDetector {
  // Detecta se um post é fraudulento (conteúdo falso, sem hashtags relevantes, etc)
  async detectFraud(post: z.infer<typeof socialPostSchema>): Promise<{
    isValid: boolean;
    fraudScore: number;
    reasons: string[];
  }> {
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

// Instanciar detectores
const activityFraudDetector = new ActivityFraudDetector();
const socialFraudDetector = new SocialFraudDetector();

// API para verificação manual
server.post('/api/fraud-check/activity', async (request, reply) => {
  try {
    const activity = stravaActivitySchema.parse(request.body);
    const result = await activityFraudDetector.detectFraud(activity);

    return {
      data: {
        activity,
        ...result
      }
    };
  } catch (error) {
    server.log.error({ error }, 'Erro ao analisar atividade');
    return reply.status(400).send({
      error: error instanceof z.ZodError
        ? 'Dados da atividade inválidos'
        : 'Erro ao analisar atividade'
    });
  }
});

server.post('/api/fraud-check/social', async (request, reply) => {
  try {
    const post = socialPostSchema.parse(request.body);
    const result = await socialFraudDetector.detectFraud(post);

    return {
      data: {
        post,
        ...result
      }
    };
  } catch (error) {
    server.log.error({ error }, 'Erro ao analisar post social');
    return reply.status(400).send({
      error: error instanceof z.ZodError
        ? 'Dados do post inválidos'
        : 'Erro ao analisar post social'
    });
  }
});

// Utilitários
function mapStravaType(stravaType: string): ActivityType {
  switch (stravaType?.toLowerCase()) {
    case 'run':
    case 'running':
      return ActivityType.RUN;
    case 'ride':
    case 'cycling':
      return ActivityType.RIDE;
    case 'swim':
    case 'swimming':
      return ActivityType.SWIM;
    case 'walk':
    case 'walking':
      return ActivityType.WALK;
    case 'hike':
    case 'hiking':
      return ActivityType.HIKE;
    default:
      return ActivityType.OTHER;
  }
}

// Iniciar o servidor
const start = async () => {
  try {
    // Configurar Swagger
    await server.register(swagger, {
      swagger: {
        info: {
          title: 'FuseLabs Fraud Detection API',
          description: 'API para o serviço de detecção de fraudes do FuseLabs App',
          version: '1.0.0',
        },
        host: 'localhost:3004',
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'fraud-check', description: 'Endpoints de verificação de fraude' },
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

    // Configurar rotas da API de verificação
    setupFraudCheckRoutes(server);

    // Iniciar o servidor HTTP
    await server.listen({
      port: parseInt(process.env.PORT || '3004'),
      host: '0.0.0.0'
    });

    // Iniciar workers
    startActivityVerifier(server, redis);
    startSocialVerifier(server, redis);

    server.log.info(`Servidor iniciado na porta ${process.env.PORT || '3004'}`);
    server.log.info(`Documentação disponível em http://localhost:${process.env.PORT || '3004'}/documentation`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Iniciar a aplicação
start();