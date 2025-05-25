/**
 * Serviço de Conquistas e Recompensas
 * 
 * Este módulo gerencia conquistas, recompensas e progresso do usuário.
 */

export class AchievementService {
  /**
   * Construtor do serviço de conquistas
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   * @param {Object} store - Store para gerenciamento de estado
   * @param {Object} eventBus - Barramento de eventos para notificações
   */
  constructor(apiClient, store, eventBus) {
    this.apiClient = apiClient;
    this.store = store;
    this.eventBus = eventBus;
    
    // Vincular métodos
    this.getUserAchievements = this.getUserAchievements.bind(this);
    this.getAvailableAchievements = this.getAvailableAchievements.bind(this);
    this.getAchievementById = this.getAchievementById.bind(this);
    this.getUserRewards = this.getUserRewards.bind(this);
    this.claimReward = this.claimReward.bind(this);
    this.getAchievementProgress = this.getAchievementProgress.bind(this);
    this.trackProgress = this.trackProgress.bind(this);
    this.checkAchievements = this.checkAchievements.bind(this);
    
    // Inicializar listeners para eventos
    this._initEventListeners();
  }

  /**
   * Inicializar listeners para eventos
   * @private
   */
  _initEventListeners() {
    if (this.eventBus) {
      // Verificar conquistas quando uma atividade é adicionada
      this.eventBus.on('activities:added', ({ activity }) => {
        this.checkAchievements(activity);
      });
      
      // Verificar conquistas quando o usuário entra em uma liga
      this.eventBus.on('leagues:joined', ({ league }) => {
        this.checkAchievements(null, { type: 'league_joined', league });
      });
      
      // Verificar conquistas quando o usuário completa uma competição
      this.eventBus.on('competitions:completed', ({ competition }) => {
        this.checkAchievements(null, { type: 'competition_completed', competition });
      });
    }
  }

  /**
   * Obter conquistas do usuário
   * @returns {Promise<Array>} - Lista de conquistas do usuário
   */
  async getUserAchievements() {
    try {
      const achievements = await this.apiClient.get('/achievements/user');
      
      // Atualizar estado
      this.store.setState({
        userAchievements: achievements
      }, 'achievements-loaded');
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('achievements:loaded', { achievements });
      }
      
      return achievements;
    } catch (error) {
      console.error('Failed to get user achievements:', error);
      throw error;
    }
  }

  /**
   * Obter conquistas disponíveis
   * @returns {Promise<Array>} - Lista de conquistas disponíveis
   */
  async getAvailableAchievements() {
    try {
      return await this.apiClient.get('/achievements/available');
    } catch (error) {
      console.error('Failed to get available achievements:', error);
      throw error;
    }
  }

  /**
   * Obter detalhes de uma conquista
   * @param {String} achievementId - ID da conquista
   * @returns {Promise<Object>} - Detalhes da conquista
   */
  async getAchievementById(achievementId) {
    try {
      return await this.apiClient.get(`/achievements/${achievementId}`);
    } catch (error) {
      console.error(`Failed to get achievement ${achievementId}:`, error);
      throw error;
    }
  }

  /**
   * Obter recompensas do usuário
   * @returns {Promise<Array>} - Lista de recompensas do usuário
   */
  async getUserRewards() {
    try {
      const rewards = await this.apiClient.get('/rewards/user');
      
      // Atualizar estado
      this.store.setState({
        userRewards: rewards
      }, 'rewards-loaded');
      
      return rewards;
    } catch (error) {
      console.error('Failed to get user rewards:', error);
      throw error;
    }
  }

  /**
   * Reivindicar uma recompensa
   * @param {String} rewardId - ID da recompensa
   * @returns {Promise<Object>} - Resultado da reivindicação
   */
  async claimReward(rewardId) {
    try {
      const result = await this.apiClient.post(`/rewards/${rewardId}/claim`);
      
      // Atualizar recompensas do usuário
      await this.getUserRewards();
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('rewards:claimed', { rewardId, result });
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to claim reward ${rewardId}:`, error);
      throw error;
    }
  }

  /**
   * Obter progresso de uma conquista
   * @param {String} achievementId - ID da conquista
   * @returns {Promise<Object>} - Progresso da conquista
   */
  async getAchievementProgress(achievementId) {
    try {
      return await this.apiClient.get(`/achievements/${achievementId}/progress`);
    } catch (error) {
      console.error(`Failed to get progress for achievement ${achievementId}:`, error);
      throw error;
    }
  }

  /**
   * Rastrear progresso de conquistas
   * @param {String} type - Tipo de progresso
   * @param {Object} data - Dados do progresso
   * @returns {Promise<Object>} - Resultado do rastreamento
   */
  async trackProgress(type, data) {
    try {
      return await this.apiClient.post('/achievements/track', { type, data });
    } catch (error) {
      console.error(`Failed to track achievement progress:`, error);
      throw error;
    }
  }

  /**
   * Verificar conquistas com base em uma atividade ou evento
   * @param {Object} activity - Atividade (opcional)
   * @param {Object} event - Evento (opcional)
   * @returns {Promise<Array>} - Conquistas desbloqueadas
   */
  async checkAchievements(activity = null, event = null) {
    try {
      let payload = {};
      
      if (activity) {
        payload.activity = activity;
      }
      
      if (event) {
        payload.event = event;
      }
      
      const result = await this.apiClient.post('/achievements/check', payload);
      
      // Se alguma conquista foi desbloqueada
      if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
        // Atualizar conquistas do usuário
        await this.getUserAchievements();
        
        // Emitir evento para cada conquista desbloqueada
        if (this.eventBus) {
          result.unlockedAchievements.forEach(achievement => {
            this.eventBus.emit('achievements:unlocked', { achievement });
            
            // Mostrar notificação
            this._showAchievementNotification(achievement);
          });
        }
      }
      
      return result.unlockedAchievements || [];
    } catch (error) {
      console.error('Failed to check achievements:', error);
      return [];
    }
  }

  /**
   * Mostrar notificação de conquista
   * @param {Object} achievement - Conquista desbloqueada
   * @private
   */
  _showAchievementNotification(achievement) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    
    // Adicionar conteúdo
    notification.innerHTML = `
      <div class="achievement-icon">
        <img src="${achievement.icon || '/images/achievement-default.png'}" alt="${achievement.name}">
      </div>
      <div class="achievement-info">
        <h3>Conquista Desbloqueada!</h3>
        <h4>${achievement.name}</h4>
        <p>${achievement.description}</p>
      </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Adicionar classe para animação
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Remover após alguns segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 5000);
  }
}
