// Funcionalidades para o menu mobile

class MobileMenuManager {
  constructor() {
    // Elementos do DOM
    this.mobileMenuButton = document.getElementById('mobile-menu-button');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileAuthButtons = document.getElementById('mobile-auth-buttons');
    this.mobileUserProfile = document.getElementById('mobile-user-profile');
    this.mobileLogoutButton = document.getElementById('mobile-logout-button');
    this.mobileUserName = document.getElementById('mobile-user-name');
    this.mobileUserEmail = document.getElementById('mobile-user-email');
    this.mobileUserAvatar = document.getElementById('mobile-user-avatar');
    
    // Estado
    this.isOpen = false;
    this.isAuthenticated = false;
    
    // Inicializar
    this.init();
  }
  
  // Inicializar o gerenciador de menu mobile
  init() {
    if (!this.mobileMenuButton || !this.mobileMenu) {
      console.warn('Elementos de menu mobile não encontrados');
      return;
    }
    
    // Configurar evento de clique no botão de menu mobile
    this.mobileMenuButton.addEventListener('click', () => {
      this.toggleMenu();
    });
    
    // Fechar o menu ao clicar fora dele
    document.addEventListener('click', (event) => {
      if (this.isOpen && 
          !this.mobileMenu.contains(event.target) && 
          event.target !== this.mobileMenuButton &&
          !this.mobileMenuButton.contains(event.target)) {
        this.closeMenu();
      }
    });
    
    // Configurar botão de logout
    if (this.mobileLogoutButton) {
      this.mobileLogoutButton.addEventListener('click', () => {
        this.logout();
      });
    }
    
    // Verificar estado de autenticação
    this.checkAuthState();
    
    // Atualizar links ativos
    this.updateActiveLinks();
  }
  
  // Alternar exibição do menu
  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  // Abrir o menu
  openMenu() {
    this.mobileMenu.classList.remove('hidden');
    this.mobileMenuButton.setAttribute('aria-expanded', 'true');
    this.isOpen = true;
  }
  
  // Fechar o menu
  closeMenu() {
    this.mobileMenu.classList.add('hidden');
    this.mobileMenuButton.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
  }
  
  // Verificar estado de autenticação
  checkAuthState() {
    // Em um ambiente real, isso seria uma verificação de token JWT
    // Para fins de demonstração, usamos localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.isAuthenticated = !!user;
    
    if (this.isAuthenticated && user) {
      // Atualizar UI para usuário autenticado
      if (this.mobileAuthButtons) this.mobileAuthButtons.classList.add('hidden');
      if (this.mobileUserProfile) this.mobileUserProfile.classList.remove('hidden');
      
      // Atualizar informações do usuário
      if (this.mobileUserName) this.mobileUserName.textContent = user.name || 'Usuário';
      if (this.mobileUserEmail) this.mobileUserEmail.textContent = user.email || 'usuario@exemplo.com';
      if (this.mobileUserAvatar && user.avatar) this.mobileUserAvatar.src = user.avatar;
    } else {
      // Atualizar UI para usuário não autenticado
      if (this.mobileAuthButtons) this.mobileAuthButtons.classList.remove('hidden');
      if (this.mobileUserProfile) this.mobileUserProfile.classList.add('hidden');
    }
  }
  
  // Atualizar links ativos com base na página atual
  updateActiveLinks() {
    const currentPage = document.body.getAttribute('data-page') || '';
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    mobileNavLinks.forEach(link => {
      const linkPage = link.getAttribute('data-page') || '';
      
      // Remover classes ativas de todos os links
      link.classList.remove('bg-primary-light', 'text-primary');
      link.classList.add('text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900');
      
      // Adicionar classes ativas ao link da página atual
      if (linkPage === currentPage) {
        link.classList.remove('text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900');
        link.classList.add('bg-primary-light', 'text-primary');
      }
    });
  }
  
  // Fazer logout
  logout() {
    // Em um ambiente real, isso seria uma chamada de API
    // Para fins de demonstração, apenas limpamos o localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Atualizar estado e UI
    this.isAuthenticated = false;
    this.checkAuthState();
    
    // Redirecionar para a página de login
    window.location.href = 'login.html';
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar gerenciador de menu mobile
  const mobileMenuManager = new MobileMenuManager();
});
