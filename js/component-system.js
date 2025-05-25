/**
 * Sistema de Componentes para FuseLabs
 * 
 * Este módulo implementa um sistema simples de componentes reutilizáveis
 * para melhorar a manutenção e organização do código.
 */

class ComponentSystem {
  constructor() {
    // Registro de componentes
    this.components = {};
    
    // Componentes instanciados
    this.instances = new Map();
    
    // Contador de IDs
    this.idCounter = 0;
    
    // Inicializar
    this.init();
  }
  
  /**
   * Inicializar o sistema de componentes
   */
  init() {
    // Observar o DOM para detectar novos componentes
    this.setupMutationObserver();
    
    // Inicializar componentes existentes
    this.initializeExistingComponents();
    
    console.log('Sistema de componentes inicializado');
  }
  
  /**
   * Configurar observador de mutações para detectar novos componentes
   */
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      let shouldScanForComponents = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldScanForComponents = true;
        }
      });
      
      if (shouldScanForComponents) {
        this.scanForComponents();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Inicializar componentes existentes no DOM
   */
  initializeExistingComponents() {
    this.scanForComponents();
  }
  
  /**
   * Escanear o DOM em busca de componentes
   */
  scanForComponents() {
    // Buscar elementos com atributo data-component
    const componentElements = document.querySelectorAll('[data-component]');
    
    componentElements.forEach(element => {
      // Verificar se o componente já foi inicializado
      if (element.hasAttribute('data-component-initialized')) {
        return;
      }
      
      const componentName = element.getAttribute('data-component');
      
      // Verificar se o componente está registrado
      if (this.components[componentName]) {
        this.initializeComponent(element, componentName);
      } else {
        // Tentar carregar o componente
        this.loadComponent(componentName)
          .then(() => {
            if (this.components[componentName]) {
              this.initializeComponent(element, componentName);
            } else {
              console.warn(`Componente "${componentName}" não encontrado após carregamento`);
            }
          })
          .catch(error => {
            console.error(`Erro ao carregar componente "${componentName}":`, error);
          });
      }
    });
  }
  
  /**
   * Carregar um componente
   * @param {String} componentName - Nome do componente
   * @returns {Promise} - Promessa resolvida quando o componente for carregado
   */
  async loadComponent(componentName) {
    try {
      // Verificar se o componente já está registrado
      if (this.components[componentName]) {
        return Promise.resolve();
      }
      
      // Carregar script do componente
      const scriptUrl = `js/components/${componentName}.js`;
      
      // Verificar se o script já está carregado
      const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
      if (existingScript) {
        return new Promise(resolve => {
          // Se o script já está carregado, mas o componente não está registrado,
          // provavelmente o script ainda está sendo processado
          const checkInterval = setInterval(() => {
            if (this.components[componentName]) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          
          // Timeout para evitar loop infinito
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 5000);
        });
      }
      
      // Carregar script
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        
        script.onload = () => {
          // Verificar se o componente foi registrado pelo script
          if (this.components[componentName]) {
            resolve();
          } else {
            // Se o script foi carregado, mas o componente não foi registrado,
            // pode ser que o script esteja usando um sistema de módulos
            // ou que o nome do componente seja diferente
            console.warn(`Script carregado, mas componente "${componentName}" não foi registrado`);
            resolve();
          }
        };
        
        script.onerror = () => {
          reject(new Error(`Não foi possível carregar o script do componente "${componentName}"`));
        };
        
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error(`Erro ao carregar componente "${componentName}":`, error);
      throw error;
    }
  }
  
  /**
   * Inicializar um componente
   * @param {HTMLElement} element - Elemento do componente
   * @param {String} componentName - Nome do componente
   */
  initializeComponent(element, componentName) {
    try {
      // Verificar se o componente já foi inicializado
      if (element.hasAttribute('data-component-initialized')) {
        return;
      }
      
      // Obter classe do componente
      const ComponentClass = this.components[componentName];
      
      if (!ComponentClass) {
        console.warn(`Componente "${componentName}" não está registrado`);
        return;
      }
      
      // Gerar ID único para o componente
      const instanceId = `component-${componentName}-${this.idCounter++}`;
      
      // Obter props do componente
      const props = this.getComponentProps(element);
      
      // Criar instância do componente
      const instance = new ComponentClass(element, props);
      
      // Armazenar instância
      this.instances.set(instanceId, instance);
      
      // Marcar elemento como inicializado
      element.setAttribute('data-component-initialized', 'true');
      element.setAttribute('data-component-id', instanceId);
      
      // Inicializar componente
      if (typeof instance.init === 'function') {
        instance.init();
      }
      
      // Renderizar componente
      if (typeof instance.render === 'function') {
        instance.render();
      }
      
      console.log(`Componente "${componentName}" inicializado`);
    } catch (error) {
      console.error(`Erro ao inicializar componente "${componentName}":`, error);
    }
  }
  
  /**
   * Obter props de um componente a partir dos atributos do elemento
   * @param {HTMLElement} element - Elemento do componente
   * @returns {Object} - Props do componente
   */
  getComponentProps(element) {
    const props = {};
    
    // Obter todos os atributos data-prop-*
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-prop-')) {
        const propName = attr.name.replace('data-prop-', '');
        let propValue = attr.value;
        
        // Tentar converter para tipo apropriado
        if (propValue === 'true') {
          propValue = true;
        } else if (propValue === 'false') {
          propValue = false;
        } else if (!isNaN(propValue) && propValue !== '') {
          propValue = Number(propValue);
        } else if (propValue.startsWith('{') && propValue.endsWith('}')) {
          try {
            propValue = JSON.parse(propValue);
          } catch (error) {
            console.warn(`Erro ao parsear prop JSON "${propName}":`, error);
          }
        }
        
        props[propName] = propValue;
      }
    });
    
    return props;
  }
  
  /**
   * Registrar um componente
   * @param {String} name - Nome do componente
   * @param {Class} ComponentClass - Classe do componente
   */
  register(name, ComponentClass) {
    if (this.components[name]) {
      console.warn(`Componente "${name}" já está registrado. Sobrescrevendo...`);
    }
    
    this.components[name] = ComponentClass;
    console.log(`Componente "${name}" registrado`);
    
    // Inicializar componentes existentes com este nome
    const elements = document.querySelectorAll(`[data-component="${name}"]:not([data-component-initialized])`);
    elements.forEach(element => {
      this.initializeComponent(element, name);
    });
  }
  
  /**
   * Obter uma instância de componente
   * @param {String|HTMLElement} elementOrId - Elemento ou ID do componente
   * @returns {Object|null} - Instância do componente ou null
   */
  getInstance(elementOrId) {
    if (typeof elementOrId === 'string') {
      // Se for um ID, buscar diretamente no Map
      return this.instances.get(elementOrId) || null;
    } else if (elementOrId instanceof HTMLElement) {
      // Se for um elemento, buscar pelo atributo data-component-id
      const instanceId = elementOrId.getAttribute('data-component-id');
      return instanceId ? this.instances.get(instanceId) : null;
    }
    
    return null;
  }
  
  /**
   * Destruir uma instância de componente
   * @param {String|HTMLElement} elementOrId - Elemento ou ID do componente
   * @returns {Boolean} - Verdadeiro se o componente foi destruído
   */
  destroyInstance(elementOrId) {
    const instance = this.getInstance(elementOrId);
    
    if (!instance) {
      return false;
    }
    
    // Obter ID da instância
    let instanceId;
    
    if (typeof elementOrId === 'string') {
      instanceId = elementOrId;
    } else if (elementOrId instanceof HTMLElement) {
      instanceId = elementOrId.getAttribute('data-component-id');
    }
    
    if (!instanceId) {
      return false;
    }
    
    // Chamar método de destruição, se existir
    if (typeof instance.destroy === 'function') {
      instance.destroy();
    }
    
    // Remover instância do registro
    this.instances.delete(instanceId);
    
    // Remover atributos do elemento
    if (elementOrId instanceof HTMLElement) {
      elementOrId.removeAttribute('data-component-initialized');
      elementOrId.removeAttribute('data-component-id');
    }
    
    return true;
  }
  
  /**
   * Criar um componente programaticamente
   * @param {String} componentName - Nome do componente
   * @param {Object} props - Props do componente
   * @param {HTMLElement} container - Elemento container (opcional)
   * @returns {HTMLElement|null} - Elemento do componente ou null
   */
  createComponent(componentName, props = {}, container = null) {
    try {
      // Verificar se o componente está registrado
      if (!this.components[componentName]) {
        console.warn(`Componente "${componentName}" não está registrado`);
        return null;
      }
      
      // Criar elemento
      const element = document.createElement('div');
      element.setAttribute('data-component', componentName);
      
      // Adicionar props como atributos
      Object.entries(props).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          if (value) {
            element.setAttribute(`data-prop-${key}`, 'true');
          }
        } else if (typeof value === 'object') {
          element.setAttribute(`data-prop-${key}`, JSON.stringify(value));
        } else {
          element.setAttribute(`data-prop-${key}`, value);
        }
      });
      
      // Adicionar ao container, se fornecido
      if (container) {
        container.appendChild(element);
      }
      
      // Inicializar componente
      this.initializeComponent(element, componentName);
      
      return element;
    } catch (error) {
      console.error(`Erro ao criar componente "${componentName}":`, error);
      return null;
    }
  }
}

// Criar instância global
window.componentSystem = new ComponentSystem();

/**
 * Classe base para componentes
 */
class Component {
  /**
   * Construtor do componente
   * @param {HTMLElement} element - Elemento do componente
   * @param {Object} props - Props do componente
   */
  constructor(element, props = {}) {
    this.element = element;
    this.props = props;
    this.state = {};
  }
  
  /**
   * Inicializar componente
   */
  init() {
    // Implementado pelas subclasses
  }
  
  /**
   * Renderizar componente
   */
  render() {
    // Implementado pelas subclasses
  }
  
  /**
   * Atualizar estado do componente
   * @param {Object} newState - Novo estado
   * @param {Boolean} shouldRender - Se deve renderizar após atualizar o estado
   */
  setState(newState, shouldRender = true) {
    this.state = { ...this.state, ...newState };
    
    if (shouldRender) {
      this.render();
    }
  }
  
  /**
   * Destruir componente
   */
  destroy() {
    // Implementado pelas subclasses
  }
}

// Exportar classe base
window.Component = Component;

/**
 * Registrar um componente
 * @param {String} name - Nome do componente
 * @param {Class} ComponentClass - Classe do componente
 */
window.registerComponent = function(name, ComponentClass) {
  window.componentSystem.register(name, ComponentClass);
};
