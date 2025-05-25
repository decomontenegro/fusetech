import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { openAIService } from './openai';
import { FitnessLevel, AITrainingPlan } from '@fuseapp/types';

// Inicializar cliente do Supabase
const supabase = createClient(
  config.db.supabaseUrl,
  config.db.supabaseKey
);

/**
 * Serviço para gerenciar planos de treino em fases de progressão
 */
export class PhaseService {
  /**
   * Cria um plano completo com várias fases de progressão
   */
  async createPhasedPlan(
    userId: string,
    goal: string,
    primaryType: string,
    duration: number,
    startingLevel: FitnessLevel
  ): Promise<{ phases: AITrainingPlan[], phasedPlanId: string }> {
    try {
      // Gerar ID para o plano em fases
      const phasedPlanId = uuidv4();
      const now = new Date().toISOString();
      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('sport_profiles')
        .select('*')
        .eq('userId', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Falha ao buscar perfil do usuário: ${profileError.message}`);
      }
      
      // Determinar nível de fitness do usuário
      const fitnessLevel = startingLevel || (profile?.fitnessLevel || FitnessLevel.BEGINNER);
      
      // Calcular duração de cada fase
      const phaseDuration = Math.max(1, Math.floor(duration / config.phases.count));
      const remainingWeeks = duration % config.phases.count;
      
      // Distribuir semanas restantes entre as fases
      const phaseDurations = Array(config.phases.count).fill(phaseDuration);
      for (let i = 0; i < remainingWeeks; i++) {
        phaseDurations[i]++;
      }
      
      // Preparar progressão de níveis de fitness
      const progressionMap = this.calculateFitnessProgression(fitnessLevel, config.phases.count);
      
      // Criar planos para cada fase
      const phases: AITrainingPlan[] = [];
      
      for (let i = 0; i < config.phases.count; i++) {
        const phaseNumber = i + 1;
        const phaseLevel = progressionMap[i];
        const phaseName = config.phases.names[i];
        
        // Ajustar descrição de cada fase baseado na progressão
        const phaseDescription = this.getPhaseDescription(phaseNumber, phaseName, phaseLevel);
        
        // Ajustar objetivo específico baseado na fase
        const phaseGoal = this.adjustGoalForPhase(goal, phaseNumber);
        
        // Preparar dados para o OpenAI
        const planRequest = {
          userId,
          profile: {
            ...profile,
            fitnessLevel: phaseLevel
          },
          planOptions: {
            duration: phaseDurations[i],
            goal: phaseGoal,
            primaryType,
            phase: {
              number: phaseNumber,
              name: phaseName,
              total: config.phases.count
            }
          }
        };
        
        // Gerar plano para esta fase
        const aiPlan = await openAIService.generateTrainingPlan(planRequest);
        
        // Criar ID único para o plano
        const planId = uuidv4();
        
        // Preparar dados para salvar no banco
        const planData = {
          id: planId,
          userId,
          phasedPlanId, // Associar ao plano em fases
          phaseNumber,
          phaseName,
          title: `${phaseName}: ${aiPlan.title}`,
          description: phaseDescription,
          level: phaseLevel,
          primaryType: aiPlan.primaryType,
          duration: phaseDurations[i],
          goal: phaseGoal,
          specificGoal: aiPlan.specificGoal,
          schedule: aiPlan.schedule,
          progressMetrics: aiPlan.progressMetrics,
          notes: [
            `Fase ${phaseNumber} de ${config.phases.count}: ${phaseName}`,
            ...aiPlan.notes
          ],
          adaptationRules: aiPlan.adaptationRules,
          status: i === 0 ? 'active' : 'upcoming',
          aiGenerated: true,
          aiModel: config.openai.model,
          createdAt: now,
          updatedAt: now
        };
        
        // Salvar no banco de dados
        const { error: insertError } = await supabase
          .from('training_plans')
          .insert(planData);
          
        if (insertError) {
          throw new Error(`Falha ao salvar plano de fase ${phaseNumber}: ${insertError.message}`);
        }
        
        phases.push(planData as unknown as AITrainingPlan);
      }
      
      // Registrar o plano em fases
      const { error: phasedPlanError } = await supabase
        .from('phased_plans')
        .insert({
          id: phasedPlanId,
          userId,
          title: `Plano Progressivo de ${this.getExerciseTypeLabel(primaryType)}`,
          description: `Plano completo de progressão em ${config.phases.count} fases, from ${this.getFitnessLevelLabel(fitnessLevel)} até ${this.getFitnessLevelLabel(progressionMap[config.phases.count - 1])}`,
          primaryType,
          goal,
          totalDuration: duration,
          currentPhase: 1,
          totalPhases: config.phases.count,
          startingLevel: fitnessLevel,
          targetLevel: progressionMap[config.phases.count - 1],
          status: 'active',
          createdAt: now,
          updatedAt: now
        });
        
      if (phasedPlanError) {
        throw new Error(`Falha ao salvar plano em fases: ${phasedPlanError.message}`);
      }
      
      return { phases, phasedPlanId };
    } catch (error: any) {
      throw new Error(`Erro ao criar plano em fases: ${error.message}`);
    }
  }
  
  /**
   * Calcula a progressão de níveis de fitness ao longo das fases
   */
  private calculateFitnessProgression(
    startingLevel: FitnessLevel,
    phaseCount: number
  ): FitnessLevel[] {
    const levels = [
      FitnessLevel.BEGINNER,
      FitnessLevel.INTERMEDIATE,
      FitnessLevel.ADVANCED,
      FitnessLevel.ELITE
    ];
    
    const startIndex = levels.indexOf(startingLevel);
    if (startIndex === -1) {
      return Array(phaseCount).fill(FitnessLevel.BEGINNER);
    }
    
    // Determinar quantos níveis podem progredir
    const maxProgress = levels.length - startIndex - 1;
    
    // Se não houver progressão possível, manter o mesmo nível
    if (maxProgress === 0) {
      return Array(phaseCount).fill(startingLevel);
    }
    
    // Calcular progressão gradual
    const result: FitnessLevel[] = [];
    
    for (let i = 0; i < phaseCount; i++) {
      // Calcular progresso fracionário (0 a 1)
      const progress = i / (phaseCount - 1);
      
      // Calcular o índice de nível baseado no progresso
      const levelIndex = startIndex + Math.min(Math.floor(progress * (maxProgress + 0.99)), maxProgress);
      
      result.push(levels[levelIndex]);
    }
    
    return result;
  }
  
  /**
   * Retorna uma descrição personalizada para cada fase
   */
  private getPhaseDescription(phaseNumber: number, phaseName: string, level: FitnessLevel): string {
    const descriptions = {
      1: `Fase inicial focada em estabelecer uma base sólida de condicionamento e adaptação ao treinamento. Nesta fase, o foco está em desenvolver consistência e técnica apropriada.`,
      2: `Fase de desenvolvimento que aumenta gradualmente a intensidade e volume dos treinos. O foco está em construir sobre a base estabelecida e começar a desenvolver capacidades específicas.`,
      3: `Fase de progressão com desafios crescentes e treinos mais específicos. O foco está em melhorar eficiência e performance em intensidades moderadas a altas.`,
      4: `Fase de especialização com treinos de alta qualidade e foco nos objetivos específicos. Aumenta a intensidade e especificidade, aproximando-se de níveis de performance competitiva.`,
      5: `Fase final de performance, focada em maximizar o potencial atlético. Incorpora treinos de alta intensidade, tapering estratégico e preparação para atingir picos de performance.`
    };
    
    return descriptions[phaseNumber as keyof typeof descriptions] || 
      `Fase ${phaseNumber}: ${phaseName} - Nível ${this.getFitnessLevelLabel(level)}`;
  }
  
  /**
   * Ajusta o objetivo geral para ser específico de cada fase
   */
  private adjustGoalForPhase(goal: string, phaseNumber: number): string {
    switch (phaseNumber) {
      case 1:
        return `base_${goal}`;
      case 2:
        return `develop_${goal}`;
      case 3:
        return `progress_${goal}`;
      case 4:
        return `specialize_${goal}`;
      case 5:
        return `perform_${goal}`;
      default:
        return goal;
    }
  }
  
  /**
   * Retorna o rótulo localizado para o nível de fitness
   */
  private getFitnessLevelLabel(level: FitnessLevel): string {
    const labels = {
      [FitnessLevel.BEGINNER]: 'Iniciante',
      [FitnessLevel.INTERMEDIATE]: 'Intermediário',
      [FitnessLevel.ADVANCED]: 'Avançado',
      [FitnessLevel.ELITE]: 'Elite'
    };
    
    return labels[level] || 'Desconhecido';
  }
  
  /**
   * Retorna o rótulo localizado para o tipo de exercício
   */
  private getExerciseTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'running': 'Corrida',
      'cycling': 'Ciclismo',
      'walking': 'Caminhada',
      'swimming': 'Natação',
      'strength': 'Musculação',
      'hiit': 'HIIT',
      'yoga': 'Yoga',
      'other': 'Outro'
    };
    
    return labels[type] || type;
  }
  
  /**
   * Avança para a próxima fase do plano
   */
  async advanceToNextPhase(userId: string, phasedPlanId: string): Promise<{ 
    success: boolean, 
    newPhase: number, 
    plan: AITrainingPlan | null 
  }> {
    try {
      // Buscar informações do plano em fases
      const { data: phasedPlan, error: planError } = await supabase
        .from('phased_plans')
        .select('*')
        .eq('id', phasedPlanId)
        .eq('userId', userId)
        .single();
      
      if (planError) {
        throw new Error(`Falha ao buscar plano em fases: ${planError.message}`);
      }
      
      // Verificar se há uma próxima fase
      const currentPhase = phasedPlan.currentPhase;
      const totalPhases = phasedPlan.totalPhases;
      
      if (currentPhase >= totalPhases) {
        return { 
          success: false, 
          newPhase: currentPhase,
          plan: null 
        };
      }
      
      const newPhase = currentPhase + 1;
      
      // Atualizar fase atual no plano em fases
      const { error: updateError } = await supabase
        .from('phased_plans')
        .update({
          currentPhase: newPhase,
          updatedAt: new Date().toISOString()
        })
        .eq('id', phasedPlanId)
        .eq('userId', userId);
      
      if (updateError) {
        throw new Error(`Falha ao atualizar fase do plano: ${updateError.message}`);
      }
      
      // Marcar fase atual como concluída
      const { error: completeError } = await supabase
        .from('training_plans')
        .update({
          status: 'completed',
          endDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('phasedPlanId', phasedPlanId)
        .eq('phaseNumber', currentPhase);
      
      if (completeError) {
        throw new Error(`Falha ao marcar fase atual como concluída: ${completeError.message}`);
      }
      
      // Ativar próxima fase
      const { data: nextPhase, error: activateError } = await supabase
        .from('training_plans')
        .update({
          status: 'active',
          startDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('phasedPlanId', phasedPlanId)
        .eq('phaseNumber', newPhase)
        .select('*')
        .single();
      
      if (activateError) {
        throw new Error(`Falha ao ativar próxima fase: ${activateError.message}`);
      }
      
      return { 
        success: true, 
        newPhase,
        plan: nextPhase as unknown as AITrainingPlan
      };
    } catch (error: any) {
      throw new Error(`Erro ao avançar para próxima fase: ${error.message}`);
    }
  }
}

// Exportar instância singleton
export const phaseService = new PhaseService(); 