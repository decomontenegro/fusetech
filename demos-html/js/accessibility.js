/**
 * Serviço de acessibilidade para FuseLabs
 * 
 * Este módulo gerencia recursos de acessibilidade como navegação por teclado,
 * suporte a leitores de tela, modo de alto contraste e outras melhorias.
 */

class AccessibilityService {
  constructor() {
    // Configurações de acessibilidade
    this.settings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      keyboardNavigation: true,
      screenReader: false,
      focusIndicators: true
    };
    
    // Elementos com foco
    this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Mapeamento de atalhos de teclado
    this.keyboardShortcuts = {
      'Alt+1': { description: 'Ir para a página inicial', action: () => this.navigateTo('index_modular.html') },
      'Alt+2': { description: 'Ir para atividades', action: () => this.navigateTo('atividades.html') },
      'Alt+3': { description: 'Ir para desafios', action: () => this.navigateTo('desafios.html') },
      'Alt+4': { description: 'Ir para comunidade', action: () => this.navigateTo('comunidade.html') },
      'Alt+5': { description: 'Ir para análises', action: () => this.navigateTo('analytics.html') },
      'Alt+6': { description: 'Ir para conquistas', action: () => this.navigateTo('conquistas.html') },
      'Alt+7': { description: 'Ir para perfil', action: () => this.navigateTo('perfil.html') },
      'Alt+h': { description: 'Abrir menu de ajuda', action: () => this.toggleHelpMenu() },
      'Alt+c': { description: 'Alternar modo de alto contraste', action: () => this.toggleHighContrast() },
      'Alt+t': { description: 'Alternar tamanho do texto', action: () => this.toggleLargeText() },
      'Alt+m': { description: 'Alternar redução de movimento', action: () => this.toggleReducedMotion() },
      'Alt+s': { description: 'Ir para o conteúdo principal', action: () => this.skipToContent() }
    };
    
    // Inicializar
    this.init();
  }
  
  /**
   * Inicializar o serviço de acessibilidade
   */
  init() {
    // Carregar configurações salvas
    this.loadSettings();
    
    // Aplicar configurações
    this.applySettings();
    
    // Configurar navegação por teclado
    this.setupKeyboardNavigation();
    
    // Configurar suporte a leitores de tela
    this.setupScreenReaderSupport();
    
    // Adicionar link para pular para o conteúdo
    this.addSkipToContentLink();
    
    // Adicionar botão de acessibilidade
    this.addAccessibilityButton();
    
    console.log('Serviço de acessibilidade inicializado');
  }
  
  /**
   * Carregar configurações salvas
   */
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('accessibility_settings');
      
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      } else {
        // Verificar preferências do sistema
        this.detectSystemPreferences();
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de acessibilidade:', error);
    }
  }
  
  /**
   * Detectar preferências do sistema
   */
  detectSystemPreferences() {
    // Verificar preferência de redução de movimento
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.settings.reducedMotion = true;
    }
    
    // Verificar preferência de esquema de cores
    if (window.matchMedia('(prefers-contrast: more)').matches) {
      this.settings.highContrast = true;
    }
  }
  
  /**
   * Salvar configurações
   */
  saveSettings() {
    try {
      localStorage.setItem('accessibility_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Erro ao salvar configurações de acessibilidade:', error);
    }
  }
  
  /**
   * Aplicar configurações
   */
  applySettings() {
    // Aplicar modo de alto contraste
    if (this.settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Aplicar texto grande
    if (this.settings.largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
    
    // Aplicar redução de movimento
    if (this.settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    // Aplicar indicadores de foco
    if (this.settings.focusIndicators) {
      document.body.classList.add('focus-visible');
    } else {
      document.body.classList.remove('focus-visible');
    }
  }
  
  /**
   * Configurar navegação por teclado
   */
  setupKeyboardNavigation() {
    // Adicionar listener para atalhos de teclado
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Melhorar visibilidade do foco
    this.enhanceFocusVisibility();
    
    // Adicionar atributos de acessibilidade a elementos interativos
    this.enhanceInteractiveElements();
  }
  
  /**
   * Manipular eventos de teclado
   * @param {KeyboardEvent} event - Evento de teclado
   */
  handleKeyDown(event) {
    // Verificar se a navegação por teclado está ativada
    if (!this.settings.keyboardNavigation) return;
    
    // Verificar atalhos de teclado
    const key = `${event.altKey ? 'Alt+' : ''}${event.key.toLowerCase()}`;
    
    if (this.keyboardShortcuts[key]) {
      event.preventDefault();
      this.keyboardShortcuts[key].action();
    }
    
    // Navegação por Tab
    if (event.key === 'Tab') {
      // Adicionar classe para destacar o elemento com foco
      setTimeout(() => {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement !== document.body) {
          focusedElement.classList.add('keyboard-focus');
        }
      }, 10);
    }
  }
  
  /**
   * Melhorar visibilidade do foco
   */
  enhanceFocusVisibility() {
    // Adicionar estilos para melhorar a visibilidade do foco
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-focus {
        outline: 3px solid #4f46e5 !important;
        outline-offset: 2px !important;
      }
      
      .high-contrast {
        --color-primary: #0000ff;
        --color-primary-light: #6666ff;
        --color-text: #000000;
        --color-background: #ffffff;
        --color-border: #000000;
        color: var(--color-text) !important;
        background-color: var(--color-background) !important;
      }
      
      .high-contrast a, .high-contrast button {
        color: var(--color-primary) !important;
      }
      
      .large-text {
        font-size: 120% !important;
        line-height: 1.5 !important;
      }
      
      .reduced-motion *, .reduced-motion *::before, .reduced-motion *::after {
        animation-duration: 0.001s !important;
        transition-duration: 0.001s !important;
      }
      
      .skip-to-content {
        position: absolute;
        top: -40px;
        left: 0;
        background: #4f46e5;
        color: white;
        padding: 8px;
        z-index: 100;
        transition: top 0.3s;
      }
      
      .skip-to-content:focus {
        top: 0;
      }
    `;
    
    document.head.appendChild(style);
    
    // Remover classe de foco ao clicar
    document.addEventListener('mousedown', () => {
      const focusedElement = document.querySelector('.keyboard-focus');
      if (focusedElement) {
        focusedElement.classList.remove('keyboard-focus');
      }
    });
  }
  
  /**
   * Melhorar elementos interativos
   */
  enhanceInteractiveElements() {
    // Adicionar atributos de acessibilidade a elementos interativos
    const interactiveElements = document.querySelectorAll(this.focusableElements);
    
    interactiveElements.forEach(element => {
      // Verificar se o elemento já tem um papel ARIA
      if (!element.hasAttribute('role')) {
        // Adicionar papel ARIA apropriado
        if (element.tagName === 'A' && !element.hasAttribute('href')) {
          element.setAttribute('role', 'button');
        } else if (element.tagName === 'BUTTON' && element.type !== 'button') {
          element.setAttribute('type', 'button');
        }
      }
      
      // Verificar se o elemento tem um rótulo acessível
      if (!this.hasAccessibleName(element)) {
        // Tentar encontrar um rótulo
        const nearestText = this.findNearestText(element);
        
        if (nearestText) {
          element.setAttribute('aria-label', nearestText);
        }
      }
    });
    
    // Observar mudanças no DOM para melhorar novos elementos
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Verificar se o elemento é interativo
            if (node.matches(this.focusableElements)) {
              this.enhanceInteractiveElement(node);
            }
            
            // Verificar filhos
            const interactiveChildren = node.querySelectorAll(this.focusableElements);
            interactiveChildren.forEach(child => {
              this.enhanceInteractiveElement(child);
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Melhorar elemento interativo
   * @param {HTMLElement} element - Elemento a ser melhorado
   */
  enhanceInteractiveElement(element) {
    // Verificar se o elemento já tem um papel ARIA
    if (!element.hasAttribute('role')) {
      // Adicionar papel ARIA apropriado
      if (element.tagName === 'A' && !element.hasAttribute('href')) {
        element.setAttribute('role', 'button');
      } else if (element.tagName === 'BUTTON' && element.type !== 'button') {
        element.setAttribute('type', 'button');
      }
    }
    
    // Verificar se o elemento tem um rótulo acessível
    if (!this.hasAccessibleName(element)) {
      // Tentar encontrar um rótulo
      const nearestText = this.findNearestText(element);
      
      if (nearestText) {
        element.setAttribute('aria-label', nearestText);
      }
    }
  }
  
  /**
   * Verificar se um elemento tem um nome acessível
   * @param {HTMLElement} element - Elemento a ser verificado
   * @returns {Boolean} - Verdadeiro se o elemento tiver um nome acessível
   */
  hasAccessibleName(element) {
    return element.hasAttribute('aria-label') || 
           element.hasAttribute('aria-labelledby') || 
           element.hasAttribute('title') || 
           (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) ||
           (element.tagName === 'INPUT' && element.hasAttribute('value') && ['submit', 'button'].includes(element.type)) ||
           element.textContent.trim() !== '';
  }
  
  /**
   * Encontrar texto mais próximo de um elemento
   * @param {HTMLElement} element - Elemento a ser verificado
   * @returns {String|null} - Texto encontrado ou null
   */
  findNearestText(element) {
    // Verificar texto do próprio elemento
    const ownText = element.textContent.trim();
    if (ownText) return ownText;
    
    // Verificar elementos filhos
    const childText = Array.from(element.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim())
      .filter(text => text)
      .join(' ');
    
    if (childText) return childText;
    
    // Verificar ícones Font Awesome
    const icon = element.querySelector('i[class*="fa-"]');
    if (icon) {
      const iconClass = Array.from(icon.classList)
        .find(cls => cls.startsWith('fa-') && cls !== 'fa-solid' && cls !== 'fa-regular' && cls !== 'fa-brands');
      
      if (iconClass) {
        return iconClass.replace('fa-', '').replace(/-/g, ' ');
      }
    }
    
    return null;
  }
  
  /**
   * Configurar suporte a leitores de tela
   */
  setupScreenReaderSupport() {
    // Adicionar descrições a elementos que precisam de contexto adicional
    this.addContextualDescriptions();
    
    // Melhorar anúncios de mudanças dinâmicas
    this.setupLiveRegions();
  }
  
  /**
   * Adicionar descrições contextuais
   */
  addContextualDescriptions() {
    // Adicionar descrições a gráficos
    const charts = document.querySelectorAll('.chart-container');
    
    charts.forEach(chart => {
      // Verificar se já tem um atributo aria-label
      if (!chart.hasAttribute('aria-label') && !chart.hasAttribute('aria-labelledby')) {
        // Tentar encontrar um título para o gráfico
        const chartTitle = this.findChartTitle(chart);
        
        if (chartTitle) {
          chart.setAttribute('aria-label', `Gráfico: ${chartTitle}`);
        } else {
          chart.setAttribute('aria-label', 'Gráfico de dados');
        }
      }
    });
    
    // Adicionar descrições a ícones
    const icons = document.querySelectorAll('i[class*="fa-"]');
    
    icons.forEach(icon => {
      // Verificar se o ícone está dentro de um botão ou link com texto
      const parent = icon.closest('button, a');
      
      if (parent && parent.textContent.trim() !== icon.textContent.trim()) {
        // O ícone está dentro de um elemento com texto, não precisa de descrição
        icon.setAttribute('aria-hidden', 'true');
      } else if (parent) {
        // O ícone é o único conteúdo do elemento pai
        const iconName = this.getIconName(icon);
        
        if (iconName && !parent.hasAttribute('aria-label')) {
          parent.setAttribute('aria-label', iconName);
        }
      }
    });
  }
  
  /**
   * Encontrar título de um gráfico
   * @param {HTMLElement} chartElement - Elemento do gráfico
   * @returns {String|null} - Título encontrado ou null
   */
  findChartTitle(chartElement) {
    // Verificar elementos anteriores
    let element = chartElement.previousElementSibling;
    
    while (element && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].indexOf(element.tagName) === -1) {
      element = element.previousElementSibling;
    }
    
    if (element) {
      return element.textContent.trim();
    }
    
    // Verificar elementos pais
    const parentHeading = chartElement.closest('div, section').querySelector('h1, h2, h3, h4, h5, h6');
    
    if (parentHeading) {
      return parentHeading.textContent.trim();
    }
    
    return null;
  }
  
  /**
   * Obter nome de um ícone
   * @param {HTMLElement} iconElement - Elemento do ícone
   * @returns {String|null} - Nome do ícone ou null
   */
  getIconName(iconElement) {
    const iconClass = Array.from(iconElement.classList)
      .find(cls => cls.startsWith('fa-') && cls !== 'fa-solid' && cls !== 'fa-regular' && cls !== 'fa-brands');
    
    if (iconClass) {
      return iconClass.replace('fa-', '').replace(/-/g, ' ');
    }
    
    return null;
  }
  
  /**
   * Configurar regiões ao vivo para anúncios dinâmicos
   */
  setupLiveRegions() {
    // Criar região ao vivo para notificações
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-announcer';
    
    document.body.appendChild(liveRegion);
    
    // Expor método para anunciar mensagens
    window.announce = (message, priority = 'polite') => {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = '';
      
      // Pequeno atraso para garantir que a mudança seja anunciada
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 50);
    };
  }
  
  /**
   * Adicionar link para pular para o conteúdo
   */
  addSkipToContentLink() {
    // Criar link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Pular para o conteúdo principal';
    
    // Adicionar ao início do body
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Adicionar ID ao conteúdo principal
    const mainContent = document.querySelector('main');
    
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }
  
  /**
   * Adicionar botão de acessibilidade
   */
  addAccessibilityButton() {
    // Criar botão
    const button = document.createElement('button');
    button.className = 'accessibility-button fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg z-50';
    button.setAttribute('aria-label', 'Opções de acessibilidade');
    button.innerHTML = '<i class="fas fa-universal-access text-xl"></i>';
    
    // Adicionar evento de clique
    button.addEventListener('click', () => {
      this.showAccessibilityMenu();
    });
    
    // Adicionar ao body
    document.body.appendChild(button);
  }
  
  /**
   * Mostrar menu de acessibilidade
   */
  showAccessibilityMenu() {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    
    // Criar menu
    const menu = document.createElement('div');
    menu.className = 'bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4';
    menu.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium text-gray-900">Opções de Acessibilidade</h2>
        <button id="close-accessibility-menu" class="text-gray-400 hover:text-gray-500 focus:outline-none">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <label for="high-contrast" class="text-sm font-medium text-gray-700">Modo de alto contraste</label>
          <div class="relative inline-block w-10 mr-2 align-middle select-none">
            <input type="checkbox" id="high-contrast" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.settings.highContrast ? 'checked' : ''}>
            <label for="high-contrast" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <label for="large-text" class="text-sm font-medium text-gray-700">Texto grande</label>
          <div class="relative inline-block w-10 mr-2 align-middle select-none">
            <input type="checkbox" id="large-text" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.settings.largeText ? 'checked' : ''}>
            <label for="large-text" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <label for="reduced-motion" class="text-sm font-medium text-gray-700">Reduzir movimento</label>
          <div class="relative inline-block w-10 mr-2 align-middle select-none">
            <input type="checkbox" id="reduced-motion" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.settings.reducedMotion ? 'checked' : ''}>
            <label for="reduced-motion" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <label for="keyboard-navigation" class="text-sm font-medium text-gray-700">Navegação por teclado</label>
          <div class="relative inline-block w-10 mr-2 align-middle select-none">
            <input type="checkbox" id="keyboard-navigation" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.settings.keyboardNavigation ? 'checked' : ''}>
            <label for="keyboard-navigation" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <label for="focus-indicators" class="text-sm font-medium text-gray-700">Indicadores de foco</label>
          <div class="relative inline-block w-10 mr-2 align-middle select-none">
            <input type="checkbox" id="focus-indicators" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.settings.focusIndicators ? 'checked' : ''}>
            <label for="focus-indicators" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
      </div>
      
      <div class="mt-6">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Atalhos de teclado</h3>
        <ul class="text-xs text-gray-500 space-y-1">
          <li><kbd>Alt+1</kbd>: Ir para a página inicial</li>
          <li><kbd>Alt+2</kbd>: Ir para atividades</li>
          <li><kbd>Alt+3</kbd>: Ir para desafios</li>
          <li><kbd>Alt+4</kbd>: Ir para comunidade</li>
          <li><kbd>Alt+5</kbd>: Ir para análises</li>
          <li><kbd>Alt+6</kbd>: Ir para conquistas</li>
          <li><kbd>Alt+7</kbd>: Ir para perfil</li>
          <li><kbd>Alt+h</kbd>: Abrir menu de ajuda</li>
          <li><kbd>Alt+c</kbd>: Alternar modo de alto contraste</li>
          <li><kbd>Alt+t</kbd>: Alternar tamanho do texto</li>
          <li><kbd>Alt+m</kbd>: Alternar redução de movimento</li>
          <li><kbd>Alt+s</kbd>: Ir para o conteúdo principal</li>
        </ul>
      </div>
    `;
    
    // Adicionar menu ao overlay
    overlay.appendChild(menu);
    
    // Adicionar overlay ao body
    document.body.appendChild(overlay);
    
    // Configurar eventos
    document.getElementById('close-accessibility-menu').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    document.getElementById('high-contrast').addEventListener('change', (event) => {
      this.settings.highContrast = event.target.checked;
      this.applySettings();
      this.saveSettings();
    });
    
    document.getElementById('large-text').addEventListener('change', (event) => {
      this.settings.largeText = event.target.checked;
      this.applySettings();
      this.saveSettings();
    });
    
    document.getElementById('reduced-motion').addEventListener('change', (event) => {
      this.settings.reducedMotion = event.target.checked;
      this.applySettings();
      this.saveSettings();
    });
    
    document.getElementById('keyboard-navigation').addEventListener('change', (event) => {
      this.settings.keyboardNavigation = event.target.checked;
      this.saveSettings();
    });
    
    document.getElementById('focus-indicators').addEventListener('change', (event) => {
      this.settings.focusIndicators = event.target.checked;
      this.applySettings();
      this.saveSettings();
    });
    
    // Fechar ao clicar fora do menu
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
    
    // Adicionar estilos para o toggle
    const style = document.createElement('style');
    style.textContent = `
      .toggle-checkbox:checked {
        right: 0;
        border-color: #4f46e5;
      }
      .toggle-checkbox:checked + .toggle-label {
        background-color: #4f46e5;
      }
      .toggle-label {
        transition: background-color 0.3s ease;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Alternar modo de alto contraste
   */
  toggleHighContrast() {
    this.settings.highContrast = !this.settings.highContrast;
    this.applySettings();
    this.saveSettings();
    
    // Anunciar mudança
    if (window.announce) {
      window.announce(`Modo de alto contraste ${this.settings.highContrast ? 'ativado' : 'desativado'}`);
    }
  }
  
  /**
   * Alternar tamanho do texto
   */
  toggleLargeText() {
    this.settings.largeText = !this.settings.largeText;
    this.applySettings();
    this.saveSettings();
    
    // Anunciar mudança
    if (window.announce) {
      window.announce(`Texto grande ${this.settings.largeText ? 'ativado' : 'desativado'}`);
    }
  }
  
  /**
   * Alternar redução de movimento
   */
  toggleReducedMotion() {
    this.settings.reducedMotion = !this.settings.reducedMotion;
    this.applySettings();
    this.saveSettings();
    
    // Anunciar mudança
    if (window.announce) {
      window.announce(`Redução de movimento ${this.settings.reducedMotion ? 'ativada' : 'desativada'}`);
    }
  }
  
  /**
   * Alternar menu de ajuda
   */
  toggleHelpMenu() {
    // Implementar menu de ajuda
    console.log('Alternando menu de ajuda');
  }
  
  /**
   * Pular para o conteúdo principal
   */
  skipToContent() {
    const mainContent = document.getElementById('main-content');
    
    if (mainContent) {
      mainContent.tabIndex = -1;
      mainContent.focus();
    }
  }
  
  /**
   * Navegar para uma página
   * @param {String} url - URL da página
   */
  navigateTo(url) {
    window.location.href = url;
  }
}

// Criar instância global
const accessibility = new AccessibilityService();
