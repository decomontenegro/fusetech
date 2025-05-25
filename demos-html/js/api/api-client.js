/**
 * Cliente API para comunicação com o backend
 * 
 * Este módulo fornece uma interface unificada para fazer requisições HTTP,
 * gerenciando tokens de autenticação e tratamento de erros.
 */

export class ApiClient {
  /**
   * Construtor do cliente API
   * @param {String} baseUrl - URL base para todas as requisições
   * @param {Object} tokenManager - Gerenciador de tokens de autenticação
   */
  constructor(baseUrl, tokenManager) {
    this.baseUrl = baseUrl;
    this.tokenManager = tokenManager;
  }

  /**
   * Fazer uma requisição GET
   * @param {String} endpoint - Endpoint da API
   * @param {Object} params - Parâmetros de consulta
   * @returns {Promise<Object>} - Resposta da API
   */
  async get(endpoint, params = {}) {
    // Construir URL com parâmetros de consulta
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    return this._request('GET', url.toString());
  }

  /**
   * Fazer uma requisição POST
   * @param {String} endpoint - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @returns {Promise<Object>} - Resposta da API
   */
  async post(endpoint, data = {}) {
    return this._request('POST', `${this.baseUrl}${endpoint}`, data);
  }

  /**
   * Fazer uma requisição PUT
   * @param {String} endpoint - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @returns {Promise<Object>} - Resposta da API
   */
  async put(endpoint, data = {}) {
    return this._request('PUT', `${this.baseUrl}${endpoint}`, data);
  }

  /**
   * Fazer uma requisição DELETE
   * @param {String} endpoint - Endpoint da API
   * @returns {Promise<Object>} - Resposta da API
   */
  async delete(endpoint) {
    return this._request('DELETE', `${this.baseUrl}${endpoint}`);
  }

  /**
   * Método interno para fazer requisições HTTP
   * @param {String} method - Método HTTP (GET, POST, etc.)
   * @param {String} url - URL completa da requisição
   * @param {Object} data - Dados a serem enviados (para POST, PUT)
   * @returns {Promise<Object>} - Resposta da API
   * @private
   */
  async _request(method, url, data = null) {
    // Obter token de autenticação
    let token = null;
    
    if (this.tokenManager) {
      try {
        token = await this.tokenManager.getToken();
      } catch (error) {
        console.warn('Failed to get authentication token:', error);
      }
    }
    
    // Configurar opções da requisição
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    // Adicionar token de autenticação se disponível
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Adicionar corpo da requisição para métodos não-GET
    if (method !== 'GET' && data !== null) {
      options.body = JSON.stringify(data);
    }
    
    try {
      // Fazer a requisição
      const response = await fetch(url, options);
      
      // Verificar se a resposta é bem-sucedida
      if (!response.ok) {
        // Tratar erros de autenticação
        if (response.status === 401 && this.tokenManager) {
          // Tentar renovar o token e refazer a requisição
          try {
            await this.tokenManager.refreshToken();
            return this._request(method, url, data);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw new Error('Authentication failed');
          }
        }
        
        // Tratar outros erros
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `API Error: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      // Verificar se a resposta está vazia
      if (response.status === 204) {
        return null;
      }
      
      // Parsear resposta como JSON
      return await response.json();
    } catch (error) {
      // Adicionar informações de contexto ao erro
      if (!error.status) {
        error.message = `Network error: ${error.message}`;
      }
      
      console.error('API Request failed:', error);
      throw error;
    }
  }
}
