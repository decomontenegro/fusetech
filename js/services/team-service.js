/**
 * Serviço de Equipes
 * 
 * Este módulo gerencia equipes para competições, incluindo criação,
 * gerenciamento de membros e cálculo de pontuações.
 */

export class TeamService {
  /**
   * Construtor do serviço de equipes
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   * @param {Object} store - Store para gerenciamento de estado
   * @param {Object} eventBus - Barramento de eventos para notificações
   */
  constructor(apiClient, store, eventBus) {
    this.apiClient = apiClient;
    this.store = store;
    this.eventBus = eventBus;
    
    // Vincular métodos
    this.getUserTeams = this.getUserTeams.bind(this);
    this.getTeamById = this.getTeamById.bind(this);
    this.createTeam = this.createTeam.bind(this);
    this.updateTeam = this.updateTeam.bind(this);
    this.deleteTeam = this.deleteTeam.bind(this);
    this.inviteMember = this.inviteMember.bind(this);
    this.acceptInvitation = this.acceptInvitation.bind(this);
    this.rejectInvitation = this.rejectInvitation.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.leaveTeam = this.leaveTeam.bind(this);
    this.getTeamInvitations = this.getTeamInvitations.bind(this);
    this.getTeamMembers = this.getTeamMembers.bind(this);
    this.getTeamStatistics = this.getTeamStatistics.bind(this);
    this.getTeamCompetitions = this.getTeamCompetitions.bind(this);
    this.joinCompetition = this.joinCompetition.bind(this);
    this.leaveCompetition = this.leaveCompetition.bind(this);
  }

  /**
   * Obter equipes do usuário
   * @returns {Promise<Array>} - Lista de equipes do usuário
   */
  async getUserTeams() {
    try {
      const teams = await this.apiClient.get('/teams/user');
      
      // Atualizar estado
      this.store.setState({
        userTeams: teams
      }, 'teams-loaded');
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:loaded', { teams });
      }
      
      return teams;
    } catch (error) {
      console.error('Failed to get user teams:', error);
      throw error;
    }
  }

  /**
   * Obter detalhes de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Object>} - Detalhes da equipe
   */
  async getTeamById(teamId) {
    try {
      return await this.apiClient.get(`/teams/${teamId}`);
    } catch (error) {
      console.error(`Failed to get team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Criar uma nova equipe
   * @param {Object} teamData - Dados da equipe
   * @returns {Promise<Object>} - Equipe criada
   */
  async createTeam(teamData) {
    try {
      const team = await this.apiClient.post('/teams', teamData);
      
      // Atualizar estado
      const currentTeams = this.store.getState().userTeams || [];
      this.store.setState({
        userTeams: [...currentTeams, team]
      }, 'team-created');
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:created', { team });
      }
      
      return team;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  }

  /**
   * Atualizar uma equipe
   * @param {String} teamId - ID da equipe
   * @param {Object} teamData - Novos dados da equipe
   * @returns {Promise<Object>} - Equipe atualizada
   */
  async updateTeam(teamId, teamData) {
    try {
      const team = await this.apiClient.put(`/teams/${teamId}`, teamData);
      
      // Atualizar estado
      const currentTeams = this.store.getState().userTeams || [];
      const updatedTeams = currentTeams.map(t => 
        t.id === teamId ? { ...t, ...team } : t
      );
      
      this.store.setState({
        userTeams: updatedTeams
      }, 'team-updated');
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:updated', { team });
      }
      
      return team;
    } catch (error) {
      console.error(`Failed to update team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Excluir uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Boolean>} - Verdadeiro se excluído com sucesso
   */
  async deleteTeam(teamId) {
    try {
      await this.apiClient.delete(`/teams/${teamId}`);
      
      // Atualizar estado
      const currentTeams = this.store.getState().userTeams || [];
      const updatedTeams = currentTeams.filter(t => t.id !== teamId);
      
      this.store.setState({
        userTeams: updatedTeams
      }, 'team-deleted');
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:deleted', { teamId });
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to delete team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Convidar um membro para a equipe
   * @param {String} teamId - ID da equipe
   * @param {String} email - Email do usuário a ser convidado
   * @returns {Promise<Object>} - Convite enviado
   */
  async inviteMember(teamId, email) {
    try {
      return await this.apiClient.post(`/teams/${teamId}/invite`, { email });
    } catch (error) {
      console.error(`Failed to invite member to team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Aceitar um convite para equipe
   * @param {String} invitationId - ID do convite
   * @returns {Promise<Object>} - Resultado da aceitação
   */
  async acceptInvitation(invitationId) {
    try {
      const result = await this.apiClient.post(`/teams/invitations/${invitationId}/accept`);
      
      // Atualizar estado
      await this.getUserTeams();
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:invitation-accepted', { invitationId, result });
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to accept team invitation ${invitationId}:`, error);
      throw error;
    }
  }

  /**
   * Rejeitar um convite para equipe
   * @param {String} invitationId - ID do convite
   * @returns {Promise<Object>} - Resultado da rejeição
   */
  async rejectInvitation(invitationId) {
    try {
      const result = await this.apiClient.post(`/teams/invitations/${invitationId}/reject`);
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:invitation-rejected', { invitationId });
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to reject team invitation ${invitationId}:`, error);
      throw error;
    }
  }

  /**
   * Remover um membro da equipe
   * @param {String} teamId - ID da equipe
   * @param {String} userId - ID do usuário a ser removido
   * @returns {Promise<Boolean>} - Verdadeiro se removido com sucesso
   */
  async removeMember(teamId, userId) {
    try {
      await this.apiClient.delete(`/teams/${teamId}/members/${userId}`);
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:member-removed', { teamId, userId });
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to remove member ${userId} from team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Sair de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Boolean>} - Verdadeiro se saiu com sucesso
   */
  async leaveTeam(teamId) {
    try {
      await this.apiClient.post(`/teams/${teamId}/leave`);
      
      // Atualizar estado
      const currentTeams = this.store.getState().userTeams || [];
      const updatedTeams = currentTeams.filter(t => t.id !== teamId);
      
      this.store.setState({
        userTeams: updatedTeams
      }, 'team-left');
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:left', { teamId });
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to leave team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Obter convites para equipes
   * @returns {Promise<Array>} - Lista de convites
   */
  async getTeamInvitations() {
    try {
      const invitations = await this.apiClient.get('/teams/invitations');
      
      // Atualizar estado
      this.store.setState({
        teamInvitations: invitations
      }, 'team-invitations-loaded');
      
      return invitations;
    } catch (error) {
      console.error('Failed to get team invitations:', error);
      throw error;
    }
  }

  /**
   * Obter membros de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Array>} - Lista de membros
   */
  async getTeamMembers(teamId) {
    try {
      return await this.apiClient.get(`/teams/${teamId}/members`);
    } catch (error) {
      console.error(`Failed to get members for team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Object>} - Estatísticas da equipe
   */
  async getTeamStatistics(teamId) {
    try {
      return await this.apiClient.get(`/teams/${teamId}/statistics`);
    } catch (error) {
      console.error(`Failed to get statistics for team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Obter competições de uma equipe
   * @param {String} teamId - ID da equipe
   * @returns {Promise<Array>} - Lista de competições
   */
  async getTeamCompetitions(teamId) {
    try {
      return await this.apiClient.get(`/teams/${teamId}/competitions`);
    } catch (error) {
      console.error(`Failed to get competitions for team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Inscrever equipe em uma competição
   * @param {String} teamId - ID da equipe
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Object>} - Resultado da inscrição
   */
  async joinCompetition(teamId, competitionId) {
    try {
      const result = await this.apiClient.post(`/teams/${teamId}/competitions/${competitionId}/join`);
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:joined-competition', { teamId, competitionId });
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to join competition ${competitionId} with team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Retirar equipe de uma competição
   * @param {String} teamId - ID da equipe
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Boolean>} - Verdadeiro se retirado com sucesso
   */
  async leaveCompetition(teamId, competitionId) {
    try {
      await this.apiClient.post(`/teams/${teamId}/competitions/${competitionId}/leave`);
      
      // Emitir evento
      if (this.eventBus) {
        this.eventBus.emit('teams:left-competition', { teamId, competitionId });
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to leave competition ${competitionId} with team ${teamId}:`, error);
      throw error;
    }
  }
}
