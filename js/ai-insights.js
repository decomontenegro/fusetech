/**
 * FUSEtech AI Insights Controller
 * Gerencia sistema de IA, metas inteligentes e análise preditiva
 */

class AIInsightsController {
  constructor() {
    this.goals = [];
    this.recommendations = [];
    this.insights = [];
    this.performanceChart = null;
    this.probabilityChart = null;
    
    this.init();
  }

  init() {
    this.loadGoals();
    this.loadRecommendations();
    this.loadInsights();
    this.setupEventListeners();
    this.initializeCharts();
    this.startAISimulation();
  }

  /**
   * Carrega metas do usuário
   */
  loadGoals() {
    this.goals = [
      {
        id: 1,
        title: 'Correr 50km este mês',
        description: 'Meta mensal de distância para melhorar resistência',
        type: 'distance',
        target: 50,
        current: 32.5,
        unit: 'km',
        deadline: '2024-01-31',
        probability: 'high',
        aiSuggested: false,
        createdBy: 'user'
      },
      {
        id: 2,
        title: 'Treinar 4x por semana',
        description: 'Manter consistência nos treinos semanais',
        type: 'frequency',
        target: 4,
        current: 3,
        unit: 'treinos/semana',
        deadline: '2024-02-29',
        probability: 'medium',
        aiSuggested: true,
        createdBy: 'ai'
      },
      {
        id: 3,
        title: 'Melhorar tempo de 5km',
        description: 'Reduzir tempo de corrida de 5km para menos de 25 minutos',
        type: 'time',
        target: 25,
        current: 27.5,
        unit: 'minutos',
        deadline: '2024-03-15',
        probability: 'medium',
        aiSuggested: true,
        createdBy: 'ai'
      }
    ];

    this.renderGoals();
  }

  /**
   * Carrega recomendações da IA
   */
  loadRecommendations() {
    this.recommendations = [
      {
        id: 1,
        title: 'Meta de Hidratação',
        description: 'Baseado nos seus treinos, recomendamos 3L de água por dia',
        icon: 'fas fa-tint',
        confidence: 92,
        action: 'Criar Meta'
      },
      {
        id: 2,
        title: 'Treino de Força',
        description: 'Adicione 2 sessões de musculação para melhorar performance',
        icon: 'fas fa-dumbbell',
        confidence: 88,
        action: 'Ver Plano'
      },
      {
        id: 3,
        title: 'Descanso Ativo',
        description: 'Inclua 1 dia de yoga ou alongamento por semana',
        icon: 'fas fa-leaf',
        confidence: 85,
        action: 'Agendar'
      }
    ];

    this.renderRecommendations();
  }

  /**
   * Carrega insights de performance
   */
  loadInsights() {
    this.insights = [
      {
        id: 1,
        title: 'Pico de Performance',
        description: 'Seus melhores treinos acontecem às terças e quintas',
        icon: 'fas fa-chart-line',
        value: '+15%',
        type: 'positive'
      },
      {
        id: 2,
        title: 'Padrão de Recuperação',
        description: 'Você precisa de 48h entre treinos intensos',
        icon: 'fas fa-heart',
        value: '48h',
        type: 'info'
      },
      {
        id: 3,
        title: 'Zona de Conforto',
        description: 'Varie a intensidade para quebrar platôs',
        icon: 'fas fa-exclamation-triangle',
        value: '70%',
        type: 'warning'
      },
      {
        id: 4,
        title: 'Progressão Ideal',
        description: 'Aumente 10% da distância a cada semana',
        icon: 'fas fa-arrow-up',
        value: '+10%',
        type: 'positive'
      }
    ];

    this.renderInsights();
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Botão de criar nova meta
    document.getElementById('create-goal-btn')?.addEventListener('click', () => {
      this.showCreateGoalModal();
    });

    // Botão do assistente IA
    document.getElementById('ai-assistant-btn')?.addEventListener('click', () => {
      this.toggleAIAssistant();
    });

    // Botão de conversar com IA
    document.getElementById('ask-ai-btn')?.addEventListener('click', () => {
      this.showAIChat();
    });

    // Período de previsão
    document.getElementById('prediction-period')?.addEventListener('change', (e) => {
      this.updatePredictionChart(e.target.value);
    });
  }

  /**
   * Renderiza metas
   */
  renderGoals() {
    const container = document.getElementById('current-goals');
    if (!container) return;

    container.innerHTML = this.goals.map(goal => this.createGoalCard(goal)).join('');
    
    // Anima entrada dos cards
    setTimeout(() => {
      container.querySelectorAll('.goal-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 150);
      });
    }, 100);
  }

  /**
   * Cria card de meta
   */
  createGoalCard(goal) {
    const progress = (goal.current / goal.target) * 100;
    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
      <div class="goal-card ${goal.aiSuggested ? 'ai-suggested' : ''}" data-goal-id="${goal.id}">
        <div class="goal-header">
          <div class="goal-icon ${goal.type}">
            <i class="fas fa-${this.getGoalIcon(goal.type)}"></i>
          </div>
          <div class="goal-info">
            <h3 class="goal-title">${goal.title}</h3>
            <p class="goal-description">${goal.description}</p>
          </div>
        </div>
        
        <div class="goal-progress">
          <div class="goal-progress-bar">
            <div class="goal-progress-fill ${goal.type}" style="width: ${Math.min(progress, 100)}%"></div>
          </div>
          <div class="goal-progress-text">
            <span>${goal.current} / ${goal.target} ${goal.unit}</span>
            <span>${Math.round(progress)}%</span>
          </div>
        </div>
        
        <div class="goal-deadline">
          <i class="fas fa-calendar"></i>
          <span>${daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido'}</span>
        </div>
        
        <div class="goal-actions">
          <div class="goal-probability ${goal.probability}">
            <i class="fas fa-${goal.probability === 'high' ? 'check' : goal.probability === 'medium' ? 'clock' : 'exclamation'}"></i>
            ${goal.probability === 'high' ? 'Alta chance' : goal.probability === 'medium' ? 'Moderada' : 'Baixa chance'}
          </div>
          <button class="btn btn-sm btn-outline" onclick="window.aiInsightsController.editGoal(${goal.id})">
            Editar
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Retorna ícone baseado no tipo de meta
   */
  getGoalIcon(type) {
    const icons = {
      distance: 'route',
      time: 'stopwatch',
      frequency: 'calendar-check',
      weight: 'weight'
    };
    return icons[type] || 'bullseye';
  }

  /**
   * Renderiza recomendações da IA
   */
  renderRecommendations() {
    const container = document.getElementById('recommended-goals');
    if (!container) return;

    container.innerHTML = this.recommendations.map(rec => `
      <div class="ai-recommendation">
        <div class="ai-recommendation-icon">
          <i class="${rec.icon}"></i>
        </div>
        <div class="ai-recommendation-content">
          <div class="ai-recommendation-title">${rec.title}</div>
          <div class="ai-recommendation-description">${rec.description}</div>
        </div>
        <button class="ai-recommendation-action" onclick="window.aiInsightsController.acceptRecommendation(${rec.id})">
          ${rec.action}
        </button>
      </div>
    `).join('');
  }

  /**
   * Renderiza insights de performance
   */
  renderInsights() {
    const container = document.getElementById('performance-insights');
    if (!container) return;

    container.innerHTML = this.insights.map(insight => `
      <div class="insight-item">
        <div class="insight-icon">
          <i class="${insight.icon}"></i>
        </div>
        <div class="insight-content">
          <div class="insight-title">${insight.title}</div>
          <div class="insight-description">${insight.description}</div>
        </div>
        <div class="insight-value">${insight.value}</div>
      </div>
    `).join('');
  }

  /**
   * Inicializa gráficos
   */
  initializeCharts() {
    this.initPerformanceChart();
    this.initProbabilityChart();
  }

  /**
   * Inicializa gráfico de performance
   */
  initPerformanceChart() {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;

    const data = {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
      datasets: [
        {
          label: 'Performance Atual',
          data: [65, 72, 68, 75, 78, 82],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Previsão IA',
          data: [null, null, null, null, 82, 85, 88, 91],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderDash: [5, 5],
          tension: 0.4,
          fill: false
        }
      ]
    };

    this.performanceChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Inicializa gráfico de probabilidade
   */
  initProbabilityChart() {
    const ctx = document.getElementById('probability-chart');
    if (!ctx) return;

    const data = {
      labels: this.goals.map(goal => goal.title),
      datasets: [{
        data: [85, 72, 68],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#f59e0b'
        ],
        borderWidth: 0
      }]
    };

    this.probabilityChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          }
        }
      }
    });
  }

  /**
   * Inicia simulação de IA
   */
  startAISimulation() {
    this.loadAICoachMessages();
    
    // Simula atualizações da IA a cada 30 segundos
    setInterval(() => {
      this.simulateAIUpdate();
    }, 30000);
  }

  /**
   * Carrega mensagens do coach IA
   */
  loadAICoachMessages() {
    const container = document.getElementById('ai-coach-messages');
    if (!container) return;

    const messages = [
      {
        title: 'Análise Semanal Completa',
        text: 'Baseado nos seus dados, identifiquei que você tem 23% mais energia nas manhãs de terça-feira. Que tal agendar seus treinos mais intensos neste horário?',
        actions: ['Agendar Treino', 'Ver Detalhes']
      },
      {
        title: 'Oportunidade de Melhoria',
        text: 'Seus tempos de recuperação diminuíram 15% nas últimas 2 semanas. Isso indica que você pode aumentar a intensidade dos treinos gradualmente.',
        actions: ['Ajustar Plano', 'Manter Atual']
      }
    ];

    container.innerHTML = messages.map(msg => `
      <div class="ai-coach-message ai-fade-in">
        <div class="ai-coach-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="ai-coach-content">
          <h4 class="ai-coach-title">${msg.title}</h4>
          <p class="ai-coach-text">${msg.text}</p>
          <div class="ai-coach-actions">
            ${msg.actions.map(action => `
              <button class="ai-coach-action">${action}</button>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Simula atualização da IA
   */
  simulateAIUpdate() {
    // Simula pequenas mudanças nos dados
    this.goals.forEach(goal => {
      if (Math.random() > 0.7) {
        const increment = Math.random() * 0.5;
        goal.current = Math.min(goal.current + increment, goal.target);
      }
    });

    this.renderGoals();
    
    if (window.animationsManager) {
      window.animationsManager.animateNotification('IA atualizou suas análises', 'info');
    }
  }

  /**
   * Mostra modal de criar meta
   */
  showCreateGoalModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-md w-full">
        <h3 class="text-xl font-bold mb-6">Nova Meta Inteligente</h3>
        
        <form id="goal-form">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Tipo de Meta</label>
            <select class="input w-full" id="goal-type" required>
              <option value="">Selecione o tipo</option>
              <option value="distance">Distância</option>
              <option value="time">Tempo</option>
              <option value="frequency">Frequência</option>
              <option value="weight">Peso</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Título</label>
            <input type="text" class="input w-full" id="goal-title" placeholder="Ex: Correr 10km" required>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Meta</label>
            <input type="number" class="input w-full" id="goal-target" placeholder="Ex: 10" required>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Prazo</label>
            <input type="date" class="input w-full" id="goal-deadline" required>
          </div>
          
          <div class="flex gap-3">
            <button type="button" class="btn btn-outline flex-1" onclick="this.closest('.fixed').remove()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              <i class="fas fa-magic mr-2"></i>
              Criar com IA
            </button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    modal.querySelector('#goal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.createGoalWithAI(modal);
    });
  }

  /**
   * Cria meta com assistência da IA
   */
  createGoalWithAI(modal) {
    const formData = new FormData(modal.querySelector('#goal-form'));
    const goalData = Object.fromEntries(formData);
    
    // Simula processamento da IA
    const submitBtn = modal.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i>Analisando...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      const newGoal = {
        id: this.goals.length + 1,
        title: goalData['goal-title'],
        description: `Meta criada com assistência da IA`,
        type: goalData['goal-type'],
        target: parseFloat(goalData['goal-target']),
        current: 0,
        unit: this.getUnitForType(goalData['goal-type']),
        deadline: goalData['goal-deadline'],
        probability: 'medium',
        aiSuggested: true,
        createdBy: 'ai'
      };
      
      this.goals.push(newGoal);
      this.renderGoals();
      
      modal.remove();
      
      if (window.animationsManager) {
        window.animationsManager.animateNotification('Meta criada com sucesso! 🎯', 'success');
      }
    }, 2000);
  }

  /**
   * Retorna unidade baseada no tipo
   */
  getUnitForType(type) {
    const units = {
      distance: 'km',
      time: 'minutos',
      frequency: 'vezes',
      weight: 'kg'
    };
    return units[type] || '';
  }

  /**
   * Aceita recomendação da IA
   */
  acceptRecommendation(recId) {
    const recommendation = this.recommendations.find(r => r.id === recId);
    if (!recommendation) return;
    
    if (window.animationsManager) {
      window.animationsManager.animateNotification(`Recomendação "${recommendation.title}" aceita!`, 'success');
    }
    
    // Remove recomendação aceita
    this.recommendations = this.recommendations.filter(r => r.id !== recId);
    this.renderRecommendations();
  }

  /**
   * Edita meta
   */
  editGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;
    
    console.log('Editando meta:', goal);
    // Implementar modal de edição
  }

  /**
   * Toggle assistente IA
   */
  toggleAIAssistant() {
    console.log('Toggle AI Assistant');
    // Implementar painel do assistente
  }

  /**
   * Mostra chat da IA
   */
  showAIChat() {
    console.log('Show AI Chat');
    // Implementar chat com IA
  }

  /**
   * Atualiza gráfico de previsão
   */
  updatePredictionChart(period) {
    if (!this.performanceChart) return;
    
    // Simula novos dados baseados no período
    const newData = this.generatePredictionData(parseInt(period));
    this.performanceChart.data.datasets[1].data = newData;
    this.performanceChart.update();
  }

  /**
   * Gera dados de previsão
   */
  generatePredictionData(days) {
    const baseValue = 82;
    const data = new Array(8).fill(null);
    
    for (let i = 4; i < 8; i++) {
      data[i] = baseValue + (i - 3) * 3 + Math.random() * 2;
    }
    
    return data;
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.aiInsightsController = new AIInsightsController();
});

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIInsightsController;
}
