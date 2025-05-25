/**
 * FUSEtech Simple Onboarding System
 * Versão simplificada e funcional do sistema de onboarding
 */

class SimpleOnboardingSystem {
  constructor() {
    this.currentModal = null;
    this.currentStep = 0;
    this.totalSteps = 3;
    this.userProgress = this.loadUserProgress();
    
    console.log('Simple Onboarding System initialized');
  }

  // Método principal para iniciar onboarding
  startOnboarding() {
    console.log('Starting onboarding...');
    this.showWelcomeModal();
  }

  showWelcomeModal() {
    const modalHTML = `
      <div class="onboarding-modal-overlay large show" id="welcome-modal">
        <div class="onboarding-modal-content">
          <div class="onboarding-modal-header">
            <h2>🎉 Bem-vindo ao FUSEtech!</h2>
          </div>
          <div class="onboarding-modal-body">
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
                <button class="btn btn-primary btn-lg" onclick="window.simpleOnboarding.startStep1()">
                  Começar Configuração
                </button>
                <button class="btn btn-ghost" onclick="window.simpleOnboarding.skipOnboarding()">
                  Pular por agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.currentModal = document.getElementById('welcome-modal');
  }

  startStep1() {
    this.closeCurrentModal();
    this.currentStep = 1;
    this.showStep1();
  }

  showStep1() {
    const modalHTML = `
      <div class="onboarding-modal-overlay large show" id="step1-modal">
        <div class="onboarding-modal-content">
          <div class="onboarding-modal-header">
            <h2>👤 Conte-nos sobre você</h2>
          </div>
          <div class="onboarding-modal-body">
            <div class="onboarding-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: 33%"></div>
              </div>
              <div class="progress-text">Passo 1 de 3</div>
            </div>
            
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
              
              <div class="onboarding-actions">
                <button class="btn btn-ghost" onclick="window.simpleOnboarding.showWelcomeModal()">Voltar</button>
                <button class="btn btn-primary" onclick="window.simpleOnboarding.validateStep1()">Próximo</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.currentModal = document.getElementById('step1-modal');
    this.setupGoalSelection();
  }

  validateStep1() {
    const name = document.getElementById('display-name').value;
    const goal = document.querySelector('.goal-option.selected')?.dataset.goal;
    const frequency = document.getElementById('frequency').value;

    if (!name || !goal || !frequency) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    // Salvar dados
    this.userProgress.profile = { name, goal, frequency };
    this.saveUserProgress();

    this.closeCurrentModal();
    this.currentStep = 2;
    this.showStep2();
  }

  showStep2() {
    const modalHTML = `
      <div class="onboarding-modal-overlay large show" id="step2-modal">
        <div class="onboarding-modal-content">
          <div class="onboarding-modal-header">
            <h2>🔗 Conecte suas atividades</h2>
          </div>
          <div class="onboarding-modal-body">
            <div class="onboarding-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: 66%"></div>
              </div>
              <div class="progress-text">Passo 2 de 3</div>
            </div>
            
            <div class="onboarding-step">
              <div class="step-description">
                <p>Conecte apps e dispositivos para registrar atividades automaticamente</p>
              </div>
              
              <div class="connection-options">
                <div class="connection-card" data-connection="strava">
                  <div class="connection-header">
                    <div class="connection-logo" style="background: #fc4c02; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">S</div>
                    <div class="connection-info">
                      <h4>Strava</h4>
                      <p>Sincronize corridas e ciclismo</p>
                    </div>
                  </div>
                  <button class="btn btn-outline connection-btn" onclick="window.simpleOnboarding.connectApp('strava')">
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
                  <button class="btn btn-outline connection-btn" onclick="window.simpleOnboarding.connectApp('apple-health')">
                    Conectar
                  </button>
                </div>
              </div>
              
              <div class="connection-note">
                <p><strong>💡 Dica:</strong> Você pode conectar mais apps depois nas configurações</p>
              </div>
              
              <div class="onboarding-actions">
                <button class="btn btn-ghost" onclick="window.simpleOnboarding.showStep1()">Voltar</button>
                <button class="btn btn-primary" onclick="window.simpleOnboarding.goToStep3()">Continuar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.currentModal = document.getElementById('step2-modal');
  }

  connectApp(app) {
    const card = document.querySelector(`[data-connection="${app}"]`);
    const btn = card.querySelector('.connection-btn');
    
    btn.textContent = 'Conectando...';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.textContent = '✓ Conectado';
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-success');
      card.classList.add('connected');
      
      if (window.desktopNotifications) {
        window.desktopNotifications.success('Conectado!', `${app} conectado com sucesso`);
      }
    }, 1500);
  }

  goToStep3() {
    this.closeCurrentModal();
    this.currentStep = 3;
    this.showStep3();
  }

  showStep3() {
    const modalHTML = `
      <div class="onboarding-modal-overlay large show" id="step3-modal">
        <div class="onboarding-modal-content">
          <div class="onboarding-modal-header">
            <h2>🎯 Defina sua primeira meta</h2>
          </div>
          <div class="onboarding-modal-body">
            <div class="onboarding-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: 100%"></div>
              </div>
              <div class="progress-text">Passo 3 de 3</div>
            </div>
            
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
              
              <div class="onboarding-actions">
                <button class="btn btn-ghost" onclick="window.simpleOnboarding.showStep2()">Voltar</button>
                <button class="btn btn-primary" onclick="window.simpleOnboarding.completeOnboarding()">Criar Meta</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.currentModal = document.getElementById('step3-modal');
    this.setupMetricSelector();
  }

  completeOnboarding() {
    this.userProgress.hasCompletedOnboarding = true;
    this.userProgress.completedAt = Date.now();
    this.saveUserProgress();

    this.closeCurrentModal();
    this.showSuccessModal();
  }

  showSuccessModal() {
    const name = this.userProgress.profile?.name || 'Usuário';
    const modalHTML = `
      <div class="onboarding-modal-overlay large show" id="success-modal">
        <div class="onboarding-modal-content">
          <div class="onboarding-modal-header">
            <h2>🎉 Configuração Completa!</h2>
          </div>
          <div class="onboarding-modal-body">
            <div class="onboarding-success">
              <div class="success-animation">
                <div class="success-icon">✅</div>
                <h2>Tudo pronto, ${name}!</h2>
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
                <button class="btn btn-primary btn-lg" onclick="window.simpleOnboarding.startFirstActivity()">
                  Registrar Primeira Atividade
                </button>
                <button class="btn btn-ghost" onclick="window.simpleOnboarding.goToDashboard()">
                  Ir para Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.currentModal = document.getElementById('success-modal');
  }

  skipOnboarding() {
    this.userProgress.hasSkippedOnboarding = true;
    this.saveUserProgress();
    this.closeCurrentModal();
    
    if (window.desktopNotifications) {
      window.desktopNotifications.info('Onboarding Pulado', 'Você pode configurar sua conta depois nas configurações');
    }
  }

  startFirstActivity() {
    this.closeCurrentModal();
    if (window.desktopNotifications) {
      window.desktopNotifications.success('Primeira Atividade!', 'Registre sua primeira atividade para ganhar tokens');
    }
  }

  goToDashboard() {
    this.closeCurrentModal();
    if (window.desktopNotifications) {
      window.desktopNotifications.info('Dashboard Ativo!', 'Explore todas as funcionalidades disponíveis');
    }
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
    setTimeout(() => {
      document.querySelectorAll('.goal-option').forEach(option => {
        option.addEventListener('click', () => {
          document.querySelectorAll('.goal-option').forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');
        });
      });
    }, 100);
  }

  setupMetricSelector() {
    setTimeout(() => {
      document.querySelectorAll('.metric-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.metric-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }, 100);
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
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.simpleOnboarding = new SimpleOnboardingSystem();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimpleOnboardingSystem;
}
