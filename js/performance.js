/**
 * FUSEtech Performance Monitor
 * Sistema de monitoramento de performance, métricas e otimizações
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      userInteractions: [],
      errors: [],
      vitals: {},
      resources: [],
      navigation: {}
    };
    
    this.observers = new Map();
    this.isEnabled = true;
    
    this.init();
  }

  init() {
    if (!this.isEnabled) return;
    
    this.measurePageLoad();
    this.observeWebVitals();
    this.setupErrorTracking();
    this.observeResources();
    this.trackUserInteractions();
    this.setupNavigationTiming();
    this.initServiceWorker();
    
    // Envia métricas periodicamente
    setInterval(() => {
      this.sendMetrics();
    }, 30000); // A cada 30 segundos
  }

  /**
   * Mede tempo de carregamento da página
   */
  measurePageLoad() {
    if (!window.performance) return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      this.metrics.pageLoad = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        largestContentfulPaint: null, // Será preenchido pelo observer
        timeToInteractive: this.calculateTTI(),
        totalLoadTime: navigation.loadEventEnd - navigation.navigationStart
      };

      console.log('[Performance] Page load metrics:', this.metrics.pageLoad);
    });
  }

  /**
   * Observa Web Vitals (Core Web Vitals)
   */
  observeWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.vitals.lcp = {
          value: lastEntry.startTime,
          rating: this.rateLCP(lastEntry.startTime),
          element: lastEntry.element?.tagName || 'unknown'
        };
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('[Performance] LCP observer not supported');
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.metrics.vitals.fid = {
            value: entry.processingStart - entry.startTime,
            rating: this.rateFID(entry.processingStart - entry.startTime),
            eventType: entry.name
          };
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('[Performance] FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.metrics.vitals.cls = {
          value: clsValue,
          rating: this.rateCLS(clsValue)
        };
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('[Performance] CLS observer not supported');
      }
    }
  }

  /**
   * Configura rastreamento de erros
   */
  setupErrorTracking() {
    // Erros JavaScript
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href
      });
    });

    // Erros de recursos
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.trackError({
          type: 'resource',
          message: `Failed to load ${event.target.tagName}`,
          source: event.target.src || event.target.href,
          timestamp: Date.now(),
          url: window.location.href
        });
      }
    }, true);
  }

  /**
   * Observa carregamento de recursos
   */
  observeResources() {
    if (!window.performance) return;

    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        this.metrics.resources.push({
          name: entry.name,
          type: entry.initiatorType,
          size: entry.transferSize || 0,
          duration: entry.duration,
          startTime: entry.startTime,
          cached: entry.transferSize === 0 && entry.decodedBodySize > 0
        });
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (e) {
      console.warn('[Performance] Resource observer not supported');
    }
  }

  /**
   * Rastreia interações do usuário
   */
  trackUserInteractions() {
    const interactionEvents = ['click', 'scroll', 'keydown', 'touchstart'];
    
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.metrics.userInteractions.push({
          type: eventType,
          timestamp: Date.now(),
          target: event.target.tagName,
          className: event.target.className,
          id: event.target.id
        });
        
        // Mantém apenas as últimas 100 interações
        if (this.metrics.userInteractions.length > 100) {
          this.metrics.userInteractions = this.metrics.userInteractions.slice(-100);
        }
      }, { passive: true });
    });
  }

  /**
   * Configura timing de navegação
   */
  setupNavigationTiming() {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0];
    
    this.metrics.navigation = {
      redirectTime: navigation.redirectEnd - navigation.redirectStart,
      dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
      connectTime: navigation.connectEnd - navigation.connectStart,
      requestTime: navigation.responseStart - navigation.requestStart,
      responseTime: navigation.responseEnd - navigation.responseStart,
      domProcessingTime: navigation.domComplete - navigation.domLoading,
      type: navigation.type
    };
  }

  /**
   * Inicializa Service Worker
   */
  async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[Performance] Service Worker registered:', registration);
        
        // Monitora atualizações do SW
        registration.addEventListener('updatefound', () => {
          console.log('[Performance] Service Worker update found');
        });
        
        // Comunica com o SW
        this.setupServiceWorkerCommunication();
        
      } catch (error) {
        console.error('[Performance] Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Configura comunicação com Service Worker
   */
  setupServiceWorkerCommunication() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'CACHE_SIZE':
          this.metrics.cacheSize = data.size;
          break;
        case 'OFFLINE_USAGE':
          this.metrics.offlineUsage = data;
          break;
      }
    });
  }

  /**
   * Rastreia erro
   */
  trackError(error) {
    this.metrics.errors.push(error);
    
    // Mantém apenas os últimos 50 erros
    if (this.metrics.errors.length > 50) {
      this.metrics.errors = this.metrics.errors.slice(-50);
    }
    
    console.error('[Performance] Error tracked:', error);
  }

  /**
   * Calcula Time to Interactive
   */
  calculateTTI() {
    // Implementação simplificada do TTI
    const navigation = performance.getEntriesByType('navigation')[0];
    return navigation.domInteractive - navigation.navigationStart;
  }

  /**
   * Obtém First Paint
   */
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  /**
   * Obtém First Contentful Paint
   */
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  /**
   * Avalia LCP (Largest Contentful Paint)
   */
  rateLCP(value) {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Avalia FID (First Input Delay)
   */
  rateFID(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Avalia CLS (Cumulative Layout Shift)
   */
  rateCLS(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Obtém métricas de memória
   */
  getMemoryMetrics() {
    if (!performance.memory) return null;
    
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      memoryUsagePercentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
    };
  }

  /**
   * Obtém métricas de conexão
   */
  getConnectionMetrics() {
    if (!navigator.connection) return null;
    
    return {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    };
  }

  /**
   * Gera relatório completo de performance
   */
  generateReport() {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      pageLoad: this.metrics.pageLoad,
      vitals: this.metrics.vitals,
      navigation: this.metrics.navigation,
      memory: this.getMemoryMetrics(),
      connection: this.getConnectionMetrics(),
      errors: this.metrics.errors,
      resources: {
        total: this.metrics.resources.length,
        totalSize: this.metrics.resources.reduce((sum, r) => sum + r.size, 0),
        cached: this.metrics.resources.filter(r => r.cached).length
      },
      interactions: {
        total: this.metrics.userInteractions.length,
        types: this.getInteractionTypes()
      }
    };
    
    return report;
  }

  /**
   * Obtém tipos de interação
   */
  getInteractionTypes() {
    const types = {};
    this.metrics.userInteractions.forEach(interaction => {
      types[interaction.type] = (types[interaction.type] || 0) + 1;
    });
    return types;
  }

  /**
   * Envia métricas para análise
   */
  async sendMetrics() {
    if (!this.isEnabled) return;
    
    const report = this.generateReport();
    
    try {
      // Simula envio para serviço de analytics
      console.log('[Performance] Sending metrics:', report);
      
      // Em produção, enviaria para um serviço real
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // });
      
    } catch (error) {
      console.error('[Performance] Failed to send metrics:', error);
    }
  }

  /**
   * Limpa observers
   */
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }

  /**
   * Ativa/desativa monitoramento
   */
  toggle(enabled) {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.cleanup();
    } else {
      this.init();
    }
  }
}

// Inicializa monitor de performance
const performanceMonitor = new PerformanceMonitor();

// Exporta para uso global
window.performanceMonitor = performanceMonitor;

// Exporta para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
