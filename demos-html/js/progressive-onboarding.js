/**
 * FUSEtech Progressive Onboarding System
 * Sistema de onboarding baseado em progressive disclosure e cognitive load reduction
 * Implementa guided tours, feature discovery e adaptive UI
 */

class ProgressiveOnboardingSystem {
  constructor() {
    this.userProgress = this.loadUserProgress();
    this.currentStep = 0;
    this.totalSteps = 0;
    this.isOnboarding = false;
    this.currentModal = null;

    // Inicializar managers após DOM estar pronto
    setTimeout(() => {
      this.adaptiveUI = new AdaptiveUIManager();
      this.featureDiscovery = new FeatureDiscoveryManager();
      this.init();
    }, 100);
  }

  init() {
    this.setupProgressiveDisclosure();
    this.setupAdaptiveNavigation();
    this.setupFeatureGating();
    this.setupGuidedTours();

    // Não iniciar onboarding automaticamente - apenas quando solicitado
    console.log('Progressive Onboarding System initialized');
  }

  /**
   * ONBOARDING FLOW MANAGEMENT
   */

  // Método público para iniciar onboarding manualmente
  startOnboarding() {
    this.startFirstTimeOnboarding();
  }

  startFirstTimeOnboarding() {
    this.isOnboarding = true;
    this.showWelcomeModal();
  }

  showWelcomeModal() {
    const modal = this.createModal({
      title: '🎉 Bem-vindo ao FUSEtech!',
      content: `
        <div class="onboarding-welcome">
          <div class="welcome-hero">
            <div class="welcome-icon">💪</div>
            <h2>Transforme exercícios em recompensas</h2>
            <p>Vamos configurar sua conta em 3 passos simples</p>
          </div>

          <div class="onboarding-benefits">
            <div class="benefit-item">
              <div class="benefit-icon">🏃‍♂️</div>
              <div class="benefit-text">
                <h4>Registre Atividades</h4>
                <p>Conecte apps e dispositivos</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">🪙</div>
              <div class="benefit-text">
                <h4>Ganhe Tokens</h4>
                <p>Cada exercício vira FUSE</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">🛍️</div>
              <div class="benefit-text">
                <h4>Troque Recompensas</h4>
                <p>Use tokens no marketplace</p>
              </div>
            </div>
          </div>

          <div class="onboarding-cta">
            <button class="btn btn-primary btn-lg" onclick="window.onboarding.startGuidedSetup()">
              Começar Configuração
            </button>
            <button class="btn btn-ghost" onclick="window.onboarding.skipOnboarding()">
              Pular por agora
            </button>
          </div>
        </div>
      `,
      closable: false,
      size: 'large'
    });

    this.showModal(modal);
  }

  startGuidedSetup() {
    this.closeCurrentModal();
    this.totalSteps = 3;
    this.currentStep = 1;

    // Simplificar UI para onboarding
    this.adaptiveUI.enterOnboardingMode();

    this.showStep1_Profile();
  }

  showStep1_Profile() {
    const stepModal = this.createStepModal({
      step: 1,
      title: '👤 Conte-nos sobre você',
      content: `
        <div class="onboarding-step">
          <div class="step-description">
            <p>Essas informações nos ajudam a personalizar sua experiência</p>
          </div>

          <form class="onboarding-form" id="profile-form">
            <div class="form-group">
              <label>Como prefere ser chamado?</label>
              <input type="text" id="display-name" placeholder="Seu nome" required>
            </div>

            <div class="form-group">
              <label>Qual seu principal objetivo?</label>
              <div class="goal-options">
                <div class="goal-option" data-goal="weight-loss">
                  <div class="goal-icon">⚖️</div>
                  <div class="goal-text">Perder Peso</div>
                </div>
                <div class="goal-option" data-goal="muscle-gain">
                  <div class="goal-icon">💪</div>
                  <div class="goal-text">Ganhar Músculo</div>
                </div>
                <div class="goal-option" data-goal="endurance">
                  <div class="goal-icon">🏃‍♂️</div>
                  <div class="goal-text">Resistência</div>
                </div>
                <div class="goal-option" data-goal="general">
                  <div class="goal-icon">❤️</div>
                  <div class="goal-text">Saúde Geral</div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Quantas vezes treina por semana?</label>
              <select id="frequency">
                <option value="">Selecione...</option>
                <option value="1-2">1-2 vezes</option>
                <option value="3-4">3-4 vezes</option>
                <option value="5-6">5-6 vezes</option>
                <option value="daily">Todos os dias</option>
              </select>
            </div>
          </form>
        </div>
      `,
      onNext: () => this.validateAndProceedToStep2(),
      onBack: () => this.showWelcomeModal()
    });

    this.showModal(stepModal);
    this.setupGoalSelection();
  }

  validateAndProceedToStep2() {
    const form = document.getElementById('profile-form');
    const name = document.getElementById('display-name').value;
    const goal = document.querySelector('.goal-option.selected')?.dataset.goal;
    const frequency = document.getElementById('frequency').value;

    if (!name || !goal || !frequency) {
      this.showValidationError('Por favor, preencha todos os campos');
      return;
    }

    // Salvar dados do perfil
    this.userProgress.profile = { name, goal, frequency };
    this.saveUserProgress();

    this.currentStep = 2;
    this.showStep2_Connections();
  }

  showStep2_Connections() {
    const stepModal = this.createStepModal({
      step: 2,
      title: '🔗 Conecte suas atividades',
      content: `
        <div class="onboarding-step">
          <div class="step-description">
            <p>Conecte apps e dispositivos para registrar atividades automaticamente</p>
          </div>

          <div class="connection-options">
            <div class="connection-card" data-connection="strava">
              <div class="connection-header">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.svg" alt="Strava" class="connection-logo">
                <div class="connection-info">
                  <h4>Strava</h4>
                  <p>Sincronize corridas e ciclismo</p>
                </div>
              </div>
              <button class="btn btn-outline connection-btn" onclick="window.onboarding.connectStrava()">
                Conectar
              </button>
            </div>

            <div class="connection-card" data-connection="apple-health">
              <div class="connection-header">
                <div class="connection-logo apple-health">❤️</div>
                <div class="connection-info">
                  <h4>Apple Health</h4>
                  <p>Dados de saúde e atividade</p>
                </div>
              </div>
              <button class="btn btn-outline connection-btn" onclick="window.onboarding.connectAppleHealth()">
                Conectar
              </button>
            </div>

            <div class="connection-card" data-connection="google-fit">
              <div class="connection-header">
                <div class="connection-logo google-fit">🏃‍♂️</div>
                <div class="connection-info">
                  <h4>Google Fit</h4>
                  <p>Atividades e passos</p>
                </div>
              </div>
              <button class="btn btn-outline connection-btn" onclick="window.onboarding.connectGoogleFit()">
                Conectar
              </button>
            </div>
          </div>

          <div class="connection-note">
            <p><strong>💡 Dica:</strong> Você pode conectar mais apps depois nas configurações</p>
          </div>
        </div>
      `,
      onNext: () => this.proceedToStep3(),
      onBack: () => this.showStep1_Profile(),
      nextText: 'Continuar'
    });

    this.showModal(stepModal);
  }

  proceedToStep3() {
    this.currentStep = 3;
    this.showStep3_FirstGoal();
  }

  showStep3_FirstGoal() {
    const stepModal = this.createStepModal({
      step: 3,
      title: '🎯 Defina sua primeira meta',
      content: `
        <div class="onboarding-step">
          <div class="step-description">
            <p>Vamos criar uma meta simples para você começar a ganhar tokens</p>
          </div>

          <div class="goal-setup">
            <div class="goal-preview">
              <div class="goal-icon-large">🏃‍♂️</div>
              <h3>Meta Semanal de Corrida</h3>
              <p>Baseada no seu perfil, sugerimos:</p>
            </div>

            <div class="goal-config">
              <div class="goal-metric">
                <label>Distância por semana</label>
                <div class="metric-selector">
                  <button class="metric-btn" data-value="5">5 km</button>
                  <button class="metric-btn active" data-value="10">10 km</button>
                  <button class="metric-btn" data-value="15">15 km</button>
                  <button class="metric-btn" data-value="20">20 km</button>
                </div>
              </div>

              <div class="goal-reward">
                <div class="reward-preview">
                  <div class="reward-icon">🪙</div>
                  <div class="reward-text">
                    <h4>Recompensa: 50 FUSE</h4>
                    <p>Por completar a meta semanal</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="goal-motivation">
              <h4>🔥 Bônus de Sequência</h4>
              <p>Complete 3 semanas seguidas e ganhe +25 FUSE extra!</p>
            </div>
          </div>
        </div>
      `,
      onNext: () => this.completeOnboarding(),
      onBack: () => this.showStep2_Connections(),
      nextText: 'Criar Meta'
    });

    this.showModal(stepModal);
    this.setupMetricSelector();
  }

  completeOnboarding() {
    // Salvar progresso
    this.userProgress.hasCompletedOnboarding = true;
    this.userProgress.completedAt = Date.now();
    this.saveUserProgress();

    // Sair do modo onboarding
    this.adaptiveUI.exitOnboardingMode();
    this.isOnboarding = false;

    // Mostrar sucesso
    this.showCompletionModal();
  }

  showCompletionModal() {
    const modal = this.createModal({
      title: '🎉 Configuração Completa!',
      content: `
        <div class="onboarding-success">
          <div class="success-animation">
            <div class="success-icon">✅</div>
            <h2>Tudo pronto, ${this.userProgress.profile.name}!</h2>
            <p>Sua conta está configurada e você já pode começar a ganhar tokens</p>
          </div>

          <div class="next-steps">
            <h3>Próximos passos:</h3>
            <div class="step-list">
              <div class="next-step">
                <div class="step-number">1</div>
                <div class="step-text">Registre sua primeira atividade</div>
              </div>
              <div class="next-step">
                <div class="step-number">2</div>
                <div class="step-text">Explore o marketplace</div>
              </div>
              <div class="next-step">
                <div class="step-number">3</div>
                <div class="step-text">Conecte-se com amigos</div>
              </div>
            </div>
          </div>

          <div class="completion-cta">
            <button class="btn btn-primary btn-lg" onclick="window.onboarding.startFirstActivity()">
              Registrar Primeira Atividade
            </button>
            <button class="btn btn-ghost" onclick="window.onboarding.goToDashboard()">
              Ir para Dashboard
            </button>
          </div>
        </div>
      `,
      closable: false,
      size: 'large'
    });

    this.showModal(modal);
  }

  /**
   * ADAPTIVE UI MANAGEMENT
   */
  setupProgressiveDisclosure() {
    // Mostrar apenas funcionalidades essenciais inicialmente
    this.adaptiveUI.hideAdvancedFeatures();
    this.adaptiveUI.showEssentialFeatures();
  }

  setupAdaptiveNavigation() {
    // Simplificar navegação baseada no progresso do usuário
    const userLevel = this.calculateUserLevel();
    this.adaptiveUI.adaptNavigationToLevel(userLevel);
  }

  setupFeatureGating() {
    // Desbloquear funcionalidades progressivamente
    if (this.featureDiscovery) {
      this.featureDiscovery.setupGatedFeatures();
    }
  }

  setupGuidedTours() {
    // Setup para tours guiados
    console.log('Guided tours setup completed');
  }

  showValidationError(message) {
    // Mostrar erro de validação
    const existingError = document.querySelector('.validation-error');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.textContent = message;

    const form = document.querySelector('.onboarding-form');
    if (form) {
      form.insertBefore(errorDiv, form.firstChild);
    }
  }

  startFirstActivity() {
    this.closeCurrentModal();
    if (window.desktopNotifications) {
      window.desktopNotifications.success(
        'Primeira Atividade!',
        'Registre sua primeira atividade para ganhar tokens'
      );
    }
  }

  goToDashboard() {
    this.closeCurrentModal();
    if (window.desktopNotifications) {
      window.desktopNotifications.info(
        'Dashboard Ativo!',
        'Explore todas as funcionalidades disponíveis'
      );
    }
  }

  /**
   * UTILITY METHODS
   */

  createStepModal({ step, title, content, onNext, onBack, nextText = 'Próximo' }) {
    return {
      title,
      content: `
        <div class="onboarding-modal">
          <div class="onboarding-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(step / this.totalSteps) * 100}%"></div>
            </div>
            <div class="progress-text">Passo ${step} de ${this.totalSteps}</div>
          </div>

          ${content}

          <div class="onboarding-actions">
            ${onBack ? `<button class="btn btn-ghost" onclick="window.onboarding.handleBack()">Voltar</button>` : ''}
            <button class="btn btn-primary" onclick="window.onboarding.handleNext()">${nextText}</button>
          </div>
        </div>
      `,
      onNext,
      onBack,
      closable: false,
      size: 'large'
    };
  }

  createModal({ title, content, closable = true, size = 'medium' }) {
    const modal = document.createElement('div');
    modal.className = `onboarding-modal-overlay ${size}`;
    modal.innerHTML = `
      <div class="onboarding-modal-content">
        <div class="onboarding-modal-header">
          <h2>${title}</h2>
          ${closable ? '<button class="modal-close" onclick="window.onboarding.closeCurrentModal()">×</button>' : ''}
        </div>
        <div class="onboarding-modal-body">
          ${content}
        </div>
      </div>
    `;

    return modal;
  }

  showModal(modal) {
    this.closeCurrentModal();
    this.currentModal = modal;
    document.body.appendChild(modal);

    // Animar entrada
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  closeCurrentModal() {
    if (this.currentModal) {
      this.currentModal.classList.remove('show');
      setTimeout(() => {
        if (this.currentModal && this.currentModal.parentNode) {
          this.currentModal.parentNode.removeChild(this.currentModal);
        }
        this.currentModal = null;
      }, 300);
    }
  }

  setupGoalSelection() {
    document.querySelectorAll('.goal-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.goal-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
  }

  setupMetricSelector() {
    document.querySelectorAll('.metric-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.metric-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // Connection methods (simuladas)
  connectStrava() {
    this.simulateConnection('strava', 'Strava conectado com sucesso!');
  }

  connectAppleHealth() {
    this.simulateConnection('apple-health', 'Apple Health conectado!');
  }

  connectGoogleFit() {
    this.simulateConnection('google-fit', 'Google Fit conectado!');
  }

  simulateConnection(service, message) {
    const card = document.querySelector(`[data-connection="${service}"]`);
    const btn = card.querySelector('.connection-btn');

    btn.textContent = 'Conectando...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Conectado';
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-success');
      card.classList.add('connected');

      if (window.desktopNotifications) {
        window.desktopNotifications.success('Conexão Realizada!', message);
      }
    }, 2000);
  }

  startFirstActivity() {
    this.closeCurrentModal();
    // Abrir modal de primeira atividade
    this.showFirstActivityModal();
  }

  goToDashboard() {
    this.closeCurrentModal();
    // Ir para dashboard com tour guiado
    this.startDashboardTour();
  }

  skipOnboarding() {
    this.userProgress.hasSkippedOnboarding = true;
    this.saveUserProgress();
    this.closeCurrentModal();
    this.adaptiveUI.exitOnboardingMode();
  }

  // Handlers para botões do modal
  handleNext() {
    if (this.currentModal && this.currentModal.onNext) {
      this.currentModal.onNext();
    }
  }

  handleBack() {
    if (this.currentModal && this.currentModal.onBack) {
      this.currentModal.onBack();
    }
  }

  loadUserProgress() {
    try {
      return JSON.parse(localStorage.getItem('fusetech-onboarding-progress')) || {};
    } catch {
      return {};
    }
  }

  saveUserProgress() {
    localStorage.setItem('fusetech-onboarding-progress', JSON.stringify(this.userProgress));
  }

  calculateUserLevel() {
    // Calcular nível baseado em atividades, tempo de uso, etc.
    return this.userProgress.level || 'beginner';
  }
}

/**
 * Adaptive UI Manager - Gerencia UI baseada no progresso do usuário
 */
class AdaptiveUIManager {
  constructor() {
    this.originalNavigation = null;
    this.isOnboardingMode = false;
  }

  enterOnboardingMode() {
    this.isOnboardingMode = true;
    const nav = document.querySelector('nav');
    if (nav) {
      this.originalNavigation = nav.innerHTML;
      this.simplifyNavigation();
    }
    this.hideComplexElements();
  }

  exitOnboardingMode() {
    this.isOnboardingMode = false;
    this.restoreNavigation();
    this.showAllElements();
  }

  simplifyNavigation() {
    const navLinks = document.querySelector('nav .nav-links');
    if (navLinks) {
      navLinks.innerHTML = `
        <a href="index.html" class="nav-link active">
          <i class="fas fa-home mr-2"></i>
          Dashboard
        </a>
      `;
    }
  }

  restoreNavigation() {
    if (this.originalNavigation) {
      const nav = document.querySelector('nav');
      if (nav) {
        nav.innerHTML = this.originalNavigation;
      }
    }
  }

  hideComplexElements() {
    // Esconder elementos complexos durante onboarding
    const elementsToHide = [
      '.quick-actions-bar',
      '.ai-insights',
      '.social-feed'
    ];

    elementsToHide.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.display = 'none';
      }
    });
  }

  showAllElements() {
    // Mostrar todos os elementos após onboarding
    const elementsToShow = [
      '.quick-actions-bar',
      '.ai-insights',
      '.social-feed'
    ];

    elementsToShow.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.display = '';
      }
    });
  }

  hideAdvancedFeatures() {
    // Esconder funcionalidades avançadas para novos usuários
    console.log('Advanced features hidden');
  }

  showEssentialFeatures() {
    // Mostrar apenas funcionalidades essenciais
    console.log('Essential features shown');
  }

  adaptNavigationToLevel(level) {
    // Adaptar navegação baseada no nível do usuário
    console.log('Navigation adapted to level:', level);
  }
}

/**
 * Feature Discovery Manager - Gerencia descoberta progressiva de funcionalidades
 */
class FeatureDiscoveryManager {
  constructor() {
    this.gatedFeatures = new Map();
  }

  setupGatedFeatures() {
    // Configurar funcionalidades que são desbloqueadas progressivamente
    console.log('Gated features setup completed');
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.onboarding = new ProgressiveOnboardingSystem();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressiveOnboardingSystem;
}
