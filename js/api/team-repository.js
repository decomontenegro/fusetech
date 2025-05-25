/**
 * Repositório para gerenciar operações relacionadas a equipes
 */

export class TeamRepository {
  /**
   * Construtor do repositório de equipes
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   */
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obter equipes do usuário
   * @returns {Promise<Array>} - Lista de equipes do usuário
   */
  async getUserTeams() {
    return this.apiClient.get('/teams/user');
  }

  /**
   * Obter equipes disponíveis para participar
   * @param {Object} params - Parâmetros de filtro e paginação
   * @returns {Promise<Array>} - Lista de equipes disponíveis
   */
  async getAvailableTeams(params = {}) {
    return this.apiClient.get('/teams/available', params);
  }

  /**
   * Obter detalhes de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Object>} - Detalhes da equipe
   */
  async getTeamById(teamId) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    return this.apiClient.get(`/teams/${teamId}`);
  }

  /**
   * Criar uma nova equipe
   * @param {Object} teamData - Dados da equipe
   * @returns {Promise<Object>} - Equipe criada
   */
  async createTeam(teamData) {
    return this.apiClient.post('/teams', teamData);
  }

  /**
   * Atualizar uma equipe
   * @param {String} teamId - ID da equipe
   * @param {Object} teamData - Novos dados da equipe
   * @returns {Promise<Object>} - Equipe atualizada
   */
  async updateTeam(teamId, teamData) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    return this.apiClient.put(`/teams/${teamId}`, teamData);
  }

  /**
   * Excluir uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Boolean>} - Verdadeiro se excluído com sucesso
   */
  async deleteTeam(teamId) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    await this.apiClient.delete(`/teams/${teamId}`);
    return true;
  }

  /**
   * Convidar um membro para a equipe
   * @param {String} teamId - ID da equipe
   * @param {String} email - Email do usuário a ser convidado
   * @returns {Promise<Object>} - Convite enviado
   */
  async inviteMember(teamId, email) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    return this.apiClient.post(`/teams/${teamId}/invite`, { email });
  }

  /**
   * Aceitar um convite para equipe
   * @param {String} invitationId - ID do convite
   * @returns {Promise<Object>} - Resultado da aceitação
   */
  async acceptInvitation(invitationId) {
    if (!invitationId) {
      throw new Error('Invitation ID is required');
    }
    
    return this.apiClient.post(`/teams/invitations/${invitationId}/accept`);
  }

  /**
   * Rejeitar um convite para equipe
   * @param {String} invitationId - ID do convite
   * @returns {Promise<Object>} - Resultado da rejeição
   */
  async rejectInvitation(invitationId) {
    if (!invitationId) {
      throw new Error('Invitation ID is required');
    }
    
    return this.apiClient.post(`/teams/invitations/${invitationId}/reject`);
  }

  /**
   * Remover um membro da equipe
   * @param {String} teamId - ID da equipe
   * @param {String} userId - ID do usuário a ser removido
   * @returns {Promise<Boolean>} - Verdadeiro se removido com sucesso
   */
  async removeMember(teamId, userId) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    await this.apiClient.delete(`/teams/${teamId}/members/${userId}`);
    return true;
  }

  /**
   * Sair de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Boolean>} - Verdadeiro se saiu com sucesso
   */
  async leaveTeam(teamId) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    await this.apiClient.post(`/teams/${teamId}/leave`);
    return true;
  }

  /**
   * Obter convites para equipes
   * @returns {Promise<Array>} - Lista de convites
   */
  async getTeamInvitations() {
    return this.apiClient.get('/teams/invitations');
  }

  /**
   * Obter membros de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Array>} - Lista de membros
   */
  async getTeamMembers(teamId) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    return this.apiClient.get(`/teams/${teamId}/members`);
  }

  /**
   * Obter estatísticas de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Object>} - Estatísticas da equipe
   */
  async getTeamStatistics(teamId) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    return this.apiClient.get(`/teams/${teamId}/statistics`);
  }

  /**
   * Obter competições de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Array>} - Lista de competições
   */
  async getTeamCompetitions(teamId) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    return this.apiClient.get(`/teams/${teamId}/competitions`);
  }

  /**
   * Inscrever equipe em uma competição
   * @param {String} teamId - ID da equipe
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Object>} - Resultado da inscrição
   */
  async joinCompetition(teamId, competitionId) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    if (!competitionId) {
      throw new Error('Competition ID is required');
    }
    
    return this.apiClient.post(`/teams/${teamId}/competitions/${competitionId}/join`);
  }

  /**
   * Retirar equipe de uma competição
   * @param {String} teamId - ID da equipe
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Boolean>} - Verdadeiro se retirado com sucesso
   */
  async leaveCompetition(teamId, competitionId) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    if (!competitionId) {
      throw new Error('Competition ID is required');
    }
    
    await this.apiClient.post(`/teams/${teamId}/competitions/${competitionId}/leave`);
    return true;
  }

  /**
   * Obter equipes recomendadas para o usuário
   * @param {Number} limit - Limite de resultados
   * @returns {Promise<Array>} - Lista de equipes recomendadas
   */
  async getRecommendedTeams(limit = 3) {
    return this.apiClient.get('/teams/recommended', { limit });
  }

  /**
   * Pesquisar equipes
   * @param {String} query - Termo de pesquisa
   * @param {Object} params - Parâmetros adicionais
   * @returns {Promise<Array>} - Resultados da pesquisa
   */
  async searchTeams(query, params = {}) {
    return this.apiClient.get('/teams/search', { query, ...params });
  }
}
