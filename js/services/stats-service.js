/**
 * Serviço de Estatísticas
 * 
 * Este módulo fornece estatísticas detalhadas sobre atividades,
 * progresso e desempenho do usuário.
 */

export class StatsService {
  /**
   * Construtor do serviço de estatísticas
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   * @param {Object} store - Store para gerenciamento de estado
   * @param {Object} eventBus - Barramento de eventos para notificações
   */
  constructor(apiClient, store, eventBus) {
    this.apiClient = apiClient;
    this.store = store;
    this.eventBus = eventBus;
    this.cache = {};
    
    // Vincular métodos
    this.getUserStats = this.getUserStats.bind(this);
    this.getActivityStats = this.getActivityStats.bind(this);
    this.getWeeklyStats = this.getWeeklyStats.bind(this);
    this.getMonthlyStats = this.getMonthlyStats.bind(this);
    this.getYearlyStats = this.getYearlyStats.bind(this);
    this.getComparisonStats = this.getComparisonStats.bind(this);
    this.getTrendStats = this.getTrendStats.bind(this);
    this.getLeagueStats = this.getLeagueStats.bind(this);
    this.getTeamStats = this.getTeamStats.bind(this);
    this.getActivityTypeStats = this.getActivityTypeStats.bind(this);
    this.getPersonalRecords = this.getPersonalRecords.bind(this);
    this.getHeatmap = this.getHeatmap.bind(this);
    this.getGoalProgress = this.getGoalProgress.bind(this);
    
    // Inicializar listeners para eventos
    this._initEventListeners();
  }

  /**
   * Inicializar listeners para eventos
   * @private
   */
  _initEventListeners() {
    if (this.eventBus) {
      // Limpar cache quando uma nova atividade é adicionada
      this.eventBus.on('activities:added', () => {
        this._clearCache();
      });
      
      // Limpar cache quando uma atividade é atualizada
      this.eventBus.on('activities:updated', () => {
        this._clearCache();
      });
    }
  }

  /**
   * Limpar cache de estatísticas
   * @private
   */
  _clearCache() {
    this.cache = {};
  }

  /**
   * Obter estatísticas gerais do usuário
   * @returns {Promise<Object>} - Estatísticas do usuário
   */
  async getUserStats() {
    try {
      // Verificar cache
      if (this.cache.userStats) {
        return this.cache.userStats;
      }
      
      const stats = await this.apiClient.get('/stats/user');
      
      // Armazenar em cache
      this.cache.userStats = stats;
      
      // Atualizar estado
      this.store.setState({
        userStats: stats
      }, 'user-stats-loaded');
      
      return stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de uma atividade específica
   * @param {String} activityId - ID da atividade
   * @returns {Promise<Object>} - Estatísticas da atividade
   */
  async getActivityStats(activityId) {
    try {
      // Verificar cache
      const cacheKey = `activity_${activityId}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const stats = await this.apiClient.get(`/stats/activities/${activityId}`);
      
      // Armazenar em cache
      this.cache[cacheKey] = stats;
      
      return stats;
    } catch (error) {
      console.error(`Failed to get stats for activity ${activityId}:`, error);
      throw error;
    }
  }

  /**
   * Obter estatísticas semanais
   * @param {Object} params - Parâmetros de consulta
   * @returns {Promise<Object>} - Estatísticas semanais
   */
  async getWeeklyStats(params = {}) {
    try {
      // Gerar chave de cache com base nos parâmetros
      const cacheKey = `weekly_${JSON.stringify(params)}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const stats = await this.apiClient.get('/stats/weekly', params);
      
      // Armazenar em cache
      this.cache[cacheKey] = stats;
      
      return stats;
    } catch (error) {
      console.error('Failed to get weekly stats:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas mensais
   * @param {Object} params - Parâmetros de consulta
   * @returns {Promise<Object>} - Estatísticas mensais
   */
  async getMonthlyStats(params = {}) {
    try {
      // Gerar chave de cache com base nos parâmetros
      const cacheKey = `monthly_${JSON.stringify(params)}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const stats = await this.apiClient.get('/stats/monthly', params);
      
      // Armazenar em cache
      this.cache[cacheKey] = stats;
      
      return stats;
    } catch (error) {
      console.error('Failed to get monthly stats:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas anuais
   * @param {Object} params - Parâmetros de consulta
   * @returns {Promise<Object>} - Estatísticas anuais
   */
  async getYearlyStats(params = {}) {
    try {
      // Gerar chave de cache com base nos parâmetros
      const cacheKey = `yearly_${JSON.stringify(params)}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const stats = await this.apiClient.get('/stats/yearly', params);
      
      // Armazenar em cache
      this.cache[cacheKey] = stats;
      
      return stats;
    } catch (error) {
      console.error('Failed to get yearly stats:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de comparação
   * @param {String} compareWith - Tipo de comparação (previous, average, best)
   * @param {String} period - Período (week, month, year)
   * @returns {Promise<Object>} - Estatísticas de comparação
   */
  async getComparisonStats(compareWith = 'previous', period = 'week') {
    try {
      // Gerar chave de cache com base nos parâmetros
      const cacheKey = `comparison_${compareWith}_${period}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const stats = await this.apiClient.get('/stats/comparison', { compareWith, period });
      
      // Armazenar em cache
      this.cache[cacheKey] = stats;
      
      return stats;
    } catch (error) {
      console.error('Failed to get comparison stats:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de tendência
   * @param {String} metric - Métrica (distance, duration, elevation, etc.)
   * @param {String} period - Período (week, month, year)
   * @param {Number} count - Número de períodos
   * @returns {Promise<Object>} - Estatísticas de tendência
   */
  async getTrendStats(metric = 'distance', period = 'week', count = 10) {
    try {
      // Gerar chave de cache com base nos parâmetros
      const cacheKey = `trend_${metric}_${period}_${count}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const stats = await this.apiClient.get('/stats/trend', { metric, period, count });
      
      // Armazenar em cache
      this.cache[cacheKey] = stats;
      
      return stats;
    } catch (error) {
      console.error('Failed to get trend stats:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de liga
   * @param {String} leagueId - ID da liga
   * @returns {Promise<Object>} - Estatísticas da liga
   */
  async getLeagueStats(leagueId) {
    try {
      // Verificar cache
      const cacheKey = `league_${leagueId}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const stats = await this.apiClient.get(`/stats/leagues/${leagueId}`);
      
      // Armazenar em cache
      this.cache[cacheKey] = stats;
      
      return stats;
    } catch (error) {
      console.error(`Failed to get stats for league ${leagueId}:`, error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Object>} - Estatísticas da equipe
   */
  async getTeamStats(teamId) {
    try {
      // Verificar cache
      const cacheKey = `team_${teamId}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const stats = await this.apiClient.get(`/stats/teams/${teamId}`);
      
      // Armazenar em cache
      this.cache[cacheKey] = stats;
      
      return stats;
    } catch (error) {
      console.error(`Failed to get stats for team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Obter estatísticas por tipo de atividade
   * @param {String} activityType - Tipo de atividade
   * @returns {Promise<Object>} - Estatísticas do tipo de atividade
   */
  async getActivityTypeStats(activityType) {
    try {
      // Verificar cache
      const cacheKey = `type_${activityType}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const stats = await this.apiClient.get(`/stats/activity-types/${activityType}`);
      
      // Armazenar em cache
      this.cache[cacheKey] = stats;
      
      return stats;
    } catch (error) {
      console.error(`Failed to get stats for activity type ${activityType}:`, error);
      throw error;
    }
  }

  /**
   * Obter recordes pessoais
   * @returns {Promise<Object>} - Recordes pessoais
   */
  async getPersonalRecords() {
    try {
      // Verificar cache
      if (this.cache.personalRecords) {
        return this.cache.personalRecords;
      }
      
      const records = await this.apiClient.get('/stats/personal-records');
      
      // Armazenar em cache
      this.cache.personalRecords = records;
      
      return records;
    } catch (error) {
      console.error('Failed to get personal records:', error);
      throw error;
    }
  }

  /**
   * Obter mapa de calor de atividades
   * @param {Object} params - Parâmetros de consulta
   * @returns {Promise<Object>} - Dados do mapa de calor
   */
  async getHeatmap(params = {}) {
    try {
      // Gerar chave de cache com base nos parâmetros
      const cacheKey = `heatmap_${JSON.stringify(params)}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      const heatmap = await this.apiClient.get('/stats/heatmap', params);
      
      // Armazenar em cache
      this.cache[cacheKey] = heatmap;
      
      return heatmap;
    } catch (error) {
      console.error('Failed to get activity heatmap:', error);
      throw error;
    }
  }

  /**
   * Obter progresso de metas
   * @returns {Promise<Object>} - Progresso de metas
   */
  async getGoalProgress() {
    try {
      // Verificar cache
      if (this.cache.goalProgress) {
        return this.cache.goalProgress;
      }
      
      const progress = await this.apiClient.get('/stats/goal-progress');
      
      // Armazenar em cache
      this.cache.goalProgress = progress;
      
      return progress;
    } catch (error) {
      console.error('Failed to get goal progress:', error);
      throw error;
    }
  }
}
