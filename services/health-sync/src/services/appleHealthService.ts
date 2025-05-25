import { Database } from '../database';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { AppleHealthActivityTypeMap } from '../schemas/appleHealth';
import { ActivityService } from './activityService';
import { FraudDetectionService } from './fraudDetectionService';

interface AppleHealthWorkout {
  uuid: string;
  workoutActivityType: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalDistance: number;
  totalEnergyBurned?: number;
  source?: string;
  sourceBundle?: string;
  device?: any;
  metadata?: any;
  route?: any[];
}

interface AppleHealthSteps {
  date: string;
  value: number;
  source?: string;
  sourceBundle?: string;
}

interface AppleHealthHeartRate {
  timestamp: string;
  value: number;
  source?: string;
  sourceBundle?: string;
  device?: any;
}

interface AppleHealthActiveEnergy {
  date: string;
  value: number;
  source?: string;
  sourceBundle?: string;
}

interface AppleHealthData {
  workouts: AppleHealthWorkout[];
  steps: AppleHealthSteps[];
  heartRate?: AppleHealthHeartRate[];
  activeEnergy?: AppleHealthActiveEnergy[];
}

interface ConnectionStatus {
  connected: boolean;
  lastSync?: string;
  preferences?: {
    syncWorkouts: boolean;
    syncSteps: boolean;
    syncHeartRate: boolean;
    syncActiveEnergy: boolean;
    autoSync: boolean;
  };
}

export class AppleHealthService {
  private db: Database;
  private redis: Redis;
  private activityService: ActivityService;
  private fraudDetectionService: FraudDetectionService;

  constructor(db: Database, redis: Redis) {
    this.db = db;
    this.redis = redis;
    this.activityService = new ActivityService(db, redis);
    this.fraudDetectionService = new FraudDetectionService(db, redis);
  }

  /**
   * Processa dados recebidos do Apple Health
   */
  async processHealthData(userId: string, data: AppleHealthData) {
    try {
      // Verificar se o usuário tem uma conexão registrada
      const connection = await this.getOrCreateConnection(userId);
      
      // Processar treinos
      const activities = [];
      
      if (data.workouts && data.workouts.length > 0 && connection.preferences.syncWorkouts) {
        for (const workout of data.workouts) {
          // Verificar se o treino já foi processado
          const existingActivity = await this.db.collection('activities').findOne({
            userId,
            source: 'apple_health',
            'sourceData.uuid': workout.uuid
          });
          
          if (existingActivity) {
            continue; // Pular treinos já processados
          }
          
          // Mapear tipo de atividade
          const activityType = this.mapActivityType(workout.workoutActivityType);
          
          // Criar atividade
          const activity = {
            id: uuidv4(),
            userId,
            type: activityType,
            source: 'apple_health',
            sourceId: workout.uuid,
            startTime: new Date(workout.startDate),
            endTime: new Date(workout.endDate),
            duration: workout.duration,
            distance: workout.totalDistance,
            calories: workout.totalEnergyBurned || 0,
            sourceData: workout,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Verificar fraude
          const fraudCheck = await this.fraudDetectionService.checkActivity(activity);
          
          if (fraudCheck.isSuspicious) {
            activity.status = 'flagged';
            activity.fraudScore = fraudCheck.score;
            activity.fraudReasons = fraudCheck.reasons;
          }
          
          // Salvar atividade
          await this.db.collection('activities').insertOne(activity);
          activities.push(activity);
          
          // Enfileirar para processamento de pontos
          if (activity.status !== 'flagged') {
            await this.redis.rpush('activity:points:queue', JSON.stringify({
              activityId: activity.id,
              userId: activity.userId,
              timestamp: new Date().toISOString()
            }));
          }
        }
      }
      
      // Processar passos diários
      if (data.steps && data.steps.length > 0 && connection.preferences.syncSteps) {
        for (const stepData of data.steps) {
          // Verificar se já temos dados de passos para esta data
          const existingSteps = await this.db.collection('daily_metrics').findOne({
            userId,
            date: stepData.date,
            type: 'steps'
          });
          
          if (existingSteps) {
            // Atualizar se o valor for maior
            if (stepData.value > existingSteps.value) {
              await this.db.collection('daily_metrics').updateOne(
                { _id: existingSteps._id },
                { 
                  $set: { 
                    value: stepData.value,
                    source: 'apple_health',
                    sourceData: stepData,
                    updatedAt: new Date()
                  } 
                }
              );
            }
          } else {
            // Criar novo registro
            await this.db.collection('daily_metrics').insertOne({
              id: uuidv4(),
              userId,
              type: 'steps',
              date: stepData.date,
              value: stepData.value,
              source: 'apple_health',
              sourceData: stepData,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }
      
      // Atualizar timestamp da última sincronização
      await this.db.collection('health_connections').updateOne(
        { userId, source: 'apple_health' },
        { $set: { lastSync: new Date(), updatedAt: new Date() } }
      );
      
      return {
        processed: {
          workouts: activities.length,
          steps: data.steps?.length || 0,
          heartRate: data.heartRate?.length || 0,
          activeEnergy: data.activeEnergy?.length || 0
        },
        activities
      };
    } catch (error) {
      console.error('Erro ao processar dados do Apple Health:', error);
      throw error;
    }
  }

  /**
   * Obtém ou cria uma conexão com o Apple Health
   */
  private async getOrCreateConnection(userId: string) {
    const connection = await this.db.collection('health_connections').findOne({
      userId,
      source: 'apple_health'
    });
    
    if (connection) {
      return connection;
    }
    
    // Criar nova conexão com preferências padrão
    const newConnection = {
      id: uuidv4(),
      userId,
      source: 'apple_health',
      connected: true,
      preferences: {
        syncWorkouts: true,
        syncSteps: true,
        syncHeartRate: false,
        syncActiveEnergy: false,
        autoSync: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.db.collection('health_connections').insertOne(newConnection);
    
    return newConnection;
  }

  /**
   * Obtém o status da conexão com o Apple Health
   */
  async getConnectionStatus(userId: string): Promise<ConnectionStatus> {
    const connection = await this.db.collection('health_connections').findOne({
      userId,
      source: 'apple_health'
    });
    
    if (!connection) {
      return {
        connected: false
      };
    }
    
    return {
      connected: connection.connected,
      lastSync: connection.lastSync ? connection.lastSync.toISOString() : undefined,
      preferences: connection.preferences
    };
  }

  /**
   * Atualiza as preferências do Apple Health
   */
  async updatePreferences(userId: string, preferences: any) {
    const connection = await this.getOrCreateConnection(userId);
    
    const updatedPreferences = {
      ...connection.preferences,
      ...preferences
    };
    
    await this.db.collection('health_connections').updateOne(
      { userId, source: 'apple_health' },
      { $set: { preferences: updatedPreferences, updatedAt: new Date() } }
    );
    
    return updatedPreferences;
  }

  /**
   * Remove a conexão com o Apple Health
   */
  async removeConnection(userId: string) {
    await this.db.collection('health_connections').updateOne(
      { userId, source: 'apple_health' },
      { $set: { connected: false, updatedAt: new Date() } }
    );
  }

  /**
   * Mapeia o tipo de atividade do Apple Health para o tipo interno
   */
  private mapActivityType(appleHealthType: string): string {
    return AppleHealthActivityTypeMap[appleHealthType] || 'other';
  }
}
