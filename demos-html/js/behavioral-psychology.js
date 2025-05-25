/**
 * FUSEtech Behavioral Psychology Engine
 * Sistema avançado baseado em economia comportamental e neurociência
 * Implementa técnicas de habit formation, loss aversion, e psychological ownership
 */

class BehavioralPsychologyEngine {
  constructor() {
    this.userProfile = this.loadUserProfile();
    this.behaviorData = this.loadBehaviorData();
    this.streakData = this.loadStreakData();
    this.personalizedTriggers = new Map();
    this.lossAversionElements = new Map();
    this.ownershipElements = new Map();
    
    this.init();
  }

  init() {
    this.setupPsychologicalOwnership();
    this.implementLossAversion();
    this.createHabitFormationLoops();
    this.setupPersonalizedTriggers();
    this.implementVariableRewards();
    this.createSocialProofMechanisms();
    this.setupProgressOwnership();
    this.implementCommitmentDevices();
  }

  /**
   * PSYCHOLOGICAL OWNERSHIP - Fazer usuário sentir "dono" do progresso
   */
  setupPsychologicalOwnership() {
    // 1. Personalização Profunda do Avatar
    this.createPersonalizedAvatar();
    
    // 2. "Meu Universo FUSEtech" - Espaço Pessoal
    this.createPersonalUniverse();
    
    // 3. Histórico Emocional - "Sua Jornada"
    this.createEmotionalJourney();
    
    // 4. Tokens como "Patrimônio Pessoal"
    this.enhanceTokenOwnership();
  }

  createPersonalizedAvatar() {
    const avatarContainer = document.querySelector('.avatar');
    if (!avatarContainer) return;

    // Criar sistema de avatar evolutivo
    const avatarSystem = document.createElement('div');
    avatarSystem.className = 'personalized-avatar-system';
    avatarSystem.innerHTML = `
      <div class="avatar-evolution">
        <div class="avatar-level">Nível ${this.userProfile.level || 1}</div>
        <div class="avatar-progress">
          <div class="progress-bar" style="width: ${this.userProfile.levelProgress || 0}%"></div>
        </div>
      </div>
      <div class="avatar-achievements">
        ${this.renderAvatarBadges()}
      </div>
      <div class="avatar-customization">
        <button class="btn-customize-avatar">
          <i class="fas fa-palette"></i>
          Personalizar
        </button>
      </div>
    `;
    
    avatarContainer.appendChild(avatarSystem);
  }

  createPersonalUniverse() {
    // Criar seção "Meu FUSEtech" no dashboard
    const dashboard = document.querySelector('main');
    if (!dashboard) return;

    const personalUniverse = document.createElement('section');
    personalUniverse.className = 'personal-universe';
    personalUniverse.innerHTML = `
      <div class="universe-header">
        <h2>Seu Universo FUSEtech</h2>
        <p>Este é o seu espaço pessoal de conquistas e crescimento</p>
      </div>
      
      <div class="universe-stats">
        <div class="stat-personal">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-value">${this.userProfile.totalDays || 0}</div>
            <div class="stat-label">Dias na jornada</div>
          </div>
        </div>
        
        <div class="stat-personal">
          <div class="stat-icon">💪</div>
          <div class="stat-content">
            <div class="stat-value">${this.userProfile.totalActivities || 0}</div>
            <div class="stat-label">Atividades completadas</div>
          </div>
        </div>
        
        <div class="stat-personal">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">${this.streakData.current || 0}</div>
            <div class="stat-label">Sequência atual</div>
          </div>
        </div>
      </div>
      
      <div class="universe-timeline">
        <h3>Sua Linha do Tempo</h3>
        <div class="timeline-container">
          ${this.renderPersonalTimeline()}
        </div>
      </div>
    `;
    
    // Inserir após o welcome section
    const welcomeSection = dashboard.querySelector('.mb-8');
    if (welcomeSection) {
      welcomeSection.insertAdjacentElement('afterend', personalUniverse);
    }
  }

  /**
   * LOSS AVERSION - Explorar medo de perder progresso
   */
  implementLossAversion() {
    // 1. Streak Visualization com "Risco de Perda"
    this.createStreakRiskVisualization();
    
    // 2. "Tokens em Risco" - Mostrar o que pode ser perdido
    this.createTokenRiskIndicator();
    
    // 3. "Momentum Perdido" - Visualizar oportunidades perdidas
    this.createMomentumLossIndicator();
    
    // 4. "Posição no Ranking em Risco"
    this.createRankingRiskAlert();
  }

  createStreakRiskVisualization() {
    const streakContainer = document.createElement('div');
    streakContainer.className = 'streak-risk-container';
    
    const hoursUntilRisk = this.calculateHoursUntilStreakLoss();
    const riskLevel = this.calculateStreakRiskLevel(hoursUntilRisk);
    
    streakContainer.innerHTML = `
      <div class="streak-risk-alert ${riskLevel}">
        <div class="risk-icon">
          ${riskLevel === 'high' ? '🚨' : riskLevel === 'medium' ? '⚠️' : '✅'}
        </div>
        <div class="risk-content">
          <div class="risk-title">
            ${this.getStreakRiskMessage(riskLevel, hoursUntilRisk)}
          </div>
          <div class="risk-action">
            ${riskLevel !== 'low' ? `
              <button class="btn btn-primary btn-sm save-streak-btn">
                <i class="fas fa-shield-alt"></i>
                Salvar Sequência
              </button>
            ` : ''}
          </div>
        </div>
      </div>
      
      <div class="streak-visualization">
        <div class="streak-calendar">
          ${this.renderStreakCalendar()}
        </div>
      </div>
    `;
    
    // Adicionar ao dashboard
    this.addToQuickStats(streakContainer);
  }

  createTokenRiskIndicator() {
    const tokenBalance = document.querySelector('.bg-gradient-primary');
    if (!tokenBalance) return;

    const riskIndicator = document.createElement('div');
    riskIndicator.className = 'token-risk-indicator';
    
    const potentialLoss = this.calculatePotentialTokenLoss();
    
    riskIndicator.innerHTML = `
      <div class="risk-tooltip">
        <i class="fas fa-exclamation-triangle text-warning"></i>
        <div class="tooltip-content">
          <div class="tooltip-title">Tokens em Risco</div>
          <div class="tooltip-text">
            Você pode perder até ${potentialLoss} FUSE se não mantiver sua atividade
          </div>
        </div>
      </div>
    `;
    
    tokenBalance.appendChild(riskIndicator);
  }

  /**
   * HABIT FORMATION LOOPS - Criar loops viciantes
   */
  createHabitFormationLoops() {
    // 1. Contextual Triggers - Baseado em comportamento
    this.setupContextualTriggers();
    
    // 2. Variable Ratio Rewards - Recompensas imprevisíveis
    this.implementVariableRewards();
    
    // 3. Micro-commitments - Pequenos compromissos
    this.createMicroCommitments();
    
    // 4. Implementation Intentions - "Se X então Y"
    this.setupImplementationIntentions();
  }

  setupContextualTriggers() {
    // Analisar padrões de comportamento do usuário
    const userPatterns = this.analyzeBehaviorPatterns();
    
    // Criar triggers personalizados
    userPatterns.forEach(pattern => {
      this.createPersonalizedTrigger(pattern);
    });
    
    // Triggers baseados em contexto
    this.setupLocationBasedTriggers();
    this.setupTimeBasedTriggers();
    this.setupWeatherBasedTriggers();
    this.setupSocialBasedTriggers();
  }

  implementVariableRewards() {
    // Sistema de recompensas imprevisíveis
    const rewardSystem = {
      // Recompensas pequenas frequentes
      micro: {
        probability: 0.3,
        rewards: ['5 FUSE', 'Badge especial', 'Mensagem motivacional']
      },
      
      // Recompensas médias ocasionais
      medium: {
        probability: 0.1,
        rewards: ['25 FUSE', 'Desconto marketplace', 'Acesso premium']
      },
      
      // Recompensas grandes raras
      large: {
        probability: 0.02,
        rewards: ['100 FUSE', 'Produto grátis', 'Experiência exclusiva']
      }
    };
    
    this.scheduleVariableRewards(rewardSystem);
  }

  /**
   * SOCIAL PROOF MECHANISMS - Influência social
   */
  createSocialProofMechanisms() {
    // 1. "Pessoas como você" - Segmentação comportamental
    this.createBehavioralSegmentation();
    
    // 2. Real-time activity feed
    this.createRealTimeActivityFeed();
    
    // 3. Social comparison com peers
    this.createPeerComparison();
    
    // 4. Community challenges
    this.createCommunityPressure();
  }

  createBehavioralSegmentation() {
    const segment = this.identifyUserSegment();
    
    const segmentInfo = document.createElement('div');
    segmentInfo.className = 'behavioral-segment-info';
    segmentInfo.innerHTML = `
      <div class="segment-card">
        <div class="segment-header">
          <div class="segment-icon">${segment.icon}</div>
          <div class="segment-title">Você é um ${segment.name}</div>
        </div>
        <div class="segment-stats">
          <div class="segment-stat">
            <span class="stat-value">${segment.avgActivities}</span>
            <span class="stat-label">atividades/semana em média</span>
          </div>
          <div class="segment-comparison">
            Você está ${segment.performance > 0 ? 'acima' : 'abaixo'} da média do seu grupo
          </div>
        </div>
        <div class="segment-peers">
          <div class="peers-title">Outros ${segment.name}s estão fazendo:</div>
          <div class="peers-activities">
            ${this.renderPeerActivities(segment)}
          </div>
        </div>
      </div>
    `;
    
    return segmentInfo;
  }

  /**
   * COMMITMENT DEVICES - Dispositivos de compromisso
   */
  implementCommitmentDevices() {
    // 1. Public commitments
    this.createPublicCommitments();
    
    // 2. Stake tokens - "Apostar" tokens em metas
    this.createTokenStaking();
    
    // 3. Social accountability
    this.createSocialAccountability();
    
    // 4. Progressive commitment
    this.createProgressiveCommitment();
  }

  createTokenStaking() {
    const stakingSystem = document.createElement('div');
    stakingSystem.className = 'token-staking-system';
    stakingSystem.innerHTML = `
      <div class="staking-card">
        <div class="staking-header">
          <h3>Aposte em Você Mesmo</h3>
          <p>Coloque tokens em risco para aumentar sua motivação</p>
        </div>
        
        <div class="staking-options">
          <div class="stake-option" data-stake="50">
            <div class="stake-amount">50 FUSE</div>
            <div class="stake-goal">Meta semanal</div>
            <div class="stake-reward">+25 FUSE se conseguir</div>
          </div>
          
          <div class="stake-option" data-stake="100">
            <div class="stake-amount">100 FUSE</div>
            <div class="stake-goal">Sequência de 7 dias</div>
            <div class="stake-reward">+50 FUSE se conseguir</div>
          </div>
          
          <div class="stake-option" data-stake="200">
            <div class="stake-amount">200 FUSE</div>
            <div class="stake-goal">Desafio mensal</div>
            <div class="stake-reward">+100 FUSE se conseguir</div>
          </div>
        </div>
        
        <div class="current-stakes">
          <h4>Suas Apostas Ativas</h4>
          <div class="stakes-list">
            ${this.renderCurrentStakes()}
          </div>
        </div>
      </div>
    `;
    
    return stakingSystem;
  }

  /**
   * UTILITY METHODS
   */
  
  loadUserProfile() {
    try {
      return JSON.parse(localStorage.getItem('fusetech-user-profile')) || {};
    } catch {
      return {};
    }
  }

  loadBehaviorData() {
    try {
      return JSON.parse(localStorage.getItem('fusetech-behavior-data')) || {};
    } catch {
      return {};
    }
  }

  loadStreakData() {
    try {
      return JSON.parse(localStorage.getItem('fusetech-streak-data')) || { current: 0, longest: 0 };
    } catch {
      return { current: 0, longest: 0 };
    }
  }

  calculateHoursUntilStreakLoss() {
    const lastActivity = new Date(this.behaviorData.lastActivity || Date.now());
    const now = new Date();
    const hoursSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60);
    return Math.max(0, 24 - hoursSinceLastActivity);
  }

  calculateStreakRiskLevel(hoursUntil) {
    if (hoursUntil <= 4) return 'high';
    if (hoursUntil <= 8) return 'medium';
    return 'low';
  }

  getStreakRiskMessage(riskLevel, hoursUntil) {
    switch (riskLevel) {
      case 'high':
        return `🚨 Sequência em risco! ${Math.floor(hoursUntil)}h restantes`;
      case 'medium':
        return `⚠️ Atenção! ${Math.floor(hoursUntil)}h para manter sequência`;
      default:
        return `✅ Sequência segura por ${Math.floor(hoursUntil)}h`;
    }
  }

  renderStreakCalendar() {
    const days = 14; // Últimos 14 dias
    let calendar = '';
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const hasActivity = this.hasActivityOnDate(date);
      
      calendar += `
        <div class="streak-day ${hasActivity ? 'active' : 'inactive'}">
          <div class="day-number">${date.getDate()}</div>
          <div class="day-indicator">${hasActivity ? '🔥' : '⭕'}</div>
        </div>
      `;
    }
    
    return calendar;
  }

  hasActivityOnDate(date) {
    // Simular dados de atividade
    return Math.random() > 0.3;
  }

  identifyUserSegment() {
    // Análise comportamental para identificar segmento
    const segments = [
      { name: 'Guerreiro Matinal', icon: '🌅', avgActivities: 5, performance: 15 },
      { name: 'Atleta Noturno', icon: '🌙', avgActivities: 4, performance: -5 },
      { name: 'Corredor de Fim de Semana', icon: '🏃‍♂️', avgActivities: 2, performance: 10 },
      { name: 'Viciado em Academia', icon: '💪', avgActivities: 6, performance: 25 }
    ];
    
    return segments[Math.floor(Math.random() * segments.length)];
  }

  renderCurrentStakes() {
    const stakes = this.loadCurrentStakes();
    if (stakes.length === 0) {
      return '<div class="no-stakes">Nenhuma aposta ativa</div>';
    }
    
    return stakes.map(stake => `
      <div class="stake-item">
        <div class="stake-info">
          <div class="stake-amount">${stake.amount} FUSE</div>
          <div class="stake-goal">${stake.goal}</div>
        </div>
        <div class="stake-progress">
          <div class="progress-bar" style="width: ${stake.progress}%"></div>
        </div>
        <div class="stake-status ${stake.status}">
          ${stake.status === 'at-risk' ? '⚠️ Em risco' : '✅ No caminho certo'}
        </div>
      </div>
    `).join('');
  }

  loadCurrentStakes() {
    try {
      return JSON.parse(localStorage.getItem('fusetech-stakes')) || [];
    } catch {
      return [];
    }
  }

  addToQuickStats(element) {
    const quickStats = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-4');
    if (quickStats) {
      quickStats.appendChild(element);
    }
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.behavioralPsychology = new BehavioralPsychologyEngine();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BehavioralPsychologyEngine;
}
