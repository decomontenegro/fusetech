/**
 * Repositório para gerenciar operações relacionadas a atividades físicas
 * 
 * Este módulo fornece métodos para interagir com a API de atividades,
 * abstraindo os detalhes de comunicação HTTP.
 */

export class ActivityRepository {
  /**
   * Construtor do repositório de atividades
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   */
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obter atividades do usuário
   * @param {Object} params - Parâmetros de filtro e paginação
   * @returns {Promise<Array>} - Lista de atividades
   */
  async getUserActivities(params = {}) {
    return this.apiClient.get('/activities', params);
  }

  /**
   * Obter detalhes de uma atividade específica
   * @param {String} activityId - ID da atividade
   * @returns {Promise<Object>} - Detalhes da atividade
   */
  async getActivityById(activityId) {
    return this.apiClient.get(`/activities/${activityId}`);
  }

  /**
   * Criar uma nova atividade
   * @param {Object} activityData - Dados da atividade
   * @returns {Promise<Object>} - Atividade criada
   */
  async createActivity(activityData) {
    return this.apiClient.post('/activities', activityData);
  }

  /**
   * Atualizar uma atividade existente
   * @param {String} activityId - ID da atividade
   * @param {Object} activityData - Novos dados da atividade
   * @returns {Promise<Object>} - Atividade atualizada
   */
  async updateActivity(activityId, activityData) {
    return this.apiClient.put(`/activities/${activityId}`, activityData);
  }

  /**
   * Excluir uma atividade
   * @param {String} activityId - ID da atividade
   * @returns {Promise<Object>} - Resultado da operação
   */
  async deleteActivity(activityId) {
    return this.apiClient.delete(`/activities/${activityId}`);
  }

  /**
   * Obter resumo de atividades por período
   * @param {String} period - Período (day, week, month, year)
   * @returns {Promise<Object>} - Resumo de atividades
   */
  async getActivitySummary(period = 'week') {
    return this.apiClient.get('/activities/summary', { period });
  }

  /**
   * Obter estatísticas de atividades
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} - Estatísticas de atividades
   */
  async getActivityStats(params = {}) {
    return this.apiClient.get('/activities/stats', params);
  }

  /**
   * Obter rotas de atividades
   * @param {String} activityId - ID da atividade
   * @returns {Promise<Object>} - Dados da rota
   */
  async getActivityRoute(activityId) {
    return this.apiClient.get(`/activities/${activityId}/route`);
  }

  /**
   * Obter segmentos de uma atividade
   * @param {String} activityId - ID da atividade
   * @returns {Promise<Array>} - Lista de segmentos
   */
  async getActivitySegments(activityId) {
    return this.apiClient.get(`/activities/${activityId}/segments`);
  }

  /**
   * Obter zonas de frequência cardíaca de uma atividade
   * @param {String} activityId - ID da atividade
   * @returns {Promise<Array>} - Zonas de frequência cardíaca
   */
  async getActivityHeartRateZones(activityId) {
    return this.apiClient.get(`/activities/${activityId}/heart-rate-zones`);
  }

  /**
   * Obter dados de potência de uma atividade
   * @param {String} activityId - ID da atividade
   * @returns {Promise<Object>} - Dados de potência
   */
  async getActivityPowerData(activityId) {
    return this.apiClient.get(`/activities/${activityId}/power`);
  }

  /**
   * Sincronizar atividades de serviços externos
   * @param {String} source - Fonte das atividades (strava, garmin, etc.)
   * @param {Object} params - Parâmetros adicionais
   * @returns {Promise<Object>} - Resultado da sincronização
   */
  async syncActivities(source, params = {}) {
    return this.apiClient.post(`/activities/sync/${source}`, params);
  }

  /**
   * Obter status da sincronização
   * @returns {Promise<Object>} - Status da sincronização
   */
  async getSyncStatus() {
    return this.apiClient.get('/activities/sync/status');
  }

  /**
   * Compartilhar uma atividade
   * @param {String} activityId - ID da atividade
   * @param {Object} shareData - Dados de compartilhamento
   * @returns {Promise<Object>} - Resultado do compartilhamento
   */
  async shareActivity(activityId, shareData) {
    return this.apiClient.post(`/activities/${activityId}/share`, shareData);
  }

  /**
   * Adicionar comentário a uma atividade
   * @param {String} activityId - ID da atividade
   * @param {String} comment - Texto do comentário
   * @returns {Promise<Object>} - Comentário criado
   */
  async addActivityComment(activityId, comment) {
    return this.apiClient.post(`/activities/${activityId}/comments`, { comment });
  }

  /**
   * Curtir uma atividade
   * @param {String} activityId - ID da atividade
   * @returns {Promise<Object>} - Resultado da operação
   */
  async likeActivity(activityId) {
    return this.apiClient.post(`/activities/${activityId}/like`);
  }

  /**
   * Remover curtida de uma atividade
   * @param {String} activityId - ID da atividade
   * @returns {Promise<Object>} - Resultado da operação
   */
  async unlikeActivity(activityId) {
    return this.apiClient.delete(`/activities/${activityId}/like`);
  }
}
