import { EffortMetrics, ActivityEffort } from '../types';
import config from '../config';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente do Supabase
const supabase = createClient(
  config.db.supabaseUrl,
  config.db.supabaseKey
);

/**
 * Serviço para cálculo de esforço e tokenização
 */
export class EffortService {
  /**
   * Calcula o esforço relativo e recompensa baseado no perfil do usuário
   * e métricas da atividade.
   */
  async calculateEffort(
    userId: string,
    activityId: string,
    activityType: string,
    effortMetrics: Partial<EffortMetrics>
  ): Promise<ActivityEffort> {
    try {
      // 1. Obter perfil do usuário para contextualização do esforço
      const { data: userProfile, error: profileError } = await supabase
        .from('sport_profiles')
        .select('fitnessLevel, primarySport, secondarySports')
        .eq('userId', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Falha ao buscar perfil do usuário: ${profileError.message}`);
      }
      
      // 2. Definir esforço absoluto (valor de entrada)
      const absoluteEffort = effortMetrics.absoluteEffort || 70; // Valor padrão se não fornecido
      
      // 3. Calcular esforço relativo com base no perfil do usuário
      let relativeEffort = absoluteEffort;
      
      if (userProfile) {
        // Ajustar com base no nível de fitness
        const fitnessLevel = userProfile.fitnessLevel || 'intermediate';
        const fitnessLevelModifier = this.getFitnessLevelModifier(fitnessLevel);
        
        // Ajustar com base no tipo de atividade (principal vs. secundário)
        const activityTypeModifier = this.getActivityTypeModifier(
          activityType,
          userProfile.primarySport,
          userProfile.secondarySports
        );
        
        // Aplicar contexto de fatores ambientais e de esforço percebido
        const contextModifier = this.calculateContextModifier(effortMetrics);
        
        // Aplicar ajustes ao esforço absoluto
        relativeEffort = Math.min(
          100,
          Math.max(0, absoluteEffort * fitnessLevelModifier * activityTypeModifier * contextModifier)
        );
      }
      
      // 4. Calcular recompensa baseada no esforço relativo
      const baseReward = this.getBaseReward(activityType);
      const effortMultiplier = this.calculateEffortMultiplier(relativeEffort);
      const calculatedReward = Math.round(baseReward * effortMultiplier);
      
      // 5. Preparar resultado
      const now = new Date().toISOString();
      
      const result: ActivityEffort = {
        activityId,
        userId,
        effortMetrics: {
          absoluteEffort,
          relativeEffort,
          ...effortMetrics
        } as EffortMetrics,
        calculatedReward,
        baseReward,
        effortMultiplier,
        createdAt: now
      };
      
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao calcular esforço: ${error.message}`);
    }
  }
  
  /**
   * Retorna o multiplicador para o nível de fitness
   */
  private getFitnessLevelModifier(fitnessLevel: string): number {
    return config.effort.fitnessLevelMultipliers[fitnessLevel as keyof typeof config.effort.fitnessLevelMultipliers] || 1.0;
  }
  
  /**
   * Retorna o modificador com base no tipo de atividade
   */
  private getActivityTypeModifier(
    activityType: string,
    primarySport?: string,
    secondarySports?: string[]
  ): number {
    // Se for o esporte principal do usuário, o esforço relativo é menor (mais eficiente)
    if (activityType === primarySport) {
      return config.effort.activityTypeMultipliers.primary;
    }
    
    // Se for um esporte secundário, o esforço relativo é um pouco menor
    if (secondarySports?.includes(activityType)) {
      return (config.effort.activityTypeMultipliers.primary + config.effort.activityTypeMultipliers.secondary) / 2;
    }
    
    // Se não for um esporte praticado pelo usuário, o esforço relativo é maior
    return config.effort.activityTypeMultipliers.secondary;
  }
  
  /**
   * Retorna a recompensa base para o tipo de atividade
   */
  private getBaseReward(activityType: string): number {
    return config.effort.baseRewards[activityType as keyof typeof config.effort.baseRewards] || 
           config.effort.baseRewards.other;
  }
  
  /**
   * Calcula o multiplicador de esforço com base no esforço relativo
   */
  private calculateEffortMultiplier(relativeEffort: number): number {
    const { min, max } = config.effort.effortMultiplierRange;
    // Escala de min a max baseado no esforço relativo (0-100%)
    return min + ((relativeEffort / 100) * (max - min));
  }
  
  /**
   * Calcula um modificador baseado em fatores contextuais (clima, terreno, etc)
   */
  private calculateContextModifier(effortMetrics: Partial<EffortMetrics>): number {
    let modifier = 1.0;
    const contextualFactors = effortMetrics.contextualFactors;
    
    if (!contextualFactors) {
      return modifier;
    }
    
    // Ajuste para terreno
    if (contextualFactors.terrain) {
      switch (contextualFactors.terrain) {
        case 'flat': modifier *= 1.0; break;
        case 'hilly': modifier *= 1.1; break;
        case 'mixed': modifier *= 1.05; break;
        case 'mountainous': modifier *= 1.2; break;
      }
    }
    
    // Ajuste para clima
    if (contextualFactors.weather) {
      switch (contextualFactors.weather) {
        case 'normal': modifier *= 1.0; break;
        case 'hot': modifier *= 1.15; break;
        case 'cold': modifier *= 1.05; break;
        case 'rainy': modifier *= 1.1; break;
        case 'windy': modifier *= 1.1; break;
      }
    }
    
    // Ajuste para altitude (cada 500m acima de 1000m adiciona 2% de dificuldade)
    if (contextualFactors.altitude && contextualFactors.altitude > 1000) {
      const altitudeEffect = 1.0 + (0.02 * Math.floor((contextualFactors.altitude - 1000) / 500));
      modifier *= altitudeEffect;
    }
    
    // Ajuste para sono insuficiente (menos de 7 horas aumenta a dificuldade)
    if (contextualFactors.sleep && contextualFactors.sleep < 7) {
      const sleepEffect = 1.0 + (0.05 * (7 - contextualFactors.sleep));
      modifier *= sleepEffect;
    }
    
    // Ajuste para recuperação (0-100, onde 0 é sem recuperação)
    if (contextualFactors.recovery !== undefined) {
      const recoveryEffect = 1.0 + (0.2 * (1 - (contextualFactors.recovery / 100)));
      modifier *= recoveryEffect;
    }
    
    return modifier;
  }
  
  /**
   * Salva o resultado do cálculo de esforço no banco de dados
   */
  async saveEffortCalculation(effortData: ActivityEffort): Promise<ActivityEffort> {
    const { error } = await supabase
      .from('activity_efforts')
      .insert(effortData);
    
    if (error) {
      throw new Error(`Falha ao salvar cálculo de esforço: ${error.message}`);
    }
    
    return effortData;
  }
  
  /**
   * Recupera o histórico de esforço de um usuário
   */
  async getUserEffortHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    startDate?: string,
    endDate?: string
  ): Promise<{ efforts: ActivityEffort[], total: number }> {
    try {
      // Construir query
      let query = supabase
        .from('activity_efforts')
        .select('*', { count: 'exact' })
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);
      
      // Aplicar filtros de data se fornecidos
      if (startDate) {
        query = query.gte('createdAt', startDate);
      }
      
      if (endDate) {
        query = query.lte('createdAt', endDate);
      }
      
      // Executar query
      const { data, count, error } = await query;
      
      if (error) {
        throw new Error(`Falha ao buscar histórico de esforço: ${error.message}`);
      }
      
      return {
        efforts: data as ActivityEffort[] || [],
        total: count || 0
      };
    } catch (error: any) {
      throw new Error(`Erro ao buscar histórico de esforço: ${error.message}`);
    }
  }
}

// Exportar instância singleton
export const effortService = new EffortService(); 