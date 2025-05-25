/**
 * Repositório para gerenciar operações relacionadas a usuários
 * 
 * Este módulo fornece métodos para interagir com a API de usuários,
 * abstraindo os detalhes de comunicação HTTP.
 */

export class UserRepository {
  /**
   * Construtor do repositório de usuários
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   */
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obter perfil do usuário atual
   * @returns {Promise<Object>} - Dados do perfil do usuário
   */
  async getCurrentUser() {
    return this.apiClient.get('/users/me');
  }

  /**
   * Obter perfil de um usuário específico
   * @param {String} userId - ID do usuário
   * @returns {Promise<Object>} - Dados do perfil do usuário
   */
  async getUserById(userId) {
    return this.apiClient.get(`/users/${userId}`);
  }

  /**
   * Atualizar perfil do usuário atual
   * @param {Object} userData - Novos dados do perfil
   * @returns {Promise<Object>} - Perfil atualizado
   */
  async updateProfile(userData) {
    return this.apiClient.put('/users/me', userData);
  }

  /**
   * Atualizar configurações do usuário
   * @param {Object} settings - Novas configurações
   * @returns {Promise<Object>} - Configurações atualizadas
   */
  async updateSettings(settings) {
    return this.apiClient.put('/users/me/settings', settings);
  }

  /**
   * Obter estatísticas do usuário
   * @returns {Promise<Object>} - Estatísticas do usuário
   */
  async getUserStats() {
    return this.apiClient.get('/users/me/stats');
  }

  /**
   * Obter conquistas do usuário
   * @returns {Promise<Array>} - Lista de conquistas
   */
  async getUserAchievements() {
    return this.apiClient.get('/users/me/achievements');
  }

  /**
   * Obter amigos do usuário
   * @returns {Promise<Array>} - Lista de amigos
   */
  async getUserFriends() {
    return this.apiClient.get('/users/me/friends');
  }

  /**
   * Adicionar um amigo
   * @param {String} userId - ID do usuário a ser adicionado
   * @returns {Promise<Object>} - Resultado da operação
   */
  async addFriend(userId) {
    return this.apiClient.post('/users/me/friends', { userId });
  }

  /**
   * Remover um amigo
   * @param {String} userId - ID do amigo a ser removido
   * @returns {Promise<Object>} - Resultado da operação
   */
  async removeFriend(userId) {
    return this.apiClient.delete(`/users/me/friends/${userId}`);
  }

  /**
   * Obter solicitações de amizade pendentes
   * @returns {Promise<Array>} - Lista de solicitações pendentes
   */
  async getFriendRequests() {
    return this.apiClient.get('/users/me/friend-requests');
  }

  /**
   * Aceitar uma solicitação de amizade
   * @param {String} requestId - ID da solicitação
   * @returns {Promise<Object>} - Resultado da operação
   */
  async acceptFriendRequest(requestId) {
    return this.apiClient.post(`/users/me/friend-requests/${requestId}/accept`);
  }

  /**
   * Rejeitar uma solicitação de amizade
   * @param {String} requestId - ID da solicitação
   * @returns {Promise<Object>} - Resultado da operação
   */
  async rejectFriendRequest(requestId) {
    return this.apiClient.post(`/users/me/friend-requests/${requestId}/reject`);
  }

  /**
   * Obter notificações do usuário
   * @param {Object} params - Parâmetros de filtro (opcional)
   * @returns {Promise<Array>} - Lista de notificações
   */
  async getNotifications(params = {}) {
    return this.apiClient.get('/users/me/notifications', params);
  }

  /**
   * Marcar notificação como lida
   * @param {String} notificationId - ID da notificação
   * @returns {Promise<Object>} - Resultado da operação
   */
  async markNotificationAsRead(notificationId) {
    return this.apiClient.put(`/users/me/notifications/${notificationId}/read`);
  }

  /**
   * Marcar todas as notificações como lidas
   * @returns {Promise<Object>} - Resultado da operação
   */
  async markAllNotificationsAsRead() {
    return this.apiClient.put('/users/me/notifications/read-all');
  }
}
