/**
 * Testes para o serviço de autenticação
 */

// Definir suite de testes para AuthService
TestRunner.suite('AuthService', function() {
  let originalLocalStorage;
  
  // Configurar mock do localStorage antes de cada teste
  TestRunner.beforeEach(function() {
    // Salvar referência original do localStorage
    originalLocalStorage = {
      getItem: localStorage.getItem,
      setItem: localStorage.setItem,
      removeItem: localStorage.removeItem
    };
    
    // Criar mock do localStorage
    const mockStorage = {};
    
    // Substituir métodos do localStorage
    localStorage.getItem = function(key) {
      return mockStorage[key] || null;
    };
    
    localStorage.setItem = function(key, value) {
      mockStorage[key] = value;
    };
    
    localStorage.removeItem = function(key) {
      delete mockStorage[key];
    };
  });
  
  // Restaurar localStorage após cada teste
  TestRunner.afterEach(function() {
    // Restaurar métodos originais do localStorage
    localStorage.getItem = originalLocalStorage.getItem;
    localStorage.setItem = originalLocalStorage.setItem;
    localStorage.removeItem = originalLocalStorage.removeItem;
  });
  
  // Teste: Gerar token JWT
  TestRunner.test('deve gerar um token JWT válido', function() {
    const payload = { sub: '123', name: 'Test User' };
    const token = authService.generateToken(payload);
    
    // Verificar formato do token (header.payload.signature)
    TestRunner.assert.isTrue(token.split('.').length === 3, 'Token deve ter formato header.payload.signature');
    
    // Decodificar payload
    const [, encodedPayload] = token.split('.');
    const decodedPayload = JSON.parse(atob(encodedPayload));
    
    // Verificar conteúdo do payload
    TestRunner.assert.equal(decodedPayload.sub, payload.sub, 'Payload deve conter o ID do usuário');
    TestRunner.assert.equal(decodedPayload.name, payload.name, 'Payload deve conter o nome do usuário');
    TestRunner.assert.isDefined(decodedPayload.iat, 'Payload deve conter timestamp de emissão');
    TestRunner.assert.isDefined(decodedPayload.exp, 'Payload deve conter timestamp de expiração');
  });
  
  // Teste: Verificar token válido
  TestRunner.test('deve verificar um token válido', function() {
    const payload = { sub: '123', name: 'Test User' };
    const token = authService.generateToken(payload);
    
    const isValid = authService.verifyToken(token);
    TestRunner.assert.isTrue(isValid, 'Token válido deve ser verificado como verdadeiro');
  });
  
  // Teste: Verificar token inválido
  TestRunner.test('deve rejeitar um token inválido', function() {
    const invalidToken = 'header.payload.invalid-signature';
    
    const isValid = authService.verifyToken(invalidToken);
    TestRunner.assert.isFalse(isValid, 'Token inválido deve ser verificado como falso');
  });
  
  // Teste: Decodificar token
  TestRunner.test('deve decodificar corretamente um token', function() {
    const payload = { sub: '123', name: 'Test User' };
    const token = authService.generateToken(payload);
    
    const decodedPayload = authService.decodeToken(token);
    
    TestRunner.assert.equal(decodedPayload.sub, payload.sub, 'Payload decodificado deve conter o ID do usuário');
    TestRunner.assert.equal(decodedPayload.name, payload.name, 'Payload decodificado deve conter o nome do usuário');
  });
  
  // Teste: Login com credenciais válidas
  TestRunner.test('deve fazer login com credenciais válidas', async function() {
    const email = 'usuario@exemplo.com';
    const password = 'senha123';
    
    const result = await authService.login(email, password);
    
    TestRunner.assert.isDefined(result.token, 'Resultado deve conter um token');
    TestRunner.assert.isDefined(result.user, 'Resultado deve conter dados do usuário');
    TestRunner.assert.equal(result.user.email, email, 'Email do usuário deve corresponder');
    
    // Verificar se os dados foram armazenados no localStorage
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user');
    
    TestRunner.assert.isDefined(storedToken, 'Token deve ser armazenado no localStorage');
    TestRunner.assert.isDefined(storedUser, 'Dados do usuário devem ser armazenados no localStorage');
  });
  
  // Teste: Login com credenciais inválidas
  TestRunner.test('deve rejeitar login com credenciais inválidas', async function() {
    const email = 'usuario@exemplo.com';
    const password = 'senha_incorreta';
    
    try {
      await authService.login(email, password);
      // Se chegar aqui, o teste falhou
      throw new Error('Login com credenciais inválidas não deve ser bem-sucedido');
    } catch (error) {
      // Erro esperado
      TestRunner.assert.isDefined(error, 'Deve lançar um erro para credenciais inválidas');
    }
  });
  
  // Teste: Logout
  TestRunner.test('deve fazer logout corretamente', function() {
    // Configurar estado autenticado
    localStorage.setItem('jwt_token', 'dummy-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    
    // Executar logout
    authService.logout();
    
    // Verificar se os dados foram removidos do localStorage
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user');
    
    TestRunner.assert.isNull(storedToken, 'Token deve ser removido do localStorage');
    TestRunner.assert.isNull(storedUser, 'Dados do usuário devem ser removidos do localStorage');
  });
  
  // Teste: Verificar autenticação
  TestRunner.test('deve verificar corretamente o estado de autenticação', function() {
    // Inicialmente não autenticado
    TestRunner.assert.isFalse(authService.isAuthenticated(), 'Inicialmente não deve estar autenticado');
    
    // Configurar estado autenticado
    const payload = { sub: '123', name: 'Test User' };
    const token = authService.generateToken(payload);
    localStorage.setItem('jwt_token', token);
    
    // Agora deve estar autenticado
    TestRunner.assert.isTrue(authService.isAuthenticated(), 'Deve estar autenticado após definir token válido');
  });
  
  // Teste: Obter usuário atual
  TestRunner.test('deve obter corretamente o usuário atual', function() {
    // Configurar estado autenticado
    const payload = { sub: '123', name: 'Test User' };
    const token = authService.generateToken(payload);
    const userData = { id: '123', name: 'Test User', email: 'test@example.com' };
    
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Obter usuário atual
    const currentUser = authService.getCurrentUser();
    
    TestRunner.assert.isDefined(currentUser, 'Deve retornar dados do usuário');
    TestRunner.assert.equal(currentUser.id, userData.id, 'ID do usuário deve corresponder');
    TestRunner.assert.equal(currentUser.name, userData.name, 'Nome do usuário deve corresponder');
    TestRunner.assert.equal(currentUser.email, userData.email, 'Email do usuário deve corresponder');
  });
  
  // Teste: Refresh token
  TestRunner.test('deve renovar a autenticação com refresh token', async function() {
    // Configurar estado com refresh token
    const userId = '123';
    const refreshToken = authService.generateRefreshToken(userId);
    localStorage.setItem('refresh_token', refreshToken);
    
    // Renovar autenticação
    const result = await authService.refreshAuthentication();
    
    TestRunner.assert.isDefined(result.token, 'Resultado deve conter um novo token');
    TestRunner.assert.isDefined(result.expiresAt, 'Resultado deve conter tempo de expiração');
    
    // Verificar se o novo token foi armazenado
    const storedToken = localStorage.getItem('jwt_token');
    TestRunner.assert.equal(storedToken, result.token, 'Novo token deve ser armazenado no localStorage');
  });
});
