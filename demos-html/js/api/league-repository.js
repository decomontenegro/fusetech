/**
 * Repositório para gerenciar operações relacionadas a ligas e competições
 * 
 * Este módulo fornece métodos para interagir com a API de ligas e competições,
 * abstraindo os detalhes de comunicação HTTP.
 */

export class LeagueRepository {
  /**
   * Construtor do repositório de ligas
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   */
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obter todas as ligas disponíveis
   * @param {Object} params - Parâmetros de filtro (opcional)
   * @returns {Promise<Array>} - Lista de ligas
   */
  async getLeagues(params = {}) {
    return this.apiClient.get('/leagues', params);
  }

  /**
   * Obter ligas do usuário atual
   * @returns {Promise<Array>} - Lista de ligas do usuário
   */
  async getUserLeagues() {
    return this.apiClient.get('/leagues/user');
  }

  /**
   * Obter detalhes de uma liga específica
   * @param {String} leagueId - ID da liga
   * @returns {Promise<Object>} - Detalhes da liga
   */
  async getLeagueById(leagueId) {
    return this.apiClient.get(`/leagues/${leagueId}`);
  }

  /**
   * Entrar em uma liga
   * @param {String} leagueId - ID da liga
   * @returns {Promise<Object>} - Resultado da operação
   */
  async joinLeague(leagueId) {
    return this.apiClient.post(`/leagues/${leagueId}/join`);
  }

  /**
   * Sair de uma liga
   * @param {String} leagueId - ID da liga
   * @returns {Promise<Object>} - Resultado da operação
   */
  async leaveLeague(leagueId) {
    return this.apiClient.post(`/leagues/${leagueId}/leave`);
  }

  /**
   * Obter leaderboard de uma liga
   * @param {String} leagueId - ID da liga
   * @returns {Promise<Array>} - Leaderboard da liga
   */
  async getLeaderboard(leagueId) {
    return this.apiClient.get(`/leagues/${leagueId}/leaderboard`);
  }

  /**
   * Criar uma nova liga
   * @param {Object} leagueData - Dados da liga
   * @returns {Promise<Object>} - Liga criada
   */
  async createLeague(leagueData) {
    return this.apiClient.post('/leagues', leagueData);
  }

  /**
   * Obter todas as competições disponíveis
   * @param {Object} params - Parâmetros de filtro (opcional)
   * @returns {Promise<Array>} - Lista de competições
   */
  async getCompetitions(params = {}) {
    return this.apiClient.get('/competitions', params);
  }

  /**
   * Obter competições do usuário atual
   * @returns {Promise<Array>} - Lista de competições do usuário
   */
  async getUserCompetitions() {
    return this.apiClient.get('/competitions/user');
  }

  /**
   * Obter detalhes de uma competição específica
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Object>} - Detalhes da competição
   */
  async getCompetitionById(competitionId) {
    return this.apiClient.get(`/competitions/${competitionId}`);
  }

  /**
   * Entrar em uma competição
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Object>} - Resultado da operação
   */
  async joinCompetition(competitionId) {
    return this.apiClient.post(`/competitions/${competitionId}/join`);
  }

  /**
   * Sair de uma competição
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Object>} - Resultado da operação
   */
  async leaveCompetition(competitionId) {
    return this.apiClient.post(`/competitions/${competitionId}/leave`);
  }

  /**
   * Obter leaderboard de uma competição
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Array>} - Leaderboard da competição
   */
  async getCompetitionLeaderboard(competitionId) {
    return this.apiClient.get(`/competitions/${competitionId}/leaderboard`);
  }

  /**
   * Criar uma nova competição
   * @param {Object} competitionData - Dados da competição
   * @returns {Promise<Object>} - Competição criada
   */
  async createCompetition(competitionData) {
    return this.apiClient.post('/competitions', competitionData);
  }

  /**
   * Obter ligas recomendadas para o usuário
   * @param {Number} limit - Número máximo de recomendações
   * @returns {Promise<Array>} - Lista de ligas recomendadas
   */
  async getRecommendedLeagues(limit = 3) {
    return this.apiClient.get('/leagues/recommended', { limit });
  }

  /**
   * Obter competições recomendadas para o usuário
   * @param {Number} limit - Número máximo de recomendações
   * @returns {Promise<Array>} - Lista de competições recomendadas
   */
  async getRecommendedCompetitions(limit = 3) {
    return this.apiClient.get('/competitions/recommended', { limit });
  }
}
