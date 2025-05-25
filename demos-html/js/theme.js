// Gerenciamento de tema (claro/escuro)

class ThemeManager {
  constructor() {
    this.darkMode = false;
    this.themeKey = 'fuselabs_theme';
    
    // Inicializar tema
    this.init();
  }
  
  init() {
    // Verificar preferência salva
    const savedTheme = localStorage.getItem(this.themeKey);
    
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    } else if (savedTheme === 'light') {
      this.enableLightMode();
    } else {
      // Verificar preferência do sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.enableDarkMode();
      } else {
        this.enableLightMode();
      }
      
      // Observar mudanças na preferência do sistema
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (e.matches) {
          this.enableDarkMode();
        } else {
          this.enableLightMode();
        }
      });
    }
    
    // Adicionar botão de alternância de tema
    this.addThemeToggle();
  }
  
  enableDarkMode() {
    document.documentElement.classList.add('dark');
    this.darkMode = true;
    localStorage.setItem(this.themeKey, 'dark');
    
    // Atualizar ícone do botão de tema
    this.updateThemeToggleIcon();
  }
  
  enableLightMode() {
    document.documentElement.classList.remove('dark');
    this.darkMode = false;
    localStorage.setItem(this.themeKey, 'light');
    
    // Atualizar ícone do botão de tema
    this.updateThemeToggleIcon();
  }
  
  toggleTheme() {
    if (this.darkMode) {
      this.enableLightMode();
    } else {
      this.enableDarkMode();
    }
  }
  
  addThemeToggle() {
    // Verificar se o botão já existe
    if (document.getElementById('theme-toggle')) return;
    
    // Criar botão de alternância de tema
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.className = 'p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200';
    themeToggle.setAttribute('aria-label', 'Alternar tema');
    themeToggle.innerHTML = this.darkMode ? 
      '<i class="fas fa-sun text-lg"></i>' : 
      '<i class="fas fa-moon text-lg"></i>';
    
    // Adicionar evento de clique
    themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Adicionar ao cabeçalho
    const headerButtons = document.querySelector('.flex.items-center');
    if (headerButtons) {
      headerButtons.insertBefore(themeToggle, headerButtons.firstChild);
    }
  }
  
  updateThemeToggleIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = this.darkMode ? 
        '<i class="fas fa-sun text-lg"></i>' : 
        '<i class="fas fa-moon text-lg"></i>';
    }
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  const themeManager = new ThemeManager();
  
  // Expor globalmente para uso em outros scripts
  window.themeManager = themeManager;
});
