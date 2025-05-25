/**
 * Serviço de carregamento de módulos para FuseLabs
 * 
 * Este módulo implementa code splitting e carregamento dinâmico
 * de módulos JavaScript para melhorar a performance da aplicação.
 */

class ModuleLoader {
  constructor() {
    // Módulos carregados
    this.loadedModules = new Map();
    
    // Dependências de módulos
    this.moduleDependencies = {
      'analytics': ['chart.js'],
      'activities': ['leaflet.js'],
      'challenges': ['confetti.js'],
      'profile': ['cropper.js'],
      'social': ['share-api.js'],
      'notifications': ['push-api.js']
    };
    
    // URLs de módulos externos
    this.externalModules = {
      'chart.js': 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js',
      'leaflet.js': 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
      'confetti.js': 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.4.0/dist/confetti.browser.min.js',
      'cropper.js': 'https://cdn.jsdelivr.net/npm/cropperjs@1.5.12/dist/cropper.min.js',
      'share-api.js': 'js/vendor/share-api.js',
      'push-api.js': 'js/vendor/push-api.js'
    };
    
    // Inicializar
    this.init();
  }
  
  /**
   * Inicializar o serviço de carregamento de módulos
   */
  init() {
    // Detectar módulos necessários para a página atual
    this.detectRequiredModules();
    
    console.log('Serviço de carregamento de módulos inicializado');
  }
  
  /**
   * Detectar módulos necessários para a página atual
   */
  detectRequiredModules() {
    // Obter atributo data-page do body
    const pageType = document.body.getAttribute('data-page');
    
    if (!pageType) {
      console.log('Tipo de página não definido');
      return;
    }
    
    // Carregar módulo principal da página
    this.loadModule(pageType);
    
    // Carregar módulos comuns
    this.loadModule('common');
    
    // Verificar elementos com atributo data-module
    const moduleElements = document.querySelectorAll('[data-module]');
    
    moduleElements.forEach(element => {
      const moduleName = element.getAttribute('data-module');
      
      // Configurar carregamento sob demanda
      if (element.hasAttribute('data-module-lazy')) {
        // Criar Intersection Observer para carregar o módulo quando visível
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadModule(moduleName);
              observer.unobserve(element);
            }
          });
        }, {
          root: null,
          rootMargin: '100px',
          threshold: 0.01
        });
        
        observer.observe(element);
      } else {
        // Carregar módulo imediatamente
        this.loadModule(moduleName);
      }
    });
  }
  
  /**
   * Carregar módulo
   * @param {String} moduleName - Nome do módulo
   * @returns {Promise} - Promessa resolvida quando o módulo for carregado
   */
  loadModule(moduleName) {
    // Verificar se o módulo já foi carregado
    if (this.loadedModules.has(moduleName)) {
      return Promise.resolve(this.loadedModules.get(moduleName));
    }
    
    // Criar promessa para carregamento do módulo
    const modulePromise = new Promise(async (resolve, reject) => {
      try {
        // Carregar dependências primeiro
        await this.loadDependencies(moduleName);
        
        // Carregar o módulo
        const moduleUrl = `js/modules/${moduleName}.js`;
        
        // Criar script
        const script = document.createElement('script');
        script.src = moduleUrl;
        script.type = 'module';
        
        script.onload = () => {
          console.log(`Módulo carregado: ${moduleName}`);
          resolve(true);
          
          // Disparar evento de módulo carregado
          const event = new CustomEvent('moduleLoaded', {
            detail: { moduleName }
          });
          document.dispatchEvent(event);
        };
        
        script.onerror = (error) => {
          console.error(`Erro ao carregar módulo ${moduleName}:`, error);
          reject(error);
        };
        
        // Adicionar script ao documento
        document.head.appendChild(script);
      } catch (error) {
        console.error(`Erro ao carregar dependências para ${moduleName}:`, error);
        reject(error);
      }
    });
    
    // Armazenar promessa
    this.loadedModules.set(moduleName, modulePromise);
    
    return modulePromise;
  }
  
  /**
   * Carregar dependências de um módulo
   * @param {String} moduleName - Nome do módulo
   * @returns {Promise} - Promessa resolvida quando todas as dependências forem carregadas
   */
  async loadDependencies(moduleName) {
    // Verificar se o módulo tem dependências
    const dependencies = this.moduleDependencies[moduleName] || [];
    
    if (dependencies.length === 0) {
      return Promise.resolve();
    }
    
    // Carregar cada dependência
    const promises = dependencies.map(dependency => this.loadExternalModule(dependency));
    
    return Promise.all(promises);
  }
  
  /**
   * Carregar módulo externo
   * @param {String} moduleName - Nome do módulo
   * @returns {Promise} - Promessa resolvida quando o módulo for carregado
   */
  loadExternalModule(moduleName) {
    // Verificar se o módulo já foi carregado
    if (this.loadedModules.has(moduleName)) {
      return Promise.resolve(this.loadedModules.get(moduleName));
    }
    
    // Obter URL do módulo
    const moduleUrl = this.externalModules[moduleName];
    
    if (!moduleUrl) {
      return Promise.reject(new Error(`URL não encontrada para módulo externo: ${moduleName}`));
    }
    
    // Criar promessa para carregamento do módulo
    const modulePromise = new Promise((resolve, reject) => {
      // Criar script
      const script = document.createElement('script');
      script.src = moduleUrl;
      
      script.onload = () => {
        console.log(`Módulo externo carregado: ${moduleName}`);
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error(`Erro ao carregar módulo externo ${moduleName}:`, error);
        reject(error);
      };
      
      // Adicionar script ao documento
      document.head.appendChild(script);
    });
    
    // Armazenar promessa
    this.loadedModules.set(moduleName, modulePromise);
    
    return modulePromise;
  }
  
  /**
   * Carregar módulo manualmente
   * @param {String} moduleName - Nome do módulo
   * @returns {Promise} - Promessa resolvida quando o módulo for carregado
   */
  loadModuleManually(moduleName) {
    return this.loadModule(moduleName);
  }
  
  /**
   * Verificar se um módulo está carregado
   * @param {String} moduleName - Nome do módulo
   * @returns {Boolean} - Verdadeiro se o módulo estiver carregado
   */
  isModuleLoaded(moduleName) {
    return this.loadedModules.has(moduleName) && this.loadedModules.get(moduleName) === true;
  }
  
  /**
   * Obter lista de módulos carregados
   * @returns {Array} - Lista de nomes de módulos carregados
   */
  getLoadedModules() {
    return Array.from(this.loadedModules.keys());
  }
}

// Criar instância global
const moduleLoader = new ModuleLoader();
