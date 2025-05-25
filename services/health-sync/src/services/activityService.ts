import { Database } from '../database';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

interface ActivityQuery {
  userId: string;
  source?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
}

export class ActivityService {
  private db: Database;
  private redis: Redis;

  constructor(db: Database, redis: Redis) {
    this.db = db;
    this.redis = redis;
  }

  /**
   * Obtém atividades do usuário com filtros
   */
  async getUserActivities(query: ActivityQuery) {
    const { 
      userId, 
      source, 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      type, 
      status 
    } = query;
    
    // Construir filtro
    const filter: any = { userId };
    
    if (source) {
      filter.source = source;
    }
    
    if (startDate || endDate) {
      filter.startTime = {};
      
      if (startDate) {
        filter.startTime.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.startTime.$lte = new Date(endDate);
      }
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Calcular paginação
    const skip = (page - 1) * limit;
    
    // Buscar atividades
    const activities = await this.db.collection('activities')
      .find(filter)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Contar total
    const total = await this.db.collection('activities').countDocuments(filter);
    
    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtém uma atividade por ID
   */
  async getActivityById(activityId: string, userId: string) {
    const activity = await this.db.collection('activities').findOne({
      id: activityId,
      userId
    });
    
    return activity;
  }

  /**
   * Calcula pontos para uma atividade
   */
  async calculatePoints(activity: any) {
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
    const distanceKm = activity.distance / 1000;
    
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
   * Processa uma atividade para atribuir pontos e tokens
   */
  async processActivity(activityId: string) {
    try {
      // Obter atividade
      const activity = await this.db.collection('activities').findOne({ id: activityId });
      
      if (!activity) {
        throw new Error(`Atividade não encontrada: ${activityId}`);
      }
      
      // Verificar se a atividade já foi processada
      if (activity.processed) {
        return { success: true, alreadyProcessed: true };
      }
      
      // Verificar status
      if (activity.status === 'flagged') {
        return { success: false, reason: 'Atividade marcada como suspeita' };
      }
      
      // Calcular pontos
      const points = await this.calculatePoints(activity);
      
      // Atualizar atividade
      await this.db.collection('activities').updateOne(
        { id: activityId },
        { 
          $set: { 
            points,
            status: 'verified',
            processed: true,
            processedAt: new Date(),
            updatedAt: new Date()
          } 
        }
      );
      
      // Enfileirar para tokenização
      await this.redis.rpush('token:mint:queue', JSON.stringify({
        userId: activity.userId,
        amount: points,
        reason: `Atividade: ${activity.type}`,
        metadata: {
          activityId: activity.id,
          activityType: activity.type,
          source: activity.source
        },
        timestamp: new Date().toISOString()
      }));
      
      return { 
        success: true, 
        points,
        activity: {
          ...activity,
          points,
          status: 'verified',
          processed: true
        }
      };
    } catch (error) {
      console.error('Erro ao processar atividade:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de atividades do usuário
   */
  async getUserStats(userId: string, period: 'week' | 'month' | 'year' | 'all' = 'month') {
    try {
      // Definir período
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case 'all':
          startDate.setFullYear(2000);
          break;
      }
      
      // Filtro base
      const filter = {
        userId,
        status: 'verified',
        startTime: { $gte: startDate }
      };
      
      // Estatísticas gerais
      const totalActivities = await this.db.collection('activities').countDocuments(filter);
      
      // Agregar por tipo
      const activitiesByType = await this.db.collection('activities').aggregate([
        { $match: filter },
        { $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalDuration: { $sum: '$duration' },
          totalPoints: { $sum: '$points' }
        }},
        { $sort: { count: -1 } }
      ]).toArray();
      
      // Calcular totais
      const totalDistance = activitiesByType.reduce((sum, item) => sum + (item.totalDistance || 0), 0);
      const totalDuration = activitiesByType.reduce((sum, item) => sum + (item.totalDuration || 0), 0);
      const totalPoints = activitiesByType.reduce((sum, item) => sum + (item.totalPoints || 0), 0);
      
      // Atividades recentes
      const recentActivities = await this.db.collection('activities')
        .find(filter)
        .sort({ startTime: -1 })
        .limit(5)
        .toArray();
      
      return {
        period,
        totalActivities,
        totalDistance,
        totalDuration,
        totalPoints,
        activitiesByType,
        recentActivities
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do usuário:', error);
      throw error;
    }
  }
}
