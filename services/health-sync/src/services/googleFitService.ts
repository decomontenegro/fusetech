import { Database } from '../database';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { google, oauth2_v2 } from 'googleapis';
import { GoogleFitActivityTypeMap, GoogleFitDataTypeMap } from '../schemas/googleFit';
import { ActivityService } from './activityService';
import { FraudDetectionService } from './fraudDetectionService';

interface GoogleFitSession {
  id: string;
  name: string;
  description?: string;
  startTimeMillis: number;
  endTimeMillis: number;
  activityType: number;
  application?: {
    packageName: string;
    version: string;
  };
  activityTypeConfidence?: number;
  activeTimeMillis?: number;
}

interface GoogleFitDataPoint {
  dataTypeName: string;
  startTimeNanos: number;
  endTimeNanos: number;
  value: Array<{
    intVal?: number;
    fpVal?: number;
    stringVal?: string;
    mapVal?: Array<{
      key: string;
      value: {
        intVal?: number;
        fpVal?: number;
        stringVal?: string;
      };
    }>;
  }>;
  originDataSourceId?: string;
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

export class GoogleFitService {
  private db: Database;
  private redis: Redis;
  private activityService: ActivityService;
  private fraudDetectionService: FraudDetectionService;
  private oauth2Client: any;

  constructor(db: Database, redis: Redis) {
    this.db = db;
    this.redis = redis;
    this.activityService = new ActivityService(db, redis);
    this.fraudDetectionService = new FraudDetectionService(db, redis);
    
    // Configurar cliente OAuth2
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Gera URL de autenticação para o Google Fit
   */
  async getAuthUrl(userId: string, redirectUri: string): Promise<string> {
    // Armazenar redirectUri para uso no callback
    await this.redis.set(`google_fit:redirect:${userId}`, redirectUri, 'EX', 3600);
    
    // Configurar cliente OAuth2 com o redirectUri específico
    this.oauth2Client.redirectUri = redirectUri;
    
    // Gerar URL de autenticação
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.location.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
    
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: userId
    });
    
    return authUrl;
  }

  /**
   * Processa o callback de autenticação do Google Fit
   */
  async handleAuthCallback(userId: string, code: string, redirectUri: string) {
    try {
      // Configurar cliente OAuth2 com o redirectUri específico
      this.oauth2Client.redirectUri = redirectUri;
      
      // Trocar código por tokens
      const { tokens } = await this.oauth2Client.getToken(code);
      
      // Obter informações do usuário
      this.oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2('v2');
      const userInfo = await oauth2.userinfo.get({ auth: this.oauth2Client });
      
      // Salvar conexão
      const connection = {
        id: uuidv4(),
        userId,
        source: 'google_fit',
        connected: true,
        googleUserId: userInfo.data.id,
        googleEmail: userInfo.data.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600000)),
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
      
      // Verificar se já existe uma conexão
      const existingConnection = await this.db.collection('health_connections').findOne({
        userId,
        source: 'google_fit'
      });
      
      if (existingConnection) {
        // Atualizar conexão existente
        await this.db.collection('health_connections').updateOne(
          { _id: existingConnection._id },
          { 
            $set: { 
              connected: true,
              googleUserId: userInfo.data.id,
              googleEmail: userInfo.data.email,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token || existingConnection.refreshToken,
              expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600000)),
              updatedAt: new Date()
            } 
          }
        );
      } else {
        // Criar nova conexão
        await this.db.collection('health_connections').insertOne(connection);
      }
      
      return { connected: true };
    } catch (error) {
      console.error('Erro ao processar callback do Google Fit:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está conectado ao Google Fit
   */
  async isConnected(userId: string): Promise<boolean> {
    const connection = await this.db.collection('health_connections').findOne({
      userId,
      source: 'google_fit',
      connected: true
    });
    
    return !!connection;
  }

  /**
   * Obtém o status da conexão com o Google Fit
   */
  async getConnectionStatus(userId: string): Promise<ConnectionStatus> {
    const connection = await this.db.collection('health_connections').findOne({
      userId,
      source: 'google_fit'
    });
    
    if (!connection || !connection.connected) {
      return {
        connected: false
      };
    }
    
    return {
      connected: true,
      lastSync: connection.lastSync ? connection.lastSync.toISOString() : undefined,
      preferences: connection.preferences
    };
  }

  /**
   * Atualiza as preferências do Google Fit
   */
  async updatePreferences(userId: string, preferences: any) {
    const connection = await this.db.collection('health_connections').findOne({
      userId,
      source: 'google_fit'
    });
    
    if (!connection) {
      throw new Error('Usuário não está conectado ao Google Fit');
    }
    
    const updatedPreferences = {
      ...connection.preferences,
      ...preferences
    };
    
    await this.db.collection('health_connections').updateOne(
      { _id: connection._id },
      { $set: { preferences: updatedPreferences, updatedAt: new Date() } }
    );
    
    return updatedPreferences;
  }

  /**
   * Remove a conexão com o Google Fit
   */
  async removeConnection(userId: string) {
    await this.db.collection('health_connections').updateOne(
      { userId, source: 'google_fit' },
      { $set: { connected: false, updatedAt: new Date() } }
    );
  }

  /**
   * Sincroniza dados do Google Fit
   */
  async syncData(userId: string, startDate?: Date, endDate?: Date) {
    try {
      // Obter conexão
      const connection = await this.db.collection('health_connections').findOne({
        userId,
        source: 'google_fit',
        connected: true
      });
      
      if (!connection) {
        throw new Error('Usuário não está conectado ao Google Fit');
      }
      
      // Configurar cliente OAuth2
      this.oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
        expiry_date: connection.expiresAt.getTime()
      });
      
      // Verificar se o token expirou
      if (connection.expiresAt < new Date()) {
        // Atualizar token
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        
        // Atualizar na base de dados
        await this.db.collection('health_connections').updateOne(
          { _id: connection._id },
          { 
            $set: { 
              accessToken: credentials.access_token,
              expiresAt: new Date(Date.now() + (credentials.expiry_date || 3600000)),
              updatedAt: new Date()
            } 
          }
        );
        
        // Atualizar cliente
        this.oauth2Client.setCredentials(credentials);
      }
      
      // Definir período de sincronização
      const syncStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
      const syncEndDate = endDate || new Date();
      
      // Sincronizar sessões de atividade
      const fitness = google.fitness('v1');
      
      if (connection.preferences.syncWorkouts) {
        const sessionsResponse = await fitness.users.sessions.list({
          auth: this.oauth2Client,
          userId: 'me',
          startTime: syncStartDate.toISOString(),
          endTime: syncEndDate.toISOString()
        });
        
        // Processar sessões
        if (sessionsResponse.data.session && sessionsResponse.data.session.length > 0) {
          for (const session of sessionsResponse.data.session) {
            await this.processSession(userId, session);
          }
        }
      }
      
      // Atualizar timestamp da última sincronização
      await this.db.collection('health_connections').updateOne(
        { _id: connection._id },
        { $set: { lastSync: new Date(), updatedAt: new Date() } }
      );
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao sincronizar dados do Google Fit:', error);
      throw error;
    }
  }

  /**
   * Processa uma sessão do Google Fit
   */
  private async processSession(userId: string, session: any) {
    try {
      // Verificar se a sessão já foi processada
      const existingActivity = await this.db.collection('activities').findOne({
        userId,
        source: 'google_fit',
        'sourceData.id': session.id
      });
      
      if (existingActivity) {
        return; // Pular sessões já processadas
      }
      
      // Mapear tipo de atividade
      const activityType = this.mapActivityType(session.activityType);
      
      // Calcular duração em segundos
      const duration = (session.endTimeMillis - session.startTimeMillis) / 1000;
      
      // Criar atividade
      const activity = {
        id: uuidv4(),
        userId,
        type: activityType,
        source: 'google_fit',
        sourceId: session.id,
        startTime: new Date(parseInt(session.startTimeMillis)),
        endTime: new Date(parseInt(session.endTimeMillis)),
        duration,
        distance: 0, // Será atualizado com dados adicionais
        calories: 0, // Será atualizado com dados adicionais
        sourceData: session,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Obter dados adicionais (distância, calorias, etc.)
      await this.fetchActivityDetails(activity);
      
      // Verificar fraude
      const fraudCheck = await this.fraudDetectionService.checkActivity(activity);
      
      if (fraudCheck.isSuspicious) {
        activity.status = 'flagged';
        activity.fraudScore = fraudCheck.score;
        activity.fraudReasons = fraudCheck.reasons;
      }
      
      // Salvar atividade
      await this.db.collection('activities').insertOne(activity);
      
      // Enfileirar para processamento de pontos
      if (activity.status !== 'flagged') {
        await this.redis.rpush('activity:points:queue', JSON.stringify({
          activityId: activity.id,
          userId: activity.userId,
          timestamp: new Date().toISOString()
        }));
      }
      
      return activity;
    } catch (error) {
      console.error('Erro ao processar sessão do Google Fit:', error);
      throw error;
    }
  }

  /**
   * Busca detalhes adicionais da atividade
   */
  private async fetchActivityDetails(activity: any) {
    try {
      // Implementar busca de detalhes como distância, calorias, etc.
      // Esta é uma implementação simplificada
      
      // Atualizar atividade com dados fictícios para exemplo
      activity.distance = Math.random() * 10000; // Metros
      activity.calories = Math.random() * 500; // Calorias
      
      return activity;
    } catch (error) {
      console.error('Erro ao buscar detalhes da atividade:', error);
      return activity;
    }
  }

  /**
   * Mapeia o tipo de atividade do Google Fit para o tipo interno
   */
  private mapActivityType(googleFitType: number): string {
    return GoogleFitActivityTypeMap[googleFitType] || 'other';
  }
}
