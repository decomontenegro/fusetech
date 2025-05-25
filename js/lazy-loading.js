/**
 * FUSEtech Lazy Loading System
 * Sistema avançado de carregamento sob demanda para otimização de performance
 */

class LazyLoadingManager {
  constructor() {
    this.imageObserver = null;
    this.componentObserver = null;
    this.loadedImages = new Set();
    this.loadedComponents = new Set();
    this.imageQueue = [];
    this.componentQueue = [];
    
    this.init();
  }

  init() {
    this.setupImageLazyLoading();
    this.setupComponentLazyLoading();
    this.setupPreloading();
    this.optimizeExistingImages();
  }

  /**
   * Configura lazy loading de imagens
   */
  setupImageLazyLoading() {
    // Verifica suporte nativo
    if ('loading' in HTMLImageElement.prototype) {
      console.log('[LazyLoad] Using native lazy loading for images');
      this.enableNativeLazyLoading();
    } else {
      console.log('[LazyLoad] Using Intersection Observer for images');
      this.setupImageObserver();
    }
  }

  /**
   * Ativa lazy loading nativo
   */
  enableNativeLazyLoading() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.loading = 'lazy';
      img.removeAttribute('data-src');
    });
  }

  /**
   * Configura observer para imagens
   */
  setupImageObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.imageObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Observa imagens existentes
    this.observeImages();
  }

  /**
   * Observa todas as imagens com data-src
   */
  observeImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.imageObserver.observe(img);
    });
  }

  /**
   * Carrega uma imagem
   */
  async loadImage(img) {
    if (this.loadedImages.has(img)) return;

    const src = img.dataset.src;
    if (!src) return;

    try {
      // Mostra skeleton/placeholder
      img.classList.add('loading');
      
      // Pré-carrega a imagem
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = src;
        img.classList.remove('loading');
        img.classList.add('loaded');
        this.loadedImages.add(img);
        
        // Remove data-src após carregamento
        img.removeAttribute('data-src');
        
        // Dispara evento customizado
        img.dispatchEvent(new CustomEvent('imageLoaded', {
          detail: { src, loadTime: performance.now() }
        }));
      };
      
      tempImg.onerror = () => {
        img.classList.remove('loading');
        img.classList.add('error');
        img.src = this.getPlaceholderImage();
      };
      
      tempImg.src = src;
      
    } catch (error) {
      console.error('[LazyLoad] Failed to load image:', error);
      img.classList.remove('loading');
      img.classList.add('error');
    }
  }

  /**
   * Configura lazy loading de componentes
   */
  setupComponentLazyLoading() {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    this.componentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadComponent(entry.target);
          this.componentObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Observa componentes lazy
    this.observeComponents();
  }

  /**
   * Observa componentes com lazy loading
   */
  observeComponents() {
    document.querySelectorAll('[data-lazy-component]').forEach(element => {
      this.componentObserver.observe(element);
    });
  }

  /**
   * Carrega um componente
   */
  async loadComponent(element) {
    if (this.loadedComponents.has(element)) return;

    const componentName = element.dataset.lazyComponent;
    if (!componentName) return;

    try {
      // Mostra loading state
      element.classList.add('component-loading');
      element.innerHTML = this.getComponentSkeleton(componentName);
      
      // Carrega o componente
      const component = await this.importComponent(componentName);
      
      if (component) {
        await component.render(element);
        element.classList.remove('component-loading');
        element.classList.add('component-loaded');
        this.loadedComponents.add(element);
        
        // Dispara evento customizado
        element.dispatchEvent(new CustomEvent('componentLoaded', {
          detail: { componentName, loadTime: performance.now() }
        }));
      }
      
    } catch (error) {
      console.error('[LazyLoad] Failed to load component:', error);
      element.classList.remove('component-loading');
      element.classList.add('component-error');
      element.innerHTML = this.getComponentError(componentName);
    }
  }

  /**
   * Importa componente dinamicamente
   */
  async importComponent(componentName) {
    const componentMap = {
      'activity-chart': () => import('./components/activity-chart.js'),
      'achievement-grid': () => import('./components/achievement-grid.js'),
      'social-feed': () => import('./components/social-feed.js'),
      'marketplace-grid': () => import('./components/marketplace-grid.js'),
      'ai-insights': () => import('./components/ai-insights.js')
    };

    const importFn = componentMap[componentName];
    if (!importFn) {
      throw new Error(`Component ${componentName} not found`);
    }

    const module = await importFn();
    return module.default || module;
  }

  /**
   * Configura preloading inteligente
   */
  setupPreloading() {
    // Preload de recursos críticos
    this.preloadCriticalResources();
    
    // Preload baseado em hover
    this.setupHoverPreloading();
    
    // Preload baseado em scroll
    this.setupScrollPreloading();
  }

  /**
   * Preload de recursos críticos
   */
  preloadCriticalResources() {
    const criticalResources = [
      '/styles/design-system.css',
      '/styles/components.css',
      '/js/animations.js',
      '/js/components.js'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  /**
   * Preload baseado em hover
   */
  setupHoverPreloading() {
    document.addEventListener('mouseover', (event) => {
      const link = event.target.closest('a[href]');
      if (link && !link.dataset.preloaded) {
        this.preloadPage(link.href);
        link.dataset.preloaded = 'true';
      }
    });
  }

  /**
   * Preload baseado em scroll
   */
  setupScrollPreloading() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.preloadNearbyContent();
      }, 150);
    }, { passive: true });
  }

  /**
   * Preload de página
   */
  preloadPage(url) {
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    } catch (error) {
      console.warn('[LazyLoad] Failed to preload page:', url, error);
    }
  }

  /**
   * Preload de conteúdo próximo
   */
  preloadNearbyContent() {
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset;
    const preloadZone = scrollTop + viewportHeight * 2; // 2x viewport ahead
    
    // Preload imagens próximas
    document.querySelectorAll('img[data-src]').forEach(img => {
      const rect = img.getBoundingClientRect();
      const imgTop = rect.top + scrollTop;
      
      if (imgTop <= preloadZone && !this.loadedImages.has(img)) {
        this.loadImage(img);
      }
    });
  }

  /**
   * Otimiza imagens existentes
   */
  optimizeExistingImages() {
    document.querySelectorAll('img').forEach(img => {
      // Adiciona loading lazy se não tiver
      if (!img.loading && !img.dataset.src) {
        img.loading = 'lazy';
      }
      
      // Adiciona decode async
      img.decoding = 'async';
      
      // Otimiza imagens grandes
      this.optimizeImageSize(img);
    });
  }

  /**
   * Otimiza tamanho de imagem
   */
  optimizeImageSize(img) {
    if (!img.src) return;
    
    const rect = img.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const optimalWidth = Math.ceil(rect.width * devicePixelRatio);
    const optimalHeight = Math.ceil(rect.height * devicePixelRatio);
    
    // Se a imagem for muito maior que necessário, sugere otimização
    if (img.naturalWidth > optimalWidth * 2 || img.naturalHeight > optimalHeight * 2) {
      console.warn('[LazyLoad] Image oversized:', img.src, {
        natural: { width: img.naturalWidth, height: img.naturalHeight },
        optimal: { width: optimalWidth, height: optimalHeight }
      });
    }
  }

  /**
   * Retorna imagem placeholder
   */
  getPlaceholderImage() {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
          Imagem não disponível
        </text>
      </svg>
    `);
  }

  /**
   * Retorna skeleton do componente
   */
  getComponentSkeleton(componentName) {
    const skeletons = {
      'activity-chart': `
        <div class="skeleton-chart">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      `,
      'achievement-grid': `
        <div class="skeleton-grid">
          ${Array(6).fill('<div class="skeleton-card"></div>').join('')}
        </div>
      `,
      'social-feed': `
        <div class="skeleton-feed">
          ${Array(3).fill(`
            <div class="skeleton-post">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-content">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line medium"></div>
              </div>
            </div>
          `).join('')}
        </div>
      `,
      default: `
        <div class="skeleton-default">
          <div class="skeleton-line"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      `
    };

    return skeletons[componentName] || skeletons.default;
  }

  /**
   * Retorna erro do componente
   */
  getComponentError(componentName) {
    return `
      <div class="component-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erro ao carregar ${componentName}</p>
        <button onclick="window.lazyLoadingManager.retryComponent(this)" class="btn btn-sm btn-outline">
          Tentar Novamente
        </button>
      </div>
    `;
  }

  /**
   * Tenta carregar componente novamente
   */
  retryComponent(button) {
    const element = button.closest('[data-lazy-component]');
    if (element) {
      this.loadedComponents.delete(element);
      this.loadComponent(element);
    }
  }

  /**
   * Força carregamento de todas as imagens
   */
  loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.loadImage(img);
    });
  }

  /**
   * Força carregamento de todos os componentes
   */
  loadAllComponents() {
    document.querySelectorAll('[data-lazy-component]').forEach(element => {
      this.loadComponent(element);
    });
  }

  /**
   * Adiciona nova imagem para observação
   */
  addImage(img) {
    if (this.imageObserver && img.dataset.src) {
      this.imageObserver.observe(img);
    }
  }

  /**
   * Adiciona novo componente para observação
   */
  addComponent(element) {
    if (this.componentObserver && element.dataset.lazyComponent) {
      this.componentObserver.observe(element);
    }
  }

  /**
   * Limpa observers
   */
  cleanup() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
    
    if (this.componentObserver) {
      this.componentObserver.disconnect();
    }
  }

  /**
   * Obtém estatísticas de carregamento
   */
  getStats() {
    return {
      imagesLoaded: this.loadedImages.size,
      componentsLoaded: this.loadedComponents.size,
      totalImages: document.querySelectorAll('img').length,
      totalComponents: document.querySelectorAll('[data-lazy-component]').length
    };
  }
}

// Inicializa lazy loading manager
const lazyLoadingManager = new LazyLoadingManager();

// Exporta para uso global
window.lazyLoadingManager = lazyLoadingManager;

// Observa mudanças no DOM para novos elementos
const domObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Observa novas imagens
        const images = node.querySelectorAll ? node.querySelectorAll('img[data-src]') : [];
        images.forEach(img => lazyLoadingManager.addImage(img));
        
        // Observa novos componentes
        const components = node.querySelectorAll ? node.querySelectorAll('[data-lazy-component]') : [];
        components.forEach(component => lazyLoadingManager.addComponent(component));
      }
    });
  });
});

domObserver.observe(document.body, {
  childList: true,
  subtree: true
});

// Exporta para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoadingManager;
}
