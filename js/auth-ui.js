// Funcionalidades de UI relacionadas à autenticação

// Atualizar a UI com base no estado de autenticação
function updateAuthUI() {
  // Verificar se o gerenciador de autenticação está disponível
  if (typeof authManager === 'undefined') {
    console.warn('Gerenciador de autenticação não encontrado');
    return;
  }
  
  const authButtons = document.getElementById('auth-buttons');
  const userProfile = document.getElementById('user-profile');
  
  if (!authButtons || !userProfile) {
    console.warn('Elementos de autenticação não encontrados');
    return;
  }
  
  if (authManager.isAuthenticated()) {
    // Usuário está logado
    authButtons.classList.add('hidden');
    userProfile.classList.remove('hidden');
    
    // Atualizar avatar do usuário
    const user = authManager.getCurrentUser();
    const userMenuButton = document.getElementById('user-menu-button');
    if (userMenuButton && user) {
      const avatarImg = userMenuButton.querySelector('img');
      if (avatarImg && user.avatar) {
        avatarImg.src = user.avatar;
        avatarImg.alt = user.name || 'Avatar do usuário';
      }
    }
  } else {
    // Usuário não está logado
    authButtons.classList.remove('hidden');
    userProfile.classList.add('hidden');
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos em uma página com elementos de autenticação
  const authButtons = document.getElementById('auth-buttons');
  const userProfile = document.getElementById('user-profile');
  
  if (authButtons || userProfile) {
    // Carregar o script de autenticação se ainda não estiver carregado
    if (typeof authManager === 'undefined') {
      const authScript = document.createElement('script');
      authScript.src = 'js/auth.js';
      authScript.onload = function() {
        // Atualizar UI após carregar o script
        updateAuthUI();
      };
      document.head.appendChild(authScript);
    } else {
      // Atualizar UI se o script já estiver carregado
      updateAuthUI();
    }
  }
});
