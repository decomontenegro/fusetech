/**
 * Serviço de autenticação com suporte a JWT
 * 
 * Este serviço simula um backend real para autenticação,
 * utilizando tokens JWT armazenados localmente.
 */

class AuthService {
  constructor() {
    this.tokenKey = 'jwt_token';
    this.userKey = 'user';
    this.refreshTokenKey = 'refresh_token';
    this.tokenExpiryKey = 'token_expiry';
    
    // Tempo de expiração do token em segundos (1 hora)
    this.tokenExpiration = 3600;
    
    // Tempo de expiração do refresh token em segundos (7 dias)
    this.refreshTokenExpiration = 604800;
    
    // Chave secreta para assinar tokens (apenas para simulação)
    this.secretKey = 'fuselabs-secret-key-2023';
    
    // Usuários de demonstração
    this.demoUsers = [
      {
        id: '1',
        email: 'usuario@exemplo.com',
        password: 'senha123', // Em um sistema real, seria um hash
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        id: '2',
        email: 'maria@exemplo.com',
        password: 'senha456',
        name: 'Maria Oliveira',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    ];
  }
  
  /**
   * Gera um token JWT simulado
   * @param {Object} payload - Dados a serem incluídos no token
   * @returns {String} Token JWT
   */
  generateToken(payload) {
    // Header (em um sistema real, seria codificado em base64)
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    // Adicionar tempo de expiração ao payload
    const now = Math.floor(Date.now() / 1000);
    payload.iat = now;
    payload.exp = now + this.tokenExpiration;
    
    // Em um sistema real, o token seria assinado criptograficamente
    // Aqui, apenas simulamos o formato do token
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(this.secretKey + encodedHeader + encodedPayload);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
  
  /**
   * Gera um refresh token
   * @param {String} userId - ID do usuário
   * @returns {String} Refresh token
   */
  generateRefreshToken(userId) {
    const payload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.refreshTokenExpiration
    };
    
    return this.generateToken(payload);
  }
  
  /**
   * Verifica se um token é válido
   * @param {String} token - Token JWT a ser verificado
   * @returns {Boolean} Verdadeiro se o token for válido
   */
  verifyToken(token) {
    try {
      // Dividir o token em suas partes
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      
      // Decodificar o payload
      const payload = JSON.parse(atob(encodedPayload));
      
      // Verificar expiração
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.warn('Token expirado');
        return false;
      }
      
      // Em um sistema real, verificaríamos a assinatura criptograficamente
      // Aqui, apenas simulamos a verificação
      const expectedSignature = btoa(this.secretKey + encodedHeader + encodedPayload);
      if (signature !== expectedSignature) {
        console.warn('Assinatura do token inválida');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  }
  
  /**
   * Decodifica um token JWT
   * @param {String} token - Token JWT a ser decodificado
   * @returns {Object|null} Payload do token ou null se inválido
   */
  decodeToken(token) {
    try {
      const [, encodedPayload] = token.split('.');
      return JSON.parse(atob(encodedPayload));
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }
  
  /**
   * Realiza login do usuário
   * @param {String} email - Email do usuário
   * @param {String} password - Senha do usuário
   * @param {Boolean} rememberMe - Se deve manter o usuário logado
   * @returns {Promise} Promessa resolvida com os dados do usuário ou rejeitada com erro
   */
  login(email, password, rememberMe = false) {
    return new Promise((resolve, reject) => {
      // Simular delay de rede
      setTimeout(() => {
        // Encontrar usuário pelo email
        const user = this.demoUsers.find(u => u.email === email);
        
        if (!user) {
          return reject(new Error('Usuário não encontrado'));
        }
        
        // Verificar senha (em um sistema real, seria comparado com hash)
        if (user.password !== password) {
          return reject(new Error('Senha incorreta'));
        }
        
        // Criar payload para o token
        const tokenPayload = {
          sub: user.id,
          name: user.name,
          email: user.email
        };
        
        // Gerar token JWT
        const token = this.generateToken(tokenPayload);
        
        // Gerar refresh token se "lembrar-me" estiver ativado
        let refreshToken = null;
        if (rememberMe) {
          refreshToken = this.generateRefreshToken(user.id);
          localStorage.setItem(this.refreshTokenKey, refreshToken);
        }
        
        // Calcular tempo de expiração
        const expiryTime = new Date();
        expiryTime.setSeconds(expiryTime.getSeconds() + this.tokenExpiration);
        
        // Armazenar token e dados do usuário
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.tokenExpiryKey, expiryTime.getTime().toString());
        
        // Armazenar dados do usuário (sem a senha)
        const userData = { ...user };
        delete userData.password;
        localStorage.setItem(this.userKey, JSON.stringify(userData));
        
        // Retornar dados do usuário
        resolve({
          user: userData,
          token,
          refreshToken,
          expiresAt: expiryTime.getTime()
        });
      }, 800); // Simular delay de rede
    });
  }
  
  /**
   * Realiza logout do usuário
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    
    // Disparar evento de logout
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
  
  /**
   * Verifica se o usuário está autenticado
   * @returns {Boolean} Verdadeiro se o usuário estiver autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;
    
    return this.verifyToken(token);
  }
  
  /**
   * Obtém o usuário atual
   * @returns {Object|null} Dados do usuário ou null se não estiver autenticado
   */
  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    try {
      return JSON.parse(localStorage.getItem(this.userKey));
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }
  
  /**
   * Atualiza o token usando o refresh token
   * @returns {Promise} Promessa resolvida com novo token ou rejeitada com erro
   */
  refreshAuthentication() {
    return new Promise((resolve, reject) => {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      
      if (!refreshToken) {
        return reject(new Error('Refresh token não encontrado'));
      }
      
      if (!this.verifyToken(refreshToken)) {
        this.logout();
        return reject(new Error('Refresh token inválido ou expirado'));
      }
      
      // Decodificar refresh token
      const payload = this.decodeToken(refreshToken);
      if (!payload || payload.type !== 'refresh') {
        this.logout();
        return reject(new Error('Tipo de token inválido'));
      }
      
      // Encontrar usuário pelo ID
      const user = this.demoUsers.find(u => u.id === payload.userId);
      if (!user) {
        this.logout();
        return reject(new Error('Usuário não encontrado'));
      }
      
      // Criar novo token
      const tokenPayload = {
        sub: user.id,
        name: user.name,
        email: user.email
      };
      
      // Gerar novo token JWT
      const newToken = this.generateToken(tokenPayload);
      
      // Calcular tempo de expiração
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + this.tokenExpiration);
      
      // Armazenar novo token
      localStorage.setItem(this.tokenKey, newToken);
      localStorage.setItem(this.tokenExpiryKey, expiryTime.getTime().toString());
      
      // Retornar novo token
      resolve({
        token: newToken,
        expiresAt: expiryTime.getTime()
      });
    });
  }
}

// Exportar instância do serviço
const authService = new AuthService();
