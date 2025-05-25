/**
 * Inicialização da Aplicação
 *
 * Este módulo configura e inicializa todos os serviços e componentes da aplicação.
 */

import { EventBus } from './state/event-bus.js';
import { store } from './state/store.js';
import { ApiClient } from './api/api-client.js';
import { TokenManager } from './auth/token-manager.js';
import { AuthService } from './auth/auth-service.js';
import { LeagueRepository } from './api/league-repository.js';
import { UserRepository } from './api/user-repository.js';
import { ActivityRepository } from './api/activity-repository.js';
import { StravaService } from './services/strava-service.js';
import { DeviceService } from './services/device-service.js';
import { CacheService } from './services/cache-service.js';

class App {
  /**
   * Construtor da aplicação
   */
  constructor() {
    // Configurações da aplicação
    this.config = {
      apiUrl: process.env.API_URL || '/api',
      debug: process.env.NODE_ENV !== 'production',
      version: process.env.APP_VERSION || '1.0.0'
    };

    // Serviços da aplicação
    this.services = {};

    // Repositórios da aplicação
    this.repositories = {};

    // Estado de inicialização
    this.initialized = false;
  }

  /**
   * Inicializar a aplicação
   * @returns {Promise<Boolean>} - Verdadeiro se inicializado com sucesso
   */
  async init() {
    try {
      console.log(`Initializing FUSEtech App v${this.config.version}`);

      // Inicializar barramento de eventos
      this.eventBus = new EventBus();

      // Inicializar serviço de cache
      this.services.cache = new CacheService(3600000, {
        namespace: 'fusetech',
        debug: this.config.debug
      });

      // Inicializar gerenciador de tokens
      this.services.tokenManager = new TokenManager(null, localStorage);

      // Inicializar cliente API
      this.services.apiClient = new ApiClient(this.config.apiUrl, this.services.tokenManager);

      // Configurar referência circular para o TokenManager
      this.services.tokenManager.apiClient = this.services.apiClient;

      // Inicializar serviço de autenticação
      this.services.auth = new AuthService(
        this.services.apiClient,
        this.services.tokenManager,
        this.eventBus
      );

      // Inicializar repositórios
      this.repositories.league = new LeagueRepository(this.services.apiClient);
      this.repositories.user = new UserRepository(this.services.apiClient);
      this.repositories.activity = new ActivityRepository(this.services.apiClient);

      // Inicializar serviços adicionais
      this.services.strava = new StravaService(
        this.services.apiClient,
        this.repositories.activity,
        store
      );

      this.services.device = new DeviceService(
        this.services.apiClient,
        store,
        this.eventBus
      );

      // Verificar autenticação
      await this._checkAuthentication();

      // Inicializar serviços que dependem de autenticação
      if (this.isAuthenticated()) {
        await this._initAuthenticatedServices();
      }

      // Configurar listeners de eventos
      this._setupEventListeners();

      // Inicializar UI
      this._initUI();

      this.initialized = true;
      console.log('App initialized successfully');

      // Emitir evento de inicialização
      this.eventBus.emit('app:initialized');

      return true;
    } catch (error) {
      console.error('Failed to initialize app:', error);

      // Emitir evento de erro
      this.eventBus.emit('app:error', { error });

      return false;
    }
  }

  /**
   * Verificar autenticação do usuário
   * @returns {Promise<Boolean>} - Verdadeiro se autenticado
   * @private
   */
  async _checkAuthentication() {
    try {
      // Verificar se há um token válido
      if (!this.services.tokenManager.isTokenValid()) {
        return false;
      }

      // Obter usuário atual
      const user = await this.services.auth.getCurrentUser();

      if (user) {
        // Atualizar estado
        store.setState({ user }, 'auth-check');

        // Emitir evento de login
        this.eventBus.emit('auth:login', user);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Inicializar serviços que dependem de autenticação
   * @returns {Promise<void>}
   * @private
   */
  async _initAuthenticatedServices() {
    try {
      // Inicializar serviço de dispositivos
      await this.services.device.init();

      // Carregar dados iniciais
      await this._loadInitialData();
    } catch (error) {
      console.error('Failed to initialize authenticated services:', error);
    }
  }

  /**
   * Carregar dados iniciais da aplicação
   * @returns {Promise<void>}
   * @private
   */
  async _loadInitialData() {
    try {
      // Carregar em paralelo para melhor performance
      const [userLeagues, userCompetitions, activities] = await Promise.all([
        this.repositories.league.getUserLeagues(),
        this.repositories.league.getUserCompetitions(),
        this.repositories.activity.getUserActivities({ limit: 10 })
      ]);

      // Atualizar estado
      store.setState({
        userLeagues,
        userCompetitions,
        activities
      }, 'initial-data-load');

      // Emitir evento de dados carregados
      this.eventBus.emit('app:data-loaded');
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  /**
   * Configurar listeners de eventos
   * @private
   */
  _setupEventListeners() {
    // Listener para login
    this.eventBus.on('auth:login', async (user) => {
      // Inicializar serviços autenticados
      await this._initAuthenticatedServices();

      // Redirecionar para dashboard se necessário
      if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        window.location.href = '/dashboard';
      }
    });

    // Listener para logout
    this.eventBus.on('auth:logout', () => {
      // Limpar estado
      store.setState({
        user: null,
        userLeagues: [],
        userCompetitions: [],
        activities: []
      }, 'logout');

      // Redirecionar para login
      window.location.href = '/login';
    });

    // Listener para erros de API
    this.eventBus.on('api:error', (error) => {
      // Mostrar notificação de erro
      this._showNotification('Erro', error.message, 'error');
    });
  }

  /**
   * Inicializar UI
   * @private
   */
  _initUI() {
    // Configurar tema
    this._setupTheme();

    // Configurar componentes globais
    this._setupGlobalComponents();

    // Configurar navegação
    this._setupNavigation();
  }

  /**
   * Configurar tema da aplicação
   * @private
   */
  _setupTheme() {
    // Obter tema das preferências do usuário
    const userTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = userTheme || systemTheme;

    // Aplicar tema
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Atualizar estado
    store.setState({
      ui: {
        ...store.getState().ui,
        theme
      }
    }, 'theme-setup');
  }

  /**
   * Configurar componentes globais
   * @private
   */
  _setupGlobalComponents() {
    // Configurar notificações
    this._setupNotifications();

    // Configurar modais
    this._setupModals();
  }

  /**
   * Configurar sistema de notificações
   * @private
   */
  _setupNotifications() {
    // Implementar conforme necessário
  }

  /**
   * Configurar sistema de modais
   * @private
   */
  _setupModals() {
    // Implementar conforme necessário
  }

  /**
   * Configurar navegação
   * @private
   */
  _setupNavigation() {
    // Implementar conforme necessário
  }

  /**
   * Mostrar notificação
   * @param {String} title - Título da notificação
   * @param {String} message - Mensagem da notificação
   * @param {String} type - Tipo da notificação (info, success, warning, error)
   * @private
   */
  _showNotification(title, message, type = 'info') {
    // Emitir evento de notificação
    this.eventBus.emit('notification:show', { title, message, type });

    // Implementar conforme necessário
  }

  /**
   * Verificar se o usuário está autenticado
   * @returns {Boolean} - Verdadeiro se autenticado
   */
  isAuthenticated() {
    return this.services.auth.isAuthenticated();
  }

  /**
   * Obter usuário atual
   * @returns {Object|null} - Usuário atual ou null se não autenticado
   */
  getCurrentUser() {
    return store.getState().user;
  }
}

// Criar instância global da aplicação
window.app = new App();

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app.init().catch(error => {
    console.error('App initialization failed:', error);
  });
});
