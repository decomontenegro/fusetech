/**
 * FUSEtech Dashboard Widgets System
 * Sistema avançado de widgets para desktop com drag & drop e personalização
 */

class DashboardWidgets {
  constructor() {
    this.widgets = new Map();
    this.layout = this.loadLayout();
    this.draggedWidget = null;
    this.isDesktop = window.innerWidth >= 1024;
    
    this.init();
  }

  init() {
    if (!this.isDesktop) return;
    
    this.createWidgetContainer();
    this.registerDefaultWidgets();
    this.setupDragAndDrop();
    this.setupWidgetControls();
    this.renderWidgets();
    
    // Redetectar no resize
    window.addEventListener('resize', () => {
      this.isDesktop = window.innerWidth >= 1024;
      if (!this.isDesktop) {
        this.hideWidgets();
      } else {
        this.showWidgets();
      }
    });
  }

  /**
   * Cria container principal dos widgets
   */
  createWidgetContainer() {
    const main = document.querySelector('main');
    if (!main) return;

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'dashboard-widgets';
    widgetContainer.className = 'dashboard-widgets-container desktop-only';
    
    // Inserir após o header do dashboard
    const dashboardHeader = main.querySelector('.mb-8');
    if (dashboardHeader) {
      dashboardHeader.insertAdjacentElement('afterend', widgetContainer);
    } else {
      main.insertBefore(widgetContainer, main.firstChild);
    }
  }

  /**
   * Registra widgets padrão
   */
  registerDefaultWidgets() {
    this.registerWidget('performance-chart', {
      title: 'Gráfico de Performance',
      icon: 'fas fa-chart-line',
      size: 'large',
      render: this.renderPerformanceChart.bind(this)
    });

    this.registerWidget('recent-activities', {
      title: 'Atividades Recentes',
      icon: 'fas fa-running',
      size: 'medium',
      render: this.renderRecentActivities.bind(this)
    });

    this.registerWidget('goals-progress', {
      title: 'Progresso das Metas',
      icon: 'fas fa-bullseye',
      size: 'medium',
      render: this.renderGoalsProgress.bind(this)
    });

    this.registerWidget('achievements-showcase', {
      title: 'Conquistas Recentes',
      icon: 'fas fa-trophy',
      size: 'small',
      render: this.renderAchievements.bind(this)
    });

    this.registerWidget('token-balance', {
      title: 'Saldo de Tokens',
      icon: 'fas fa-coins',
      size: 'small',
      render: this.renderTokenBalance.bind(this)
    });

    this.registerWidget('weather-widget', {
      title: 'Condições do Tempo',
      icon: 'fas fa-cloud-sun',
      size: 'small',
      render: this.renderWeather.bind(this)
    });
  }

  /**
   * Registra um novo widget
   */
  registerWidget(id, config) {
    this.widgets.set(id, {
      id,
      ...config,
      enabled: this.layout.widgets?.[id]?.enabled ?? true,
      position: this.layout.widgets?.[id]?.position ?? this.widgets.size
    });
  }

  /**
   * Renderiza todos os widgets
   */
  renderWidgets() {
    const container = document.getElementById('dashboard-widgets');
    if (!container) return;

    container.innerHTML = `
      <div class="dashboard-widgets-header">
        <h2 class="text-2xl font-bold text-gray-900">Dashboard Personalizado</h2>
        <div class="dashboard-widgets-controls">
          <button class="btn btn-outline btn-sm" id="customize-widgets">
            <i class="fas fa-cog mr-2"></i>
            Personalizar
          </button>
          <button class="btn btn-ghost btn-sm" id="reset-layout">
            <i class="fas fa-undo mr-2"></i>
            Resetar
          </button>
        </div>
      </div>
      <div class="dashboard-widgets-grid" id="widgets-grid"></div>
    `;

    this.renderWidgetGrid();
  }

  /**
   * Renderiza grid de widgets
   */
  renderWidgetGrid() {
    const grid = document.getElementById('widgets-grid');
    if (!grid) return;

    // Ordenar widgets por posição
    const sortedWidgets = Array.from(this.widgets.values())
      .filter(widget => widget.enabled)
      .sort((a, b) => a.position - b.position);

    grid.innerHTML = '';

    sortedWidgets.forEach(widget => {
      const widgetElement = this.createWidgetElement(widget);
      grid.appendChild(widgetElement);
    });
  }

  /**
   * Cria elemento do widget
   */
  createWidgetElement(widget) {
    const element = document.createElement('div');
    element.className = `dashboard-widget dashboard-widget-${widget.size}`;
    element.dataset.widgetId = widget.id;
    element.draggable = true;

    element.innerHTML = `
      <div class="dashboard-widget-header">
        <div class="dashboard-widget-title">
          <i class="${widget.icon} mr-2"></i>
          ${widget.title}
        </div>
        <div class="dashboard-widget-actions">
          <button class="widget-action-btn" data-action="refresh">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button class="widget-action-btn" data-action="settings">
            <i class="fas fa-cog"></i>
          </button>
          <button class="widget-action-btn" data-action="close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="dashboard-widget-content" id="widget-content-${widget.id}">
        <div class="widget-loading">
          <i class="fas fa-spinner fa-spin"></i>
          Carregando...
        </div>
      </div>
    `;

    // Renderizar conteúdo do widget
    setTimeout(() => {
      const content = element.querySelector(`#widget-content-${widget.id}`);
      if (content && widget.render) {
        content.innerHTML = widget.render();
      }
    }, 100);

    return element;
  }

  /**
   * Renderiza gráfico de performance
   */
  renderPerformanceChart() {
    return `
      <div class="performance-chart">
        <canvas id="performance-canvas" width="400" height="200"></canvas>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color bg-blue-500"></span>
            Distância (km)
          </div>
          <div class="legend-item">
            <span class="legend-color bg-green-500"></span>
            Tempo (min)
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza atividades recentes
   */
  renderRecentActivities() {
    const activities = [
      { type: 'running', name: 'Corrida Matinal', distance: '5.2 km', time: '28:45', tokens: 15 },
      { type: 'cycling', name: 'Ciclismo', distance: '15.8 km', time: '45:20', tokens: 25 },
      { type: 'strength', name: 'Treino de Força', distance: '-', time: '60:00', tokens: 20 }
    ];

    return `
      <div class="recent-activities-list">
        ${activities.map(activity => `
          <div class="activity-item">
            <div class="activity-icon">
              <i class="fas fa-${activity.type === 'running' ? 'running' : activity.type === 'cycling' ? 'bicycle' : 'dumbbell'}"></i>
            </div>
            <div class="activity-details">
              <div class="activity-name">${activity.name}</div>
              <div class="activity-stats">${activity.distance} • ${activity.time}</div>
            </div>
            <div class="activity-tokens">+${activity.tokens} FUSE</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Renderiza progresso das metas
   */
  renderGoalsProgress() {
    const goals = [
      { name: 'Corrida Semanal', progress: 75, target: '20 km', current: '15 km' },
      { name: 'Treinos Mensais', progress: 60, target: '12 treinos', current: '7 treinos' },
      { name: 'Queima de Calorias', progress: 85, target: '2000 cal', current: '1700 cal' }
    ];

    return `
      <div class="goals-progress-list">
        ${goals.map(goal => `
          <div class="goal-item">
            <div class="goal-header">
              <span class="goal-name">${goal.name}</span>
              <span class="goal-percentage">${goal.progress}%</span>
            </div>
            <div class="goal-progress">
              <div class="progress">
                <div class="progress-bar" style="width: ${goal.progress}%"></div>
              </div>
            </div>
            <div class="goal-stats">
              <span class="goal-current">${goal.current}</span>
              <span class="goal-target">de ${goal.target}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Renderiza conquistas
   */
  renderAchievements() {
    const achievements = [
      { name: 'Maratonista', icon: 'trophy', level: 'gold' },
      { name: 'Consistente', icon: 'medal', level: 'silver' },
      { name: 'Velocista', icon: 'award', level: 'bronze' }
    ];

    return `
      <div class="achievements-showcase">
        ${achievements.map(achievement => `
          <div class="achievement-badge achievement-${achievement.level}">
            <i class="fas fa-${achievement.icon}"></i>
            <span>${achievement.name}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Renderiza saldo de tokens
   */
  renderTokenBalance() {
    return `
      <div class="token-balance-widget">
        <div class="token-amount">
          <span class="token-value">1,247</span>
          <span class="token-symbol">FUSE</span>
        </div>
        <div class="token-change positive">
          <i class="fas fa-arrow-up"></i>
          +47 hoje
        </div>
        <button class="btn btn-primary btn-sm w-full mt-3">
          <i class="fas fa-store mr-2"></i>
          Usar Tokens
        </button>
      </div>
    `;
  }

  /**
   * Renderiza widget do tempo
   */
  renderWeather() {
    return `
      <div class="weather-widget">
        <div class="weather-current">
          <div class="weather-icon">
            <i class="fas fa-sun"></i>
          </div>
          <div class="weather-temp">24°C</div>
        </div>
        <div class="weather-details">
          <div class="weather-condition">Ensolarado</div>
          <div class="weather-location">São Paulo, SP</div>
        </div>
        <div class="weather-recommendation">
          <i class="fas fa-running mr-1"></i>
          Ótimo para correr!
        </div>
      </div>
    `;
  }

  /**
   * Configura drag and drop
   */
  setupDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('dashboard-widget')) {
        this.draggedWidget = e.target;
        e.target.style.opacity = '0.5';
      }
    });

    document.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('dashboard-widget')) {
        e.target.style.opacity = '1';
        this.draggedWidget = null;
      }
    });

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      if (this.draggedWidget && e.target.classList.contains('dashboard-widget')) {
        this.swapWidgets(this.draggedWidget, e.target);
      }
    });
  }

  /**
   * Troca posição dos widgets
   */
  swapWidgets(widget1, widget2) {
    const id1 = widget1.dataset.widgetId;
    const id2 = widget2.dataset.widgetId;
    
    const pos1 = this.widgets.get(id1).position;
    const pos2 = this.widgets.get(id2).position;
    
    this.widgets.get(id1).position = pos2;
    this.widgets.get(id2).position = pos1;
    
    this.saveLayout();
    this.renderWidgetGrid();
  }

  /**
   * Configura controles dos widgets
   */
  setupWidgetControls() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('widget-action-btn')) {
        const action = e.target.dataset.action;
        const widget = e.target.closest('.dashboard-widget');
        const widgetId = widget.dataset.widgetId;
        
        this.handleWidgetAction(action, widgetId, widget);
      }
    });
  }

  /**
   * Manipula ações dos widgets
   */
  handleWidgetAction(action, widgetId, element) {
    switch (action) {
      case 'refresh':
        this.refreshWidget(widgetId);
        break;
      case 'settings':
        this.openWidgetSettings(widgetId);
        break;
      case 'close':
        this.closeWidget(widgetId);
        break;
    }
  }

  /**
   * Atualiza widget
   */
  refreshWidget(widgetId) {
    const content = document.querySelector(`#widget-content-${widgetId}`);
    if (content) {
      content.innerHTML = '<div class="widget-loading"><i class="fas fa-spinner fa-spin"></i> Atualizando...</div>';
      
      setTimeout(() => {
        const widget = this.widgets.get(widgetId);
        if (widget && widget.render) {
          content.innerHTML = widget.render();
        }
      }, 1000);
    }
  }

  /**
   * Fecha widget
   */
  closeWidget(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      widget.enabled = false;
      this.saveLayout();
      this.renderWidgetGrid();
    }
  }

  /**
   * Carrega layout salvo
   */
  loadLayout() {
    try {
      const saved = localStorage.getItem('fusetech-dashboard-layout');
      return saved ? JSON.parse(saved) : { widgets: {} };
    } catch {
      return { widgets: {} };
    }
  }

  /**
   * Salva layout atual
   */
  saveLayout() {
    const layout = {
      widgets: {}
    };

    this.widgets.forEach((widget, id) => {
      layout.widgets[id] = {
        enabled: widget.enabled,
        position: widget.position
      };
    });

    localStorage.setItem('fusetech-dashboard-layout', JSON.stringify(layout));
  }

  /**
   * Mostra widgets
   */
  showWidgets() {
    const container = document.getElementById('dashboard-widgets');
    if (container) {
      container.style.display = 'block';
    }
  }

  /**
   * Esconde widgets
   */
  hideWidgets() {
    const container = document.getElementById('dashboard-widgets');
    if (container) {
      container.style.display = 'none';
    }
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardWidgets = new DashboardWidgets();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardWidgets;
}
