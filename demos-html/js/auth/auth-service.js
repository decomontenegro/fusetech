/**
 * Serviço de autenticação
 * 
 * Este módulo gerencia a autenticação de usuários, incluindo login,
 * registro, recuperação de senha e gerenciamento de sessão.
 */

export class AuthService {
  /**
   * Construtor do serviço de autenticação
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   * @param {Object} tokenManager - Gerenciador de tokens
   * @param {Object} eventBus - Barramento de eventos para notificações
   */
  constructor(apiClient, tokenManager, eventBus = null) {
    this.apiClient = apiClient;
    this.tokenManager = tokenManager;
    this.eventBus = eventBus;
    this.currentUser = null;
  }

  /**
   * Fazer login com email e senha
   * @param {String} email - Email do usuário
   * @param {String} password - Senha do usuário
   * @returns {Promise<Object>} - Dados do usuário logado
   */
  async login(email, password) {
    try {
      // Fazer requisição de login
      const response = await this.apiClient.post('/auth/login', { email, password });
      
      // Salvar tokens
      this.tokenManager.saveTokens({
        token: response.token,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn
      });
      
      // Salvar dados do usuário
      this.currentUser = response.user;
      
      // Emitir evento de login
      if (this.eventBus) {
        this.eventBus.emit('auth:login', this.currentUser);
      }
      
      return this.currentUser;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Registrar um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} - Dados do usuário registrado
   */
  async register(userData) {
    try {
      // Fazer requisição de registro
      const response = await this.apiClient.post('/auth/register', userData);
      
      // Se o registro também faz login automaticamente
      if (response.token) {
        // Salvar tokens
        this.tokenManager.saveTokens({
          token: response.token,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn
        });
        
        // Salvar dados do usuário
        this.currentUser = response.user;
        
        // Emitir evento de login
        if (this.eventBus) {
          this.eventBus.emit('auth:login', this.currentUser);
        }
      }
      
      return response.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Fazer logout
   * @returns {Promise<Boolean>} - Verdadeiro se o logout foi bem-sucedido
   */
  async logout() {
    try {
      // Tentar fazer logout no servidor
      if (this.tokenManager.isTokenValid()) {
        await this.apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
      // Continuar com o logout local mesmo se a requisição falhar
    } finally {
      // Limpar tokens
      this.tokenManager.clearTokens();
      
      // Limpar dados do usuário
      this.currentUser = null;
      
      // Emitir evento de logout
      if (this.eventBus) {
        this.eventBus.emit('auth:logout');
      }
      
      return true;
    }
  }

  /**
   * Obter usuário atual
   * @param {Boolean} forceRefresh - Se verdadeiro, força uma nova requisição
   * @returns {Promise<Object>} - Dados do usuário atual
   */
  async getCurrentUser(forceRefresh = false) {
    // Retornar usuário em cache se disponível e não forçar atualização
    if (this.currentUser && !forceRefresh) {
      return this.currentUser;
    }
    
    // Verificar se há um token válido
    if (!this.tokenManager.isTokenValid()) {
      return null;
    }
    
    try {
      // Buscar dados do usuário
      const user = await this.apiClient.get('/auth/me');
      
      // Atualizar cache
      this.currentUser = user;
      
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      
      // Se o erro for de autenticação, limpar dados
      if (error.status === 401) {
        this.tokenManager.clearTokens();
        this.currentUser = null;
        
        // Emitir evento de logout
        if (this.eventBus) {
          this.eventBus.emit('auth:logout');
        }
      }
      
      return null;
    }
  }

  /**
   * Verificar se o usuário está autenticado
   * @returns {Boolean} - Verdadeiro se o usuário estiver autenticado
   */
  isAuthenticated() {
    return this.tokenManager.isTokenValid();
  }

  /**
   * Solicitar redefinição de senha
   * @param {String} email - Email do usuário
   * @returns {Promise<Object>} - Resultado da operação
   */
  async requestPasswordReset(email) {
    return this.apiClient.post('/auth/forgot-password', { email });
  }

  /**
   * Redefinir senha
   * @param {String} token - Token de redefinição
   * @param {String} newPassword - Nova senha
   * @returns {Promise<Object>} - Resultado da operação
   */
  async resetPassword(token, newPassword) {
    return this.apiClient.post('/auth/reset-password', { token, newPassword });
  }

  /**
   * Alterar senha do usuário atual
   * @param {String} currentPassword - Senha atual
   * @param {String} newPassword - Nova senha
   * @returns {Promise<Object>} - Resultado da operação
   */
  async changePassword(currentPassword, newPassword) {
    return this.apiClient.post('/auth/change-password', { currentPassword, newPassword });
  }

  /**
   * Verificar email
   * @param {String} token - Token de verificação
   * @returns {Promise<Object>} - Resultado da operação
   */
  async verifyEmail(token) {
    return this.apiClient.post('/auth/verify-email', { token });
  }

  /**
   * Reenviar email de verificação
   * @returns {Promise<Object>} - Resultado da operação
   */
  async resendVerificationEmail() {
    return this.apiClient.post('/auth/resend-verification');
  }

  /**
   * Login com provedor OAuth (Google, Facebook, etc.)
   * @param {String} provider - Nome do provedor
   * @returns {Promise<Object>} - Resultado da operação
   */
  async loginWithProvider(provider) {
    // Redirecionar para a página de autenticação do provedor
    window.location.href = `${this.apiClient.baseUrl}/auth/${provider}`;
    
    // Esta função não retorna nada, pois o navegador será redirecionado
  }

  /**
   * Processar callback de autenticação OAuth
   * @param {String} queryString - Query string da URL de callback
   * @returns {Promise<Object>} - Dados do usuário logado
   */
  async handleOAuthCallback(queryString) {
    const params = new URLSearchParams(queryString);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const expiresIn = params.get('expiresIn');
    
    if (!token) {
      throw new Error('No token received from OAuth provider');
    }
    
    // Salvar tokens
    this.tokenManager.saveTokens({
      token,
      refreshToken,
      expiresIn: parseInt(expiresIn, 10)
    });
    
    // Buscar dados do usuário
    const user = await this.getCurrentUser(true);
    
    // Emitir evento de login
    if (this.eventBus && user) {
      this.eventBus.emit('auth:login', user);
    }
    
    return user;
  }
}
