/**
 * FUSEtech Intelligent Triggers System
 * Sistema de triggers contextuais baseado em machine learning e behavioral patterns
 * Implementa nudges personalizados e timing otimizado
 */

class IntelligentTriggersSystem {
  constructor() {
    this.userBehaviorProfile = this.loadBehaviorProfile();
    this.contextualData = this.loadContextualData();
    this.triggerHistory = this.loadTriggerHistory();
    this.activeTriggers = new Map();
    this.nudgeQueue = [];
    this.isLearning = true;
    
    this.init();
  }

  init() {
    this.setupBehaviorTracking();
    this.setupContextualTriggers();
    this.setupPersonalizedNudges();
    this.setupTimingOptimization();
    this.setupA_B_Testing();
    this.startIntelligentMonitoring();
  }

  /**
   * BEHAVIORAL PATTERN ANALYSIS
   */
  setupBehaviorTracking() {
    // Rastrear padrões de uso
    this.trackPageViews();
    this.trackClickPatterns();
    this.trackTimeSpent();
    this.trackActivityPatterns();
    this.trackEngagementLevels();
  }

  trackActivityPatterns() {
    const patterns = {
      timeOfDay: this.analyzeTimePatterns(),
      dayOfWeek: this.analyzeDayPatterns(),
      frequency: this.analyzeFrequencyPatterns(),
      duration: this.analyzeDurationPatterns(),
      intensity: this.analyzeIntensityPatterns()
    };
    
    this.userBehaviorProfile.activityPatterns = patterns;
    this.saveBehaviorProfile();
  }

  analyzeTimePatterns() {
    // Analisar horários preferidos para atividades
    const activities = this.getRecentActivities();
    const timeSlots = {
      morning: 0,    // 6-12h
      afternoon: 0,  // 12-18h
      evening: 0,    // 18-22h
      night: 0       // 22-6h
    };
    
    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else if (hour >= 18 && hour < 22) timeSlots.evening++;
      else timeSlots.night++;
    });
    
    return timeSlots;
  }

  /**
   * CONTEXTUAL TRIGGERS
   */
  setupContextualTriggers() {
    // Triggers baseados em contexto
    this.setupWeatherTriggers();
    this.setupLocationTriggers();
    this.setupSocialTriggers();
    this.setupCalendarTriggers();
    this.setupDeviceTriggers();
  }

  setupWeatherTriggers() {
    // Triggers baseados no clima
    this.getWeatherData().then(weather => {
      const triggers = this.generateWeatherTriggers(weather);
      triggers.forEach(trigger => this.scheduleTrigger(trigger));
    });
  }

  generateWeatherTriggers(weather) {
    const triggers = [];
    
    if (weather.condition === 'sunny' && weather.temperature > 20) {
      triggers.push({
        type: 'weather_opportunity',
        message: '☀️ Dia perfeito para uma corrida ao ar livre!',
        action: 'suggest_outdoor_activity',
        priority: 'high',
        timing: 'immediate'
      });
    }
    
    if (weather.condition === 'rainy') {
      triggers.push({
        type: 'weather_alternative',
        message: '🌧️ Que tal um treino indoor hoje?',
        action: 'suggest_indoor_activity',
        priority: 'medium',
        timing: 'delayed'
      });
    }
    
    return triggers;
  }

  setupSocialTriggers() {
    // Triggers baseados em atividade social
    this.monitorFriendActivity();
    this.setupCompetitiveTriggers();
    this.setupCollaborativeTriggers();
  }

  monitorFriendActivity() {
    // Simular monitoramento de atividade de amigos
    const friendActivities = this.getFriendActivities();
    
    friendActivities.forEach(activity => {
      if (this.shouldTriggerSocialNudge(activity)) {
        this.scheduleTrigger({
          type: 'social_motivation',
          message: `🏃‍♂️ ${activity.friendName} acabou de correr ${activity.distance}km! Que tal se juntar?`,
          action: 'suggest_similar_activity',
          priority: 'medium',
          timing: 'within_hour',
          data: activity
        });
      }
    });
  }

  /**
   * PERSONALIZED NUDGES
   */
  setupPersonalizedNudges() {
    // Nudges baseados no perfil comportamental
    this.createMotivationalNudges();
    this.createHabitFormationNudges();
    this.createGoalProgressNudges();
    this.createStreakProtectionNudges();
  }

  createMotivationalNudges() {
    const motivationProfile = this.userBehaviorProfile.motivationProfile || 'achiever';
    
    const nudgeStrategies = {
      achiever: {
        messages: [
          '🏆 Você está a apenas uma atividade de bater seu recorde!',
          '📈 Sua performance melhorou 15% este mês!',
          '🎯 Faltam só 2km para sua meta semanal!'
        ],
        timing: 'goal_proximity',
        frequency: 'high'
      },
      
      socializer: {
        messages: [
          '👥 3 amigos já treinaram hoje. Não fique para trás!',
          '🤝 Maria te desafiou para uma corrida!',
          '📱 Compartilhe seu progresso e inspire outros!'
        ],
        timing: 'social_activity',
        frequency: 'medium'
      },
      
      explorer: {
        messages: [
          '🗺️ Descubra uma nova rota hoje!',
          '🌟 Experimente um tipo diferente de atividade!',
          '📍 Há um parque novo a 2km de você!'
        ],
        timing: 'routine_break',
        frequency: 'medium'
      }
    };
    
    const strategy = nudgeStrategies[motivationProfile];
    this.schedulePersonalizedNudges(strategy);
  }

  createStreakProtectionNudges() {
    const streakData = this.getStreakData();
    
    if (streakData.current >= 3) {
      // Usuário tem uma sequência valiosa
      const hoursUntilRisk = this.calculateHoursUntilStreakLoss();
      
      if (hoursUntilRisk <= 6) {
        this.scheduleTrigger({
          type: 'streak_protection',
          message: `🔥 Sua sequência de ${streakData.current} dias está em risco! ${Math.floor(hoursUntilRisk)}h restantes`,
          action: 'urgent_activity_suggestion',
          priority: 'critical',
          timing: 'immediate',
          data: { streak: streakData.current, hoursLeft: hoursUntilRisk }
        });
      } else if (hoursUntilRisk <= 12) {
        this.scheduleTrigger({
          type: 'streak_reminder',
          message: `⚡ Mantenha sua sequência de ${streakData.current} dias viva!`,
          action: 'gentle_reminder',
          priority: 'high',
          timing: 'within_hour'
        });
      }
    }
  }

  /**
   * TIMING OPTIMIZATION
   */
  setupTimingOptimization() {
    // Otimizar timing dos nudges baseado em padrões
    this.analyzeOptimalTiming();
    this.setupAdaptiveTiming();
    this.implementFatigueManagement();
  }

  analyzeOptimalTiming() {
    const engagementData = this.getEngagementData();
    const optimalTimes = {};
    
    // Analisar horários com maior engajamento
    Object.keys(engagementData).forEach(hour => {
      const engagement = engagementData[hour];
      if (engagement.clickRate > 0.3 && engagement.conversionRate > 0.15) {
        optimalTimes[hour] = {
          clickRate: engagement.clickRate,
          conversionRate: engagement.conversionRate,
          score: engagement.clickRate * engagement.conversionRate
        };
      }
    });
    
    this.userBehaviorProfile.optimalTiming = optimalTimes;
    return optimalTimes;
  }

  implementFatigueManagement() {
    // Evitar fadiga de notificação
    const recentTriggers = this.getRecentTriggers(24); // Últimas 24h
    
    if (recentTriggers.length >= 5) {
      // Muitos triggers recentes - reduzir frequência
      this.adjustTriggerFrequency('reduce');
    } else if (recentTriggers.length <= 1) {
      // Poucos triggers - pode aumentar
      this.adjustTriggerFrequency('increase');
    }
  }

  /**
   * A/B TESTING SYSTEM
   */
  setupA_B_Testing() {
    this.runningTests = new Map();
    this.testResults = new Map();
    
    // Testar diferentes tipos de mensagem
    this.setupMessageTesting();
    this.setupTimingTesting();
    this.setupFrequencyTesting();
  }

  setupMessageTesting() {
    const messageTests = [
      {
        id: 'motivation_style',
        variants: {
          A: 'achievement_focused', // "Você está quase lá!"
          B: 'social_focused',      // "Seus amigos estão na frente!"
          C: 'health_focused'       // "Seu corpo agradece!"
        },
        metric: 'conversion_rate'
      },
      
      {
        id: 'urgency_level',
        variants: {
          A: 'high_urgency',    // "Apenas 2h restantes!"
          B: 'medium_urgency',  // "Não esqueça de treinar hoje"
          C: 'low_urgency'      // "Quando puder, que tal treinar?"
        },
        metric: 'engagement_rate'
      }
    ];
    
    messageTests.forEach(test => this.startA_B_Test(test));
  }

  startA_B_Test(test) {
    const userVariant = this.assignUserToVariant(test);
    this.runningTests.set(test.id, {
      ...test,
      userVariant,
      startDate: new Date(),
      interactions: 0,
      conversions: 0
    });
  }

  /**
   * INTELLIGENT MONITORING
   */
  startIntelligentMonitoring() {
    // Monitoramento contínuo e aprendizado
    setInterval(() => {
      this.updateBehaviorProfile();
      this.optimizeTriggers();
      this.analyzeTestResults();
      this.adaptStrategies();
    }, 300000); // A cada 5 minutos
  }

  updateBehaviorProfile() {
    // Atualizar perfil baseado em novas interações
    const recentInteractions = this.getRecentInteractions();
    
    recentInteractions.forEach(interaction => {
      this.updateEngagementScore(interaction);
      this.updatePreferences(interaction);
      this.updateOptimalTiming(interaction);
    });
  }

  optimizeTriggers() {
    // Otimizar triggers baseado em performance
    const triggerPerformance = this.analyzeTriggerPerformance();
    
    Object.keys(triggerPerformance).forEach(triggerType => {
      const performance = triggerPerformance[triggerType];
      
      if (performance.conversionRate < 0.1) {
        // Performance baixa - ajustar ou desabilitar
        this.adjustTriggerStrategy(triggerType, 'reduce');
      } else if (performance.conversionRate > 0.3) {
        // Performance alta - aumentar frequência
        this.adjustTriggerStrategy(triggerType, 'increase');
      }
    });
  }

  /**
   * TRIGGER EXECUTION
   */
  scheduleTrigger(trigger) {
    const optimalTime = this.calculateOptimalTime(trigger);
    const delay = optimalTime - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        this.executeTrigger(trigger);
      }, delay);
    } else {
      this.executeTrigger(trigger);
    }
  }

  executeTrigger(trigger) {
    // Verificar se ainda é relevante
    if (!this.isTriggerStillRelevant(trigger)) {
      return;
    }
    
    // Executar trigger baseado no tipo
    switch (trigger.action) {
      case 'show_notification':
        this.showIntelligentNotification(trigger);
        break;
      case 'suggest_activity':
        this.suggestPersonalizedActivity(trigger);
        break;
      case 'show_social_proof':
        this.showSocialProof(trigger);
        break;
      case 'create_urgency':
        this.createUrgencyNudge(trigger);
        break;
    }
    
    // Registrar execução para aprendizado
    this.recordTriggerExecution(trigger);
  }

  showIntelligentNotification(trigger) {
    if (window.desktopNotifications) {
      const notificationId = window.desktopNotifications.info(
        trigger.title || 'FUSEtech',
        trigger.message,
        {
          actions: trigger.actions || [],
          duration: trigger.duration || 8000,
          persistent: trigger.priority === 'critical'
        }
      );
      
      // Rastrear interação
      this.trackTriggerInteraction(trigger, 'shown', notificationId);
    }
  }

  /**
   * UTILITY METHODS
   */
  
  loadBehaviorProfile() {
    try {
      return JSON.parse(localStorage.getItem('fusetech-behavior-profile')) || {};
    } catch {
      return {};
    }
  }

  saveBehaviorProfile() {
    localStorage.setItem('fusetech-behavior-profile', JSON.stringify(this.userBehaviorProfile));
  }

  getRecentActivities() {
    // Simular dados de atividades recentes
    return [
      { timestamp: Date.now() - 86400000, type: 'running', duration: 30 },
      { timestamp: Date.now() - 172800000, type: 'cycling', duration: 45 },
      { timestamp: Date.now() - 259200000, type: 'running', duration: 25 }
    ];
  }

  async getWeatherData() {
    // Simular dados meteorológicos
    return {
      condition: Math.random() > 0.7 ? 'rainy' : 'sunny',
      temperature: Math.floor(Math.random() * 20) + 15,
      humidity: Math.floor(Math.random() * 50) + 30
    };
  }

  getFriendActivities() {
    // Simular atividades de amigos
    return [
      { friendName: 'Ana', distance: 5.2, type: 'running', timestamp: Date.now() - 3600000 },
      { friendName: 'Carlos', distance: 8.5, type: 'cycling', timestamp: Date.now() - 7200000 }
    ];
  }

  shouldTriggerSocialNudge(activity) {
    // Lógica para determinar se deve disparar nudge social
    const timeSinceActivity = Date.now() - activity.timestamp;
    return timeSinceActivity < 7200000; // Menos de 2 horas
  }

  calculateOptimalTime(trigger) {
    const now = new Date();
    const currentHour = now.getHours();
    const optimalTimes = this.userBehaviorProfile.optimalTiming || {};
    
    // Se há horário ótimo conhecido, usar
    if (optimalTimes[currentHour]) {
      return Date.now() + (Math.random() * 1800000); // Próximos 30 min
    }
    
    // Caso contrário, usar heurísticas
    if (trigger.timing === 'immediate') {
      return Date.now();
    } else if (trigger.timing === 'within_hour') {
      return Date.now() + (Math.random() * 3600000);
    }
    
    return Date.now() + 1800000; // 30 minutos padrão
  }

  isTriggerStillRelevant(trigger) {
    // Verificar se o trigger ainda é relevante
    if (trigger.type === 'streak_protection') {
      const currentStreak = this.getStreakData().current;
      return currentStreak >= trigger.data.streak;
    }
    
    return true;
  }

  recordTriggerExecution(trigger) {
    const execution = {
      triggerId: trigger.id || Date.now(),
      type: trigger.type,
      timestamp: Date.now(),
      message: trigger.message,
      action: trigger.action,
      priority: trigger.priority
    };
    
    this.triggerHistory.push(execution);
    this.saveTriggerHistory();
  }

  saveTriggerHistory() {
    // Manter apenas últimos 100 registros
    if (this.triggerHistory.length > 100) {
      this.triggerHistory = this.triggerHistory.slice(-100);
    }
    
    localStorage.setItem('fusetech-trigger-history', JSON.stringify(this.triggerHistory));
  }

  loadTriggerHistory() {
    try {
      return JSON.parse(localStorage.getItem('fusetech-trigger-history')) || [];
    } catch {
      return [];
    }
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.intelligentTriggers = new IntelligentTriggersSystem();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntelligentTriggersSystem;
}
