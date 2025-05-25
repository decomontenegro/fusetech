/**
 * Serviço de integração com Strava
 * 
 * Este módulo gerencia a integração com a API do Strava,
 * incluindo autenticação, sincronização de atividades e webhooks.
 */

export class StravaService {
  /**
   * Construtor do serviço Strava
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   * @param {Object} activityRepository - Repositório de atividades
   * @param {Object} store - Store para gerenciamento de estado
   */
  constructor(apiClient, activityRepository, store) {
    this.apiClient = apiClient;
    this.activityRepository = activityRepository;
    this.store = store;
    this.clientId = process.env.STRAVA_CLIENT_ID;
    this.redirectUri = process.env.STRAVA_REDIRECT_URI;
  }

  /**
   * Iniciar fluxo de autorização do Strava
   * @returns {String} - URL de autorização
   */
  getAuthorizationUrl() {
    const scope = 'read,activity:read_all,profile:read_all';
    
    const url = new URL('https://www.strava.com/oauth/authorize');
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', this.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', scope);
    
    return url.toString();
  }

  /**
   * Redirecionar para página de autorização do Strava
   */
  authorize() {
    window.location.href = this.getAuthorizationUrl();
  }

  /**
   * Processar callback de autorização do Strava
   * @param {String} code - Código de autorização
   * @returns {Promise<Object>} - Resultado da conexão
   */
  async handleAuthCallback(code) {
    try {
      // Enviar código para o backend
      const result = await this.apiClient.post('/integrations/strava/connect', { code });
      
      // Atualizar estado
      this.store.setState({
        integrations: {
          ...this.store.getState().integrations,
          strava: {
            connected: true,
            athleteId: result.athleteId,
            athleteName: result.athleteName,
            connectedAt: new Date().toISOString()
          }
        }
      }, 'strava-connect');
      
      return result;
    } catch (error) {
      console.error('Failed to connect Strava account:', error);
      throw error;
    }
  }

  /**
   * Desconectar conta do Strava
   * @returns {Promise<Object>} - Resultado da desconexão
   */
  async disconnect() {
    try {
      // Enviar solicitação para o backend
      const result = await this.apiClient.post('/integrations/strava/disconnect');
      
      // Atualizar estado
      const state = this.store.getState();
      const integrations = { ...state.integrations };
      delete integrations.strava;
      
      this.store.setState({ integrations }, 'strava-disconnect');
      
      return result;
    } catch (error) {
      console.error('Failed to disconnect Strava account:', error);
      throw error;
    }
  }

  /**
   * Sincronizar atividades do Strava
   * @param {Object} options - Opções de sincronização
   * @returns {Promise<Object>} - Resultado da sincronização
   */
  async syncActivities(options = {}) {
    try {
      // Atualizar estado para indicar sincronização em andamento
      this.store.setState({
        ui: {
          ...this.store.getState().ui,
          syncingStrava: true
        }
      }, 'strava-sync-start');
      
      // Enviar solicitação para o backend
      const result = await this.apiClient.post('/integrations/strava/sync', options);
      
      // Atualizar estado
      this.store.setState({
        ui: {
          ...this.store.getState().ui,
          syncingStrava: false,
          lastStravaSync: new Date().toISOString()
        }
      }, 'strava-sync-complete');
      
      // Recarregar atividades
      await this.activityRepository.getUserActivities();
      
      return result;
    } catch (error) {
      console.error('Failed to sync Strava activities:', error);
      
      // Atualizar estado para indicar erro
      this.store.setState({
        ui: {
          ...this.store.getState().ui,
          syncingStrava: false,
          stravaError: error.message
        }
      }, 'strava-sync-error');
      
      throw error;
    }
  }

  /**
   * Obter status da conexão com Strava
   * @returns {Promise<Object>} - Status da conexão
   */
  async getConnectionStatus() {
    try {
      return await this.apiClient.get('/integrations/strava/status');
    } catch (error) {
      console.error('Failed to get Strava connection status:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de sincronização
   * @returns {Promise<Array>} - Histórico de sincronização
   */
  async getSyncHistory() {
    try {
      return await this.apiClient.get('/integrations/strava/sync-history');
    } catch (error) {
      console.error('Failed to get Strava sync history:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas do atleta no Strava
   * @returns {Promise<Object>} - Estatísticas do atleta
   */
  async getAthleteStats() {
    try {
      return await this.apiClient.get('/integrations/strava/athlete-stats');
    } catch (error) {
      console.error('Failed to get Strava athlete stats:', error);
      throw error;
    }
  }

  /**
   * Verificar se a conta do Strava está conectada
   * @returns {Boolean} - Verdadeiro se a conta estiver conectada
   */
  isConnected() {
    const state = this.store.getState();
    return state.integrations && state.integrations.strava && state.integrations.strava.connected;
  }
}
