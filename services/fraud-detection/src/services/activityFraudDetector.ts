import { FastifyInstance } from 'fastify';
import SimpleLinearRegression from 'ml-regression-simple-linear';
import { ActivityType } from '@fuseapp/types';
import { StravaActivity, FraudCheckResult } from '../models/schemas';

// Classe para detecção de fraudes em atividades físicas
export class ActivityFraudDetector {
  private logger: FastifyInstance['log'];

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

  constructor(server: FastifyInstance) {
    this.logger = server.log;
    
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
      this.logger.error({ error, userId }, 'Erro ao analisar padrão do usuário');
      return { isSuspicious: false, score: 0 };
    }
  }

  // Detecta fraude em uma atividade física
  async detectFraud(activity: StravaActivity): Promise<FraudCheckResult> {
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

// Factory function para criar instância do detector
export function createActivityFraudDetector(server: FastifyInstance): ActivityFraudDetector {
  return new ActivityFraudDetector(server);
} 