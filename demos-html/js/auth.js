// Funcionalidades de autenticação

// Importar serviço de autenticação
// Nota: Em um ambiente de produção, usaríamos import/export ES6
// const authService = require('./auth-service.js');

// Classe para gerenciar autenticação
class AuthManager {
  constructor() {
    this.isLoggedIn = false;
    this.currentUser = null;
    this.token = null;

    // Inicializar verificando se há um token salvo
    this.checkAuth();

    // Configurar verificação periódica de token
    this.setupTokenRefresh();

    // Escutar eventos de logout
    window.addEventListener('auth:logout', () => {
      this.handleLogout();
    });
  }

  // Verificar se o usuário está autenticado
  checkAuth() {
    if (authService.isAuthenticated()) {
      this.currentUser = authService.getCurrentUser();
      this.token = localStorage.getItem('jwt_token');
      this.isLoggedIn = true;
      return true;
    }

    return false;
  }

  // Configurar verificação periódica de token
  setupTokenRefresh() {
    // Verificar token a cada minuto
    setInterval(() => {
      if (this.isLoggedIn) {
        const tokenExpiry = localStorage.getItem('token_expiry');
        if (tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry, 10);
          const now = Date.now();

          // Se o token expira em menos de 5 minutos, tentar renovar
          if (expiryTime - now < 5 * 60 * 1000) {
            this.refreshToken();
          }
        }
      }
    }, 60000);
  }

  // Renovar token
  refreshToken() {
    if (localStorage.getItem('refresh_token')) {
      authService.refreshAuthentication()
        .then(result => {
          this.token = result.token;
          console.log('Token renovado com sucesso');
        })
        .catch(error => {
          console.error('Erro ao renovar token:', error);
          this.logout();
        });
    }
  }

  // Login do usuário
  login(email, password, rememberMe = false) {
    return authService.login(email, password, rememberMe)
      .then(result => {
        this.token = result.token;
        this.currentUser = result.user;
        this.isLoggedIn = true;
        return result.user;
      });
  }

  // Registro de novo usuário
  register(name, email, password) {
    // Criar um usuário temporário para simulação
    // Em um ambiente real, isso seria uma chamada de API para criar o usuário
    const tempUser = {
      id: Math.floor(Math.random() * 1000000).toString(),
      name: name,
      email: email,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };

    // Simular registro bem-sucedido e fazer login
    return new Promise((resolve, reject) => {
      // Verificar se o email já está em uso
      if (email === 'usuario@exemplo.com') {
        return reject(new Error('Este email já está em uso'));
      }

      // Simular delay de rede
      setTimeout(() => {
        // Fazer login com o novo usuário
        authService.login(email, password, true)
          .then(result => {
            this.token = result.token;
            this.currentUser = result.user;
            this.isLoggedIn = true;
            resolve(result.user);
          })
          .catch(error => {
            // Fallback para simulação se o login falhar
            // Em um ambiente real, isso não seria necessário
            localStorage.setItem('user', JSON.stringify(tempUser));
            this.currentUser = tempUser;
            this.isLoggedIn = true;
            resolve(tempUser);
          });
      }, 1000);
    });
  }

  // Logout do usuário
  logout() {
    authService.logout();
    this.handleLogout();
    return true;
  }

  // Manipular evento de logout
  handleLogout() {
    this.token = null;
    this.currentUser = null;
    this.isLoggedIn = false;

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('user:logout'));
  }

  // Verificar se o usuário está logado
  isAuthenticated() {
    return this.isLoggedIn;
  }

  // Obter dados do usuário atual
  getCurrentUser() {
    return this.currentUser;
  }

  // Obter token de autenticação
  getToken() {
    return this.token;
  }
}

// Instância global do gerenciador de autenticação
const authManager = new AuthManager();

// Função para mostrar mensagem de erro
function showError(message, formElement) {
  // Remover mensagens de erro anteriores
  const existingError = formElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Criar elemento de erro
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
  errorDiv.role = 'alert';

  // Adicionar mensagem
  errorDiv.innerHTML = `
    <span class="block sm:inline">${message}</span>
    <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
      <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <title>Fechar</title>
        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
      </svg>
    </span>
  `;

  // Adicionar ao formulário
  formElement.appendChild(errorDiv);

  // Configurar botão de fechar
  const closeButton = errorDiv.querySelector('svg');
  closeButton.addEventListener('click', () => {
    errorDiv.remove();
  });

  // Auto-fechar após 5 segundos
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

// Função para mostrar mensagem de sucesso
function showSuccess(message, formElement) {
  // Remover mensagens anteriores
  const existingMessage = formElement.querySelector('.success-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Criar elemento de sucesso
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4';
  successDiv.role = 'alert';

  // Adicionar mensagem
  successDiv.innerHTML = `
    <span class="block sm:inline">${message}</span>
    <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
      <svg class="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <title>Fechar</title>
        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
      </svg>
    </span>
  `;

  // Adicionar ao formulário
  formElement.appendChild(successDiv);

  // Configurar botão de fechar
  const closeButton = successDiv.querySelector('svg');
  closeButton.addEventListener('click', () => {
    successDiv.remove();
  });

  // Auto-fechar após 5 segundos
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.remove();
    }
  }, 5000);
}

// Função para mostrar indicador de carregamento
function showLoading(buttonElement, isLoading) {
  if (isLoading) {
    // Salvar o texto original do botão
    buttonElement.dataset.originalText = buttonElement.innerHTML;

    // Substituir por indicador de carregamento
    buttonElement.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processando...
    `;

    // Desabilitar o botão
    buttonElement.disabled = true;
  } else {
    // Restaurar o texto original
    buttonElement.innerHTML = buttonElement.dataset.originalText;

    // Habilitar o botão
    buttonElement.disabled = false;
  }
}

// Inicializar funcionalidades quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Carregar o serviço de autenticação
  const scriptElement = document.createElement('script');
  scriptElement.src = 'js/auth-service.js';
  scriptElement.onload = initializeAuth;
  document.head.appendChild(scriptElement);

  function initializeAuth() {
    // Verificar se estamos na página de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      // Adicionar validação em tempo real
      const emailInput = document.getElementById('email-address');
      const passwordInput = document.getElementById('password');

      // Validação de email
      emailInput.addEventListener('blur', function() {
        validateEmail(emailInput);
      });

      // Validação de senha
      passwordInput.addEventListener('blur', function() {
        validatePassword(passwordInput);
      });

      // Manipular envio do formulário
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const rememberMeCheckbox = document.getElementById('remember-me');
        const submitButton = loginForm.querySelector('button[type="submit"]');

        // Validar campos
        const isEmailValid = validateEmail(emailInput);
        const isPasswordValid = validatePassword(passwordInput);

        if (!isEmailValid || !isPasswordValid) {
          return;
        }

        // Mostrar carregamento
        showLoading(submitButton, true);

        // Tentar login
        authManager.login(emailInput.value, passwordInput.value, rememberMeCheckbox.checked)
          .then(user => {
            showSuccess('Login realizado com sucesso!', loginForm);

            // Redirecionar após 1 segundo
            setTimeout(() => {
              // Redirecionar para a página anterior, se disponível
              const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
              window.location.href = redirectUrl || 'index_modular.html';
            }, 1000);
          })
          .catch(error => {
            showError(error.message, loginForm);
          })
          .finally(() => {
            showLoading(submitButton, false);
          });
      });
    }
  }

  // Função para validar email
  function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(input.value);

    if (!input.value) {
      showInputError(input, 'O email é obrigatório');
      return false;
    } else if (!isValid) {
      showInputError(input, 'Por favor, insira um email válido');
      return false;
    } else {
      clearInputError(input);
      return true;
    }
  }

  // Função para validar senha
  function validatePassword(input) {
    if (!input.value) {
      showInputError(input, 'A senha é obrigatória');
      return false;
    } else if (input.value.length < 6) {
      showInputError(input, 'A senha deve ter pelo menos 6 caracteres');
      return false;
    } else {
      clearInputError(input);
      return true;
    }
  }

  // Função para mostrar erro de input
  function showInputError(input, message) {
    // Remover mensagem de erro anterior
    clearInputError(input);

    // Adicionar classe de erro
    input.classList.add('border-red-500');

    // Criar elemento de erro
    const errorElement = document.createElement('p');
    errorElement.className = 'text-red-500 text-xs mt-1 input-error';
    errorElement.innerText = message;

    // Inserir após o input
    input.parentNode.appendChild(errorElement);
  }

  // Função para limpar erro de input
  function clearInputError(input) {
    // Remover classe de erro
    input.classList.remove('border-red-500');

    // Remover mensagem de erro
    const errorElement = input.parentNode.querySelector('.input-error');
    if (errorElement) {
      errorElement.remove();
    }
  }
}

  // Verificar se estamos na página de registro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    // Adicionar validação em tempo real
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email-address');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');
    const termsCheckbox = document.getElementById('terms');

    // Validação de nome
    if (nameInput) {
      nameInput.addEventListener('blur', function() {
        validateName(nameInput);
      });
    }

    // Validação de email
    if (emailInput) {
      emailInput.addEventListener('blur', function() {
        validateEmail(emailInput);
      });
    }

    // Validação de senha
    if (passwordInput) {
      passwordInput.addEventListener('blur', function() {
        validatePassword(passwordInput);
      });

      // Atualizar força da senha em tempo real
      passwordInput.addEventListener('input', function() {
        updatePasswordStrength(passwordInput);
      });
    }

    // Validação de confirmação de senha
    if (passwordConfirmInput) {
      passwordConfirmInput.addEventListener('blur', function() {
        validatePasswordConfirm(passwordConfirmInput, passwordInput);
      });
    }

    // Manipular envio do formulário
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const submitButton = registerForm.querySelector('button[type="submit"]');

      // Validar todos os campos
      const isNameValid = validateName(nameInput);
      const isEmailValid = validateEmail(emailInput);
      const isPasswordValid = validatePassword(passwordInput);
      const isPasswordConfirmValid = validatePasswordConfirm(passwordConfirmInput, passwordInput);
      const isTermsAccepted = validateTerms(termsCheckbox);

      if (!isNameValid || !isEmailValid || !isPasswordValid || !isPasswordConfirmValid || !isTermsAccepted) {
        return;
      }

      // Mostrar carregamento
      showLoading(submitButton, true);

      // Tentar registro
      authManager.register(nameInput.value, emailInput.value, passwordInput.value)
        .then(user => {
          showSuccess('Conta criada com sucesso!', registerForm);

          // Redirecionar após 1 segundo
          setTimeout(() => {
            window.location.href = 'index_modular.html';
          }, 1000);
        })
        .catch(error => {
          showError(error.message, registerForm);
        })
        .finally(() => {
          showLoading(submitButton, false);
        });
    });
  }

  // Função para validar nome
  function validateName(input) {
    if (!input.value) {
      showInputError(input, 'O nome é obrigatório');
      return false;
    } else if (input.value.length < 3) {
      showInputError(input, 'O nome deve ter pelo menos 3 caracteres');
      return false;
    } else {
      clearInputError(input);
      return true;
    }
  }

  // Função para validar termos
  function validateTerms(checkbox) {
    if (!checkbox.checked) {
      showError('Você precisa aceitar os termos de serviço', checkbox.closest('form'));
      return false;
    }
    return true;
  }

  // Função para validar confirmação de senha
  function validatePasswordConfirm(confirmInput, passwordInput) {
    if (!confirmInput.value) {
      showInputError(confirmInput, 'A confirmação de senha é obrigatória');
      return false;
    } else if (confirmInput.value !== passwordInput.value) {
      showInputError(confirmInput, 'As senhas não coincidem');
      return false;
    } else {
      clearInputError(confirmInput);
      return true;
    }
  }

  // Função para atualizar indicador de força da senha
  function updatePasswordStrength(input) {
    // Remover indicador anterior
    const existingIndicator = input.parentNode.querySelector('.password-strength');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    if (!input.value) return;

    // Calcular força da senha
    const strength = calculatePasswordStrength(input.value);

    // Criar indicador
    const indicator = document.createElement('div');
    indicator.className = 'password-strength mt-1';

    // Barra de progresso
    const progressBar = document.createElement('div');
    progressBar.className = 'h-1 rounded-full';
    progressBar.style.width = `${strength.score * 25}%`;

    // Definir cor com base na força
    if (strength.score <= 1) {
      progressBar.className += ' bg-red-500';
    } else if (strength.score === 2) {
      progressBar.className += ' bg-yellow-500';
    } else if (strength.score === 3) {
      progressBar.className += ' bg-green-500';
    } else {
      progressBar.className += ' bg-green-600';
    }

    // Texto de feedback
    const feedbackText = document.createElement('p');
    feedbackText.className = 'text-xs mt-1';
    feedbackText.textContent = strength.feedback;

    // Definir cor do texto
    if (strength.score <= 1) {
      feedbackText.className += ' text-red-500';
    } else if (strength.score === 2) {
      feedbackText.className += ' text-yellow-500';
    } else {
      feedbackText.className += ' text-green-500';
    }

    // Adicionar elementos ao indicador
    indicator.appendChild(progressBar);
    indicator.appendChild(feedbackText);

    // Adicionar indicador após o input
    input.parentNode.appendChild(indicator);
  }

  // Função para calcular força da senha
  function calculatePasswordStrength(password) {
    // Critérios de força
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    // Calcular pontuação (0-4)
    let score = 0;
    if (hasLowerCase && hasUpperCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    if (isLongEnough) score++;

    // Feedback baseado na pontuação
    let feedback = '';
    if (score === 0) {
      feedback = 'Senha muito fraca';
    } else if (score === 1) {
      feedback = 'Senha fraca';
    } else if (score === 2) {
      feedback = 'Senha média';
    } else if (score === 3) {
      feedback = 'Senha forte';
    } else {
      feedback = 'Senha muito forte';
    }

    return { score, feedback };
  }
});
