import OpenAI from 'openai';
import { OpenAIPlanRequest, OpenAIPlanResponse } from '../types';

// Inicializar cliente da OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Serviço para interação com a API da OpenAI
 */
export class OpenAIService {
  /**
   * Gera um plano de treino personalizado usando a API da OpenAI
   */
  async generateTrainingPlan(request: OpenAIPlanRequest): Promise<OpenAIPlanResponse> {
    try {
      // Construir prompt para a OpenAI
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request);

      // Chamar a API da OpenAI
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      // Extrair e processar o conteúdo da resposta
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('A API da OpenAI retornou uma resposta vazia');
      }

      // Analisar JSON da resposta
      return JSON.parse(content) as OpenAIPlanResponse;
    } catch (error: any) {
      console.error('Erro ao gerar plano com OpenAI:', error);
      throw new Error(`Falha ao gerar plano de treino: ${error.message}`);
    }
  }

  /**
   * Constrói o prompt do sistema para a API
   */
  private buildSystemPrompt(): string {
    return `Você é um treinador profissional especializado em criar planos de treino personalizados. 
    Sua tarefa é criar um plano de treino detalhado com base no perfil e objetivos do usuário.
    
    Suas saídas devem seguir estas diretrizes:
    1. Sempre considere o nível de condicionamento físico atual do usuário
    2. Respeite as limitações físicas informadas
    3. Considere as preferências do usuário quanto a horários e tipos de exercício
    4. Crie uma progressão gradual e segura
    5. Forneça instruções claras e específicas para cada treino
    6. Inclua métricas de progresso mensuráveis
    7. Forneça sua resposta no formato JSON conforme a estrutura fornecida
    
    Você deve criar um programa equilibrado que leve em consideração:
    - Descanso e recuperação adequados
    - Variação de intensidade e tipos de exercício
    - Progressão gradual ao longo das semanas
    - Adaptação às capacidades individuais do usuário`;
  }

  /**
   * Constrói o prompt do usuário com base nos dados fornecidos
   */
  private buildUserPrompt(request: OpenAIPlanRequest): string {
    return `Por favor, crie um plano de treino personalizado com base no seguinte perfil:
    
    Perfil do usuário:
    - Nível de condicionamento: ${request.profile.fitnessLevel}
    - Esporte principal: ${request.profile.primarySport}
    - Objetivos: ${request.profile.goals.join(', ')}
    ${request.profile.specificGoals ? `- Objetivos específicos: ${request.profile.specificGoals.join(', ')}` : ''}
    - Exercícios preferidos: ${request.profile.preferences.preferredExercises.join(', ')}
    ${request.profile.preferences.preferredDayTime ? `- Horário preferido: ${request.profile.preferences.preferredDayTime}` : ''}
    ${request.profile.preferences.preferredDuration ? `- Duração preferida: ${request.profile.preferences.preferredDuration} minutos` : ''}
    ${request.profile.preferences.preferredFrequency ? `- Frequência preferida: ${request.profile.preferences.preferredFrequency} dias por semana` : ''}
    ${request.profile.experienceYears ? `- Anos de experiência: ${request.profile.experienceYears}` : ''}
    
    ${request.profile.healthMetrics ? `Métricas de saúde:
    ${request.profile.healthMetrics.height ? `- Altura: ${request.profile.healthMetrics.height} cm` : ''}
    ${request.profile.healthMetrics.weight ? `- Peso: ${request.profile.healthMetrics.weight} kg` : ''}
    ${request.profile.healthMetrics.restingHeartRate ? `- Frequência cardíaca em repouso: ${request.profile.healthMetrics.restingHeartRate} bpm` : ''}
    ${request.profile.healthMetrics.maxHeartRate ? `- Frequência cardíaca máxima: ${request.profile.healthMetrics.maxHeartRate} bpm` : ''}
    ${request.profile.healthMetrics.limitations?.length ? `- Limitações: ${request.profile.healthMetrics.limitations.join(', ')}` : ''}` : ''}
    
    ${request.profile.personalRecords?.length ? `Recordes pessoais:
    ${request.profile.personalRecords.map(record => `- ${record.type}: ${record.value}`).join('\n')}` : ''}
    
    Requisitos do plano:
    - Duração: ${request.planOptions.duration} semanas
    - Objetivo principal: ${request.planOptions.goal}
    - Tipo principal: ${request.planOptions.primaryType}
    ${request.planOptions.targetValue ? `- Valor alvo: ${request.planOptions.targetValue} ${request.planOptions.targetUnit || ''}` : ''}
    
    Gere um plano detalhado no formato JSON conforme o exemplo abaixo, com todos os campos obrigatórios:
    {
      "title": "Título do plano",
      "description": "Descrição detalhada do plano",
      "level": "beginner|intermediate|advanced|elite",
      "primaryType": "running|cycling|walking|etc",
      "duration": 8, // em semanas
      "goal": "endurance|strength|weight_loss|etc",
      "specificGoal": "Objetivo específico em texto",
      "schedule": [
        {
          "day": 0, // 0-6 (domingo-sábado)
          "workouts": [
            {
              "title": "Título do treino",
              "description": "Descrição breve",
              "type": "running|cycling|etc",
              "duration": 30, // em minutos
              "distance": 5000, // em metros (opcional)
              "intensity": "recovery|easy|moderate|hard|maximum",
              "targetHeartRate": {
                "min": 120, // opcional
                "max": 140 // opcional
              },
              "instructions": "Instruções detalhadas para o treino"
            }
          ]
        }
      ],
      "progressMetrics": [
        {
          "type": "distance|time|pace|etc",
          "current": 5, // valor inicial
          "target": 10, // valor alvo
          "unit": "km|min|kg|etc" // unidade
        }
      ],
      "notes": ["Nota 1", "Nota 2"], // observações gerais
      "adaptationRules": ["Regra 1", "Regra 2"] // regras para adaptação do plano
    }`;
  }
  
  /**
   * Adapta um plano de treino com base no feedback do usuário
   */
  async adaptTrainingPlan(
    originalPlan: OpenAIPlanResponse,
    userFeedback: string,
    recentPerformance: any
  ): Promise<OpenAIPlanResponse> {
    try {
      // Construir prompt para a OpenAI
      const prompt = this.buildAdaptationPrompt(originalPlan, userFeedback, recentPerformance);

      // Chamar a API da OpenAI
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
        messages: [
          { 
            role: 'system', 
            content: `Você é um treinador adaptativo que ajusta planos de treino baseado no progresso e feedback do usuário.
                     Forneça um plano adaptado no formato JSON.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      // Extrair e processar o conteúdo da resposta
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('A API da OpenAI retornou uma resposta vazia');
      }

      // Analisar JSON da resposta
      return JSON.parse(content) as OpenAIPlanResponse;
    } catch (error: any) {
      console.error('Erro ao adaptar plano com OpenAI:', error);
      throw new Error(`Falha ao adaptar plano de treino: ${error.message}`);
    }
  }

  /**
   * Constrói o prompt para adaptação do plano
   */
  private buildAdaptationPrompt(
    originalPlan: OpenAIPlanResponse,
    userFeedback: string,
    recentPerformance: any
  ): string {
    return `Por favor, adapte o seguinte plano de treino com base no feedback e desempenho recente do usuário:

    Plano original:
    ${JSON.stringify(originalPlan, null, 2)}
    
    Feedback do usuário:
    ${userFeedback}
    
    Desempenho recente:
    ${JSON.stringify(recentPerformance, null, 2)}
    
    Por favor, forneça um plano adaptado que:
    1. Ajuste a intensidade ou volume com base no feedback
    2. Mantenha a estrutura geral do plano original
    3. Modifique elementos específicos conforme necessário
    4. Adicione uma nota explicando as adaptações feitas
    
    Forneça o plano adaptado no formato JSON, seguindo a mesma estrutura do plano original.`;
  }
}

// Exportar instância singleton
export const openAIService = new OpenAIService(); 