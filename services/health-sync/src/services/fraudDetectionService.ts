import { Database } from '../database';
import Redis from 'ioredis';

interface FraudCheckResult {
  isSuspicious: boolean;
  score: number;
  reasons: string[];
}

export class FraudDetectionService {
  private db: Database;
  private redis: Redis;

  constructor(db: Database, redis: Redis) {
    this.db = db;
    this.redis = redis;
  }

  /**
   * Verifica se uma atividade é suspeita
   */
  async checkActivity(activity: any): Promise<FraudCheckResult> {
    const reasons: string[] = [];
    let score = 0;
    
    // Verificar velocidade implausível
    if (activity.distance && activity.duration) {
      const speedMps = activity.distance / activity.duration; // metros por segundo
      const speedKph = speedMps * 3.6; // km/h
      
      // Limites de velocidade por tipo de atividade
      const speedLimits: Record<string, number> = {
        running: 30, // km/h
        walking: 10,
        cycling: 80,
        swimming: 8,
        other: 50
      };
      
      const limit = speedLimits[activity.type] || speedLimits.other;
      
      if (speedKph > limit) {
        reasons.push(`Velocidade implausível: ${speedKph.toFixed(2)} km/h`);
        score += 50;
      }
    }
    
    // Verificar duração muito longa
    if (activity.duration > 8 * 60 * 60) { // mais de 8 horas
      reasons.push(`Duração muito longa: ${(activity.duration / 3600).toFixed(2)} horas`);
      score += 30;
    }
    
    // Verificar distância muito longa
    const distanceLimits: Record<string, number> = {
      running: 100000, // 100 km
      walking: 50000,  // 50 km
      cycling: 300000, // 300 km
      swimming: 20000, // 20 km
      other: 150000    // 150 km
    };
    
    const distanceLimit = distanceLimits[activity.type] || distanceLimits.other;
    
    if (activity.distance > distanceLimit) {
      reasons.push(`Distância muito longa: ${(activity.distance / 1000).toFixed(2)} km`);
      score += 40;
    }
    
    // Verificar atividades duplicadas
    const startTime = new Date(activity.startTime);
    const endTime = new Date(activity.endTime);
    
    const overlappingActivities = await this.db.collection('activities').countDocuments({
      userId: activity.userId,
      $or: [
        { 
          startTime: { $lte: endTime },
          endTime: { $gte: startTime }
        },
        {
          startTime: { $gte: startTime, $lte: endTime }
        },
        {
          endTime: { $gte: startTime, $lte: endTime }
        }
      ],
      id: { $ne: activity.id }
    });
    
    if (overlappingActivities > 0) {
      reasons.push(`Atividade sobreposta com ${overlappingActivities} outras atividades`);
      score += 60;
    }
    
    // Verificar limite diário de atividades
    const activityDate = new Date(activity.startTime);
    activityDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(activityDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const dailyActivities = await this.db.collection('activities').countDocuments({
      userId: activity.userId,
      startTime: { $gte: activityDate, $lt: nextDay },
      id: { $ne: activity.id }
    });
    
    if (dailyActivities >= 10) {
      reasons.push(`Limite diário de atividades excedido: ${dailyActivities + 1} atividades`);
      score += 20;
    }
    
    // Verificar limite diário de pontos
    const dailyPoints = await this.db.collection('activities').aggregate([
      {
        $match: {
          userId: activity.userId,
          startTime: { $gte: activityDate, $lt: nextDay },
          id: { $ne: activity.id },
          points: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$points' }
        }
      }
    ]).toArray();
    
    const estimatedPoints = this.estimatePoints(activity);
    const currentDailyPoints = dailyPoints.length > 0 ? dailyPoints[0].totalPoints : 0;
    
    if (currentDailyPoints + estimatedPoints > 500) {
      reasons.push(`Limite diário de pontos excedido: ${currentDailyPoints + estimatedPoints} pontos`);
      score += 30;
    }
    
    // Verificar fonte confiável
    const trustedSources = ['strava', 'apple_health', 'google_fit', 'fitbit'];
    
    if (!trustedSources.includes(activity.source)) {
      reasons.push(`Fonte não confiável: ${activity.source}`);
      score += 10;
    }
    
    // Verificar se o usuário tem histórico de fraude
    const userFraudCount = await this.db.collection('activities').countDocuments({
      userId: activity.userId,
      status: 'flagged'
    });
    
    if (userFraudCount > 0) {
      reasons.push(`Usuário com histórico de atividades suspeitas: ${userFraudCount} ocorrências`);
      score += Math.min(userFraudCount * 5, 30);
    }
    
    // Determinar se a atividade é suspeita
    const isSuspicious = score >= 70 || reasons.length >= 3;
    
    return {
      isSuspicious,
      score,
      reasons
    };
  }

  /**
   * Estima os pontos que uma atividade pode gerar
   */
  private estimatePoints(activity: any): number {
    // Pontos base por tipo de atividade (por km)
    const pointsPerKm: Record<string, number> = {
      running: 10,
      walking: 5,
      cycling: 3,
      swimming: 15,
      functional_training: 8,
      yoga: 7,
      dance: 8,
      sports: 7,
      other: 5
    };
    
    // Distância em km
    const distanceKm = activity.distance ? activity.distance / 1000 : 0;
    
    // Calcular pontos base
    let points = Math.round(distanceKm * (pointsPerKm[activity.type] || pointsPerKm.other));
    
    // Bônus por duração (para atividades sem distância)
    if (!activity.distance && activity.duration) {
      // Pontos por minuto
      const durationMinutes = activity.duration / 60;
      points = Math.round(durationMinutes * 0.5);
    }
    
    // Bônus por calorias
    if (activity.calories) {
      points += Math.round(activity.calories / 20);
    }
    
    // Limitar pontos máximos por atividade
    const maxPoints = 200;
    points = Math.min(points, maxPoints);
    
    return points;
  }

  /**
   * Registra uma atividade como fraudulenta
   */
  async flagActivity(activityId: string, reason: string, adminId?: string) {
    await this.db.collection('activities').updateOne(
      { id: activityId },
      { 
        $set: { 
          status: 'flagged',
          flaggedReason: reason,
          flaggedBy: adminId || 'system',
          flaggedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    // Obter atividade atualizada
    return this.db.collection('activities').findOne({ id: activityId });
  }

  /**
   * Aprova uma atividade previamente marcada como suspeita
   */
  async approveActivity(activityId: string, adminId: string, notes?: string) {
    await this.db.collection('activities').updateOne(
      { id: activityId },
      { 
        $set: { 
          status: 'verified',
          approvedBy: adminId,
          approvedAt: new Date(),
          approvalNotes: notes,
          updatedAt: new Date()
        } 
      }
    );
    
    // Obter atividade atualizada
    const activity = await this.db.collection('activities').findOne({ id: activityId });
    
    // Enfileirar para processamento de pontos
    await this.redis.rpush('activity:points:queue', JSON.stringify({
      activityId,
      userId: activity.userId,
      timestamp: new Date().toISOString()
    }));
    
    return activity;
  }

  /**
   * Rejeita uma atividade
   */
  async rejectActivity(activityId: string, adminId: string, reason: string) {
    await this.db.collection('activities').updateOne(
      { id: activityId },
      { 
        $set: { 
          status: 'rejected',
          rejectedBy: adminId,
          rejectedAt: new Date(),
          rejectionReason: reason,
          updatedAt: new Date()
        } 
      }
    );
    
    // Obter atividade atualizada
    return this.db.collection('activities').findOne({ id: activityId });
  }
}
