/**
 * Serviço de Lazy Loading para FuseLabs
 * 
 * Este módulo gerencia o carregamento sob demanda de componentes,
 * scripts e recursos para melhorar a performance da aplicação.
 */

class LazyLoader {
  constructor() {
    // Componentes carregados
    this.loadedComponents = new Set();
    
    // Scripts carregados
    this.loadedScripts = new Set();
    
    // Imagens observadas
    this.observedImages = new Set();
    
    // Componentes observados
    this.observedComponents = new Set();
    
    // Intersection Observer para lazy loading
    this.observer = null;
    
    // Inicializar
    this.init();
  }
  
  /**
   * Inicializar o serviço de lazy loading
   */
  init() {
    // Criar Intersection Observer
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
      root: null,
      rootMargin: '100px',
      threshold: 0.01
    });
    
    // Configurar lazy loading de imagens
    this.setupImageLazyLoading();
    
    // Configurar lazy loading de componentes
    this.setupComponentLazyLoading();
    
    console.log('Serviço de lazy loading inicializado');
  }
  
  /**
   * Configurar lazy loading de imagens
   */
  setupImageLazyLoading() {
    // Selecionar todas as imagens com atributo data-src
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // Observar cada imagem
    lazyImages.forEach(image => {
      this.observedImages.add(image);
      this.observer.observe(image);
    });
    
    // Observar novas imagens adicionadas ao DOM
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          // Verificar se é um elemento
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Verificar se é uma imagem com data-src
            if (node.tagName === 'IMG' && node.hasAttribute('data-src')) {
              this.observedImages.add(node);
              this.observer.observe(node);
            }
            
            // Verificar filhos
            const lazyImagesInNode = node.querySelectorAll('img[data-src]');
            lazyImagesInNode.forEach(image => {
              this.observedImages.add(image);
              this.observer.observe(image);
            });
          }
        });
      });
    });
    
    // Observar mudanças no DOM
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Configurar lazy loading de componentes
   */
  setupComponentLazyLoading() {
    // Selecionar todos os componentes com atributo data-lazy-component
    const lazyComponents = document.querySelectorAll('[data-lazy-component]');
    
    // Observar cada componente
    lazyComponents.forEach(component => {
      this.observedComponents.add(component);
      this.observer.observe(component);
    });
    
    // Observar novos componentes adicionados ao DOM
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          // Verificar se é um elemento
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Verificar se é um componente com data-lazy-component
            if (node.hasAttribute('data-lazy-component')) {
              this.observedComponents.add(node);
              this.observer.observe(node);
            }
            
            // Verificar filhos
            const lazyComponentsInNode = node.querySelectorAll('[data-lazy-component]');
            lazyComponentsInNode.forEach(component => {
              this.observedComponents.add(component);
              this.observer.observe(component);
            });
          }
        });
      });
    });
    
    // Observar mudanças no DOM
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Manipular interseção de elementos observados
   * @param {Array} entries - Entradas de interseção
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Verificar se é uma imagem
        if (element.tagName === 'IMG' && element.hasAttribute('data-src')) {
          this.loadImage(element);
        }
        
        // Verificar se é um componente
        if (element.hasAttribute('data-lazy-component')) {
          this.loadComponent(element);
        }
        
        // Parar de observar o elemento
        this.observer.unobserve(element);
      }
    });
  }
  
  /**
   * Carregar imagem
   * @param {HTMLImageElement} image - Elemento de imagem
   */
  loadImage(image) {
    // Obter URL da imagem
    const src = image.getAttribute('data-src');
    
    // Definir manipuladores de eventos
    image.onload = () => {
      // Remover atributo data-src
      image.removeAttribute('data-src');
      
      // Remover classe de placeholder, se existir
      image.classList.remove('lazy-placeholder');
      
      // Adicionar classe de carregado
      image.classList.add('lazy-loaded');
      
      // Remover da lista de imagens observadas
      this.observedImages.delete(image);
    };
    
    image.onerror = () => {
      // Adicionar classe de erro
      image.classList.add('lazy-error');
      
      // Remover da lista de imagens observadas
      this.observedImages.delete(image);
    };
    
    // Definir src para carregar a imagem
    image.src = src;
    
    // Se a imagem tiver data-srcset, definir srcset também
    if (image.hasAttribute('data-srcset')) {
      image.srcset = image.getAttribute('data-srcset');
      image.removeAttribute('data-srcset');
    }
  }
  
  /**
   * Carregar componente
   * @param {HTMLElement} element - Elemento do componente
   */
  loadComponent(element) {
    // Obter nome do componente
    const componentName = element.getAttribute('data-lazy-component');
    
    // Verificar se o componente já foi carregado
    if (this.loadedComponents.has(componentName)) {
      this.renderComponent(element, componentName);
      return;
    }
    
    // Carregar componente
    fetch(`components/${componentName}.html`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao carregar componente: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        // Adicionar à lista de componentes carregados
        this.loadedComponents.add(componentName);
        
        // Renderizar componente
        this.renderComponent(element, componentName, html);
        
        // Carregar scripts associados
        this.loadComponentScripts(componentName);
      })
      .catch(error => {
        console.error(`Erro ao carregar componente ${componentName}:`, error);
        
        // Adicionar classe de erro
        element.classList.add('lazy-error');
        
        // Adicionar mensagem de erro
        element.innerHTML = `
          <div class="p-4 bg-red-50 text-red-500 rounded-lg">
            <p>Erro ao carregar componente: ${componentName}</p>
            <p class="text-sm">${error.message}</p>
          </div>
        `;
        
        // Remover da lista de componentes observados
        this.observedComponents.delete(element);
      });
  }
  
  /**
   * Renderizar componente
   * @param {HTMLElement} element - Elemento do componente
   * @param {String} componentName - Nome do componente
   * @param {String} html - HTML do componente
   */
  renderComponent(element, componentName, html) {
    // Se o HTML não foi fornecido, usar o HTML do componente carregado
    if (!html) {
      // Implementar cache de componentes aqui
      console.warn(`Componente ${componentName} não encontrado no cache`);
      return;
    }
    
    // Substituir conteúdo do elemento
    element.innerHTML = html;
    
    // Remover atributo data-lazy-component
    element.removeAttribute('data-lazy-component');
    
    // Adicionar classe de componente carregado
    element.classList.add('component-loaded');
    
    // Remover da lista de componentes observados
    this.observedComponents.delete(element);
    
    // Disparar evento de componente carregado
    const event = new CustomEvent('componentLoaded', {
      detail: { componentName, element }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Carregar scripts associados ao componente
   * @param {String} componentName - Nome do componente
   */
  loadComponentScripts(componentName) {
    // Verificar se o script já foi carregado
    if (this.loadedScripts.has(`${componentName}.js`)) {
      return;
    }
    
    // Carregar script
    const script = document.createElement('script');
    script.src = `js/components/${componentName}.js`;
    script.async = true;
    
    script.onload = () => {
      // Adicionar à lista de scripts carregados
      this.loadedScripts.add(`${componentName}.js`);
      
      // Disparar evento de script carregado
      const event = new CustomEvent('scriptLoaded', {
        detail: { componentName }
      });
      document.dispatchEvent(event);
    };
    
    script.onerror = (error) => {
      console.error(`Erro ao carregar script para ${componentName}:`, error);
    };
    
    // Adicionar script ao documento
    document.head.appendChild(script);
  }
  
  /**
   * Carregar componente manualmente
   * @param {String} componentName - Nome do componente
   * @param {String} targetSelector - Seletor do elemento alvo
   * @returns {Promise} - Promessa resolvida quando o componente for carregado
   */
  loadComponentManually(componentName, targetSelector) {
    return new Promise((resolve, reject) => {
      // Obter elemento alvo
      const targetElement = document.querySelector(targetSelector);
      
      if (!targetElement) {
        reject(new Error(`Elemento alvo não encontrado: ${targetSelector}`));
        return;
      }
      
      // Adicionar atributo data-lazy-component
      targetElement.setAttribute('data-lazy-component', componentName);
      
      // Adicionar classe de carregamento
      targetElement.classList.add('component-loading');
      
      // Carregar componente
      this.loadComponent(targetElement);
      
      // Configurar listener para evento de componente carregado
      const handleComponentLoaded = (event) => {
        if (event.detail.componentName === componentName && event.detail.element === targetElement) {
          // Remover listener
          document.removeEventListener('componentLoaded', handleComponentLoaded);
          
          // Resolver promessa
          resolve(targetElement);
        }
      };
      
      // Adicionar listener
      document.addEventListener('componentLoaded', handleComponentLoaded);
    });
  }
  
  /**
   * Carregar script manualmente
   * @param {String} scriptUrl - URL do script
   * @returns {Promise} - Promessa resolvida quando o script for carregado
   */
  loadScriptManually(scriptUrl) {
    return new Promise((resolve, reject) => {
      // Verificar se o script já foi carregado
      if (this.loadedScripts.has(scriptUrl)) {
        resolve();
        return;
      }
      
      // Carregar script
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      
      script.onload = () => {
        // Adicionar à lista de scripts carregados
        this.loadedScripts.add(scriptUrl);
        
        // Resolver promessa
        resolve();
      };
      
      script.onerror = (error) => {
        reject(error);
      };
      
      // Adicionar script ao documento
      document.head.appendChild(script);
    });
  }
}

// Criar instância global
const lazyLoader = new LazyLoader();
