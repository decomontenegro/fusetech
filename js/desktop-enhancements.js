/**
 * FUSEtech Desktop Enhancements
 * Funcionalidades específicas para desktop que melhoram a experiência do usuário
 */

class DesktopEnhancements {
  constructor() {
    this.sidebarOpen = false;
    this.searchModal = null;
    this.keyboardShortcuts = new Map();
    
    this.init();
  }

  init() {
    this.detectDesktop();
    this.setupSidebar();
    this.setupEnhancedSearch();
    this.setupKeyboardShortcuts();
    this.setupDataTables();
    this.setupContextMenus();
    this.setupTooltips();
  }

  /**
   * Detecta se está em desktop e aplica melhorias específicas
   */
  detectDesktop() {
    const isDesktop = window.innerWidth >= 1024;
    
    if (isDesktop) {
      document.body.classList.add('desktop-mode');
      this.enableDesktopFeatures();
    } else {
      document.body.classList.remove('desktop-mode');
      this.disableDesktopFeatures();
    }

    // Redetectar no resize
    window.addEventListener('resize', () => {
      this.detectDesktop();
    });
  }

  /**
   * Habilita funcionalidades específicas do desktop
   */
  enableDesktopFeatures() {
    // Adicionar sidebar toggle se não existir
    if (!document.querySelector('.desktop-sidebar-toggle')) {
      this.createSidebarToggle();
    }

    // Melhorar navegação com hover
    this.enhanceNavigation();
    
    // Adicionar atalhos de teclado
    this.enableKeyboardShortcuts();
  }

  /**
   * Desabilita funcionalidades específicas do desktop
   */
  disableDesktopFeatures() {
    // Remover sidebar se estiver aberta
    if (this.sidebarOpen) {
      this.closeSidebar();
    }

    // Desabilitar atalhos de teclado
    this.disableKeyboardShortcuts();
  }

  /**
   * Configura sidebar aprimorada para desktop
   */
  setupSidebar() {
    // Criar sidebar se não existir
    if (!document.querySelector('.desktop-sidebar')) {
      this.createSidebar();
    }

    // Configurar eventos
    const toggle = document.querySelector('.desktop-sidebar-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggleSidebar());
    }

    // Fechar sidebar ao clicar fora
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.desktop-sidebar');
      const toggle = document.querySelector('.desktop-sidebar-toggle');
      
      if (this.sidebarOpen && sidebar && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        this.closeSidebar();
      }
    });
  }

  /**
   * Cria o botão de toggle da sidebar
   */
  createSidebarToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'desktop-sidebar-toggle';
    toggle.innerHTML = '<i class="fas fa-bars"></i>';
    toggle.setAttribute('aria-label', 'Abrir menu lateral');
    
    document.body.appendChild(toggle);
  }

  /**
   * Cria a sidebar
   */
  createSidebar() {
    const sidebar = document.createElement('aside');
    sidebar.className = 'desktop-sidebar';
    
    sidebar.innerHTML = `
      <div class="desktop-sidebar-header">
        <div class="nav-brand">
          <div class="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mr-3">
            <i class="fas fa-bolt text-white"></i>
          </div>
          FUSEtech
        </div>
        <button class="btn-icon-only btn-ghost sidebar-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <nav class="desktop-sidebar-nav">
        <div class="desktop-sidebar-section">
          <div class="desktop-sidebar-section-title">Principal</div>
          <a href="index.html" class="desktop-sidebar-link active">
            <i class="fas fa-home"></i>
            Dashboard
          </a>
          <a href="atividades.html" class="desktop-sidebar-link">
            <i class="fas fa-running"></i>
            Atividades
          </a>
          <a href="achievements.html" class="desktop-sidebar-link">
            <i class="fas fa-trophy"></i>
            Conquistas
          </a>
          <a href="goals.html" class="desktop-sidebar-link">
            <i class="fas fa-bullseye"></i>
            Metas
          </a>
        </div>
        
        <div class="desktop-sidebar-section">
          <div class="desktop-sidebar-section-title">Comunidade</div>
          <a href="community.html" class="desktop-sidebar-link">
            <i class="fas fa-users"></i>
            Comunidade
          </a>
          <a href="marketplace.html" class="desktop-sidebar-link">
            <i class="fas fa-store"></i>
            Marketplace
          </a>
        </div>
        
        <div class="desktop-sidebar-section">
          <div class="desktop-sidebar-section-title">Análises</div>
          <a href="analytics.html" class="desktop-sidebar-link">
            <i class="fas fa-chart-bar"></i>
            Analytics
          </a>
          <a href="dispositivos.html" class="desktop-sidebar-link">
            <i class="fas fa-bluetooth"></i>
            Dispositivos
          </a>
        </div>
      </nav>
    `;
    
    document.body.appendChild(sidebar);
    
    // Configurar botão de fechar
    const closeBtn = sidebar.querySelector('.sidebar-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSidebar());
    }
  }

  /**
   * Alterna sidebar
   */
  toggleSidebar() {
    if (this.sidebarOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  /**
   * Abre sidebar
   */
  openSidebar() {
    const sidebar = document.querySelector('.desktop-sidebar');
    if (sidebar) {
      sidebar.classList.add('open');
      this.sidebarOpen = true;
      
      // Adicionar overlay
      this.createOverlay();
    }
  }

  /**
   * Fecha sidebar
   */
  closeSidebar() {
    const sidebar = document.querySelector('.desktop-sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
      this.sidebarOpen = false;
      
      // Remover overlay
      this.removeOverlay();
    }
  }

  /**
   * Cria overlay para sidebar
   */
  createOverlay() {
    if (!document.querySelector('.sidebar-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1199;
        opacity: 0;
        transition: opacity 0.25s ease;
      `;
      
      document.body.appendChild(overlay);
      
      // Fade in
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 10);
      
      // Fechar ao clicar
      overlay.addEventListener('click', () => this.closeSidebar());
    }
  }

  /**
   * Remove overlay
   */
  removeOverlay() {
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
      }, 250);
    }
  }

  /**
   * Configura busca aprimorada
   */
  setupEnhancedSearch() {
    // Adicionar campo de busca aprimorado se não existir
    const existingSearch = document.querySelector('.desktop-search');
    if (!existingSearch) {
      this.createEnhancedSearch();
    }
  }

  /**
   * Cria campo de busca aprimorado
   */
  createEnhancedSearch() {
    const header = document.querySelector('nav .max-w-7xl');
    if (header) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'desktop-search hidden lg:block';
      
      searchContainer.innerHTML = `
        <div class="relative">
          <i class="fas fa-search desktop-search-icon"></i>
          <input 
            type="text" 
            placeholder="Buscar atividades, conquistas..." 
            class="desktop-search-input"
            id="desktop-search-input"
          >
          <span class="desktop-search-shortcut">Ctrl+K</span>
        </div>
      `;
      
      // Inserir entre brand e user actions
      const userActions = header.querySelector('.flex.items-center.gap-4');
      if (userActions) {
        header.insertBefore(searchContainer, userActions);
      }
    }
  }

  /**
   * Configura atalhos de teclado
   */
  setupKeyboardShortcuts() {
    // Definir atalhos
    this.keyboardShortcuts.set('ctrl+k', () => this.focusSearch());
    this.keyboardShortcuts.set('ctrl+b', () => this.toggleSidebar());
    this.keyboardShortcuts.set('escape', () => this.handleEscape());
    
    // Configurar listener
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  /**
   * Habilita atalhos de teclado
   */
  enableKeyboardShortcuts() {
    this.keyboardShortcutsEnabled = true;
  }

  /**
   * Desabilita atalhos de teclado
   */
  disableKeyboardShortcuts() {
    this.keyboardShortcutsEnabled = false;
  }

  /**
   * Manipula eventos de teclado
   */
  handleKeydown(e) {
    if (!this.keyboardShortcutsEnabled) return;
    
    const key = this.getKeyCombo(e);
    const handler = this.keyboardShortcuts.get(key);
    
    if (handler) {
      e.preventDefault();
      handler();
    }
  }

  /**
   * Obtém combinação de teclas
   */
  getKeyCombo(e) {
    const parts = [];
    
    if (e.ctrlKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    
    parts.push(e.key.toLowerCase());
    
    return parts.join('+');
  }

  /**
   * Foca no campo de busca
   */
  focusSearch() {
    const searchInput = document.getElementById('desktop-search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }

  /**
   * Manipula tecla Escape
   */
  handleEscape() {
    if (this.sidebarOpen) {
      this.closeSidebar();
    }
    
    // Desfocar busca
    const searchInput = document.getElementById('desktop-search-input');
    if (searchInput && document.activeElement === searchInput) {
      searchInput.blur();
    }
  }

  /**
   * Melhora navegação com hover
   */
  enhanceNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .desktop-sidebar-link');
    
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateX(2px)';
      });
      
      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateX(0)';
      });
    });
  }

  /**
   * Configura tabelas de dados aprimoradas
   */
  setupDataTables() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      if (!table.classList.contains('desktop-table')) {
        table.classList.add('desktop-table');
      }
    });
  }

  /**
   * Configura menus de contexto
   */
  setupContextMenus() {
    // Implementar menus de contexto para cards e elementos interativos
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // Implementar menu de contexto personalizado
      });
    });
  }

  /**
   * Configura tooltips aprimorados
   */
  setupTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[title]');
    
    elementsWithTooltips.forEach(element => {
      // Implementar tooltips personalizados
    });
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.desktopEnhancements = new DesktopEnhancements();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesktopEnhancements;
}
