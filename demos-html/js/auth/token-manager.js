/**
 * Gerenciador de tokens de autenticação
 * 
 * Este módulo gerencia o armazenamento, recuperação e renovação de tokens JWT
 * para autenticação com a API.
 */

export class TokenManager {
  /**
   * Construtor do gerenciador de tokens
   * @param {Object} apiClient - Cliente API para renovação de tokens
   * @param {Object} storage - Objeto de armazenamento (localStorage, sessionStorage, etc.)
   */
  constructor(apiClient = null, storage = localStorage) {
    this.apiClient = apiClient;
    this.storage = storage;
    this.tokenKey = 'auth_token';
    this.refreshTokenKey = 'refresh_token';
    this.expiresAtKey = 'token_expires_at';
  }

  /**
   * Obter o token de autenticação atual
   * @returns {Promise<String>} - Token JWT
   */
  async getToken() {
    const token = this.storage.getItem(this.tokenKey);
    const expiresAt = this.storage.getItem(this.expiresAtKey);
    
    // Verificar se o token existe
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Verificar se o token expirou
    if (expiresAt && Date.now() >= parseInt(expiresAt, 10)) {
      // Tentar renovar o token
      return this.refreshToken();
    }
    
    return token;
  }

  /**
   * Salvar tokens de autenticação
   * @param {Object} tokenData - Dados do token (token, refreshToken, expiresIn)
   */
  saveTokens(tokenData) {
    if (!tokenData.token) {
      throw new Error('Invalid token data');
    }
    
    // Salvar token de acesso
    this.storage.setItem(this.tokenKey, tokenData.token);
    
    // Salvar refresh token se disponível
    if (tokenData.refreshToken) {
      this.storage.setItem(this.refreshTokenKey, tokenData.refreshToken);
    }
    
    // Calcular e salvar data de expiração
    if (tokenData.expiresIn) {
      const expiresAt = Date.now() + (tokenData.expiresIn * 1000);
      this.storage.setItem(this.expiresAtKey, expiresAt.toString());
    }
  }

  /**
   * Renovar o token de autenticação
   * @returns {Promise<String>} - Novo token JWT
   */
  async refreshToken() {
    // Verificar se temos um cliente API e um refresh token
    if (!this.apiClient) {
      throw new Error('API client not available for token refresh');
    }
    
    const refreshToken = this.storage.getItem(this.refreshTokenKey);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      // Fazer requisição para renovar o token
      const response = await this.apiClient.post('/auth/refresh', { refreshToken });
      
      // Salvar novos tokens
      this.saveTokens({
        token: response.token,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn
      });
      
      return response.token;
    } catch (error) {
      // Limpar tokens em caso de erro
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Verificar se o token atual é válido
   * @returns {Boolean} - Verdadeiro se o token existir e não tiver expirado
   */
  isTokenValid() {
    const token = this.storage.getItem(this.tokenKey);
    const expiresAt = this.storage.getItem(this.expiresAtKey);
    
    if (!token) {
      return false;
    }
    
    if (expiresAt) {
      return Date.now() < parseInt(expiresAt, 10);
    }
    
    // Se não temos informação de expiração, assumimos que o token é válido
    return true;
  }

  /**
   * Limpar todos os tokens armazenados
   */
  clearTokens() {
    this.storage.removeItem(this.tokenKey);
    this.storage.removeItem(this.refreshTokenKey);
    this.storage.removeItem(this.expiresAtKey);
  }
}
