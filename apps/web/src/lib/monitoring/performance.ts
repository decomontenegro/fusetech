// Performance monitoring utilities
export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: number
  tags?: Record<string, string>
}

export interface WebVitals {
  CLS: number // Cumulative Layout Shift
  FID: number // First Input Delay
  FCP: number // First Contentful Paint
  LCP: number // Largest Contentful Paint
  TTFB: number // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  // Initialize performance observers
  private initializeObservers() {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.trackNavigationTiming(entry as PerformanceNavigationTiming)
          }
        }
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navObserver)

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.trackResourceTiming(entry as PerformanceResourceTiming)
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)

      // Long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            this.trackLongTask(entry)
          }
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)
    }
  }

  // Track navigation timing
  private trackNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = [
      {
        name: 'dns_lookup',
        value: entry.domainLookupEnd - entry.domainLookupStart,
        unit: 'ms' as const,
      },
      {
        name: 'tcp_connection',
        value: entry.connectEnd - entry.connectStart,
        unit: 'ms' as const,
      },
      {
        name: 'request_response',
        value: entry.responseEnd - entry.requestStart,
        unit: 'ms' as const,
      },
      {
        name: 'dom_processing',
        value: entry.domComplete - entry.domLoading,
        unit: 'ms' as const,
      },
      {
        name: 'page_load',
        value: entry.loadEventEnd - entry.navigationStart,
        unit: 'ms' as const,
      },
    ]

    metrics.forEach(metric => this.addMetric(metric.name, metric.value, metric.unit))
  }

  // Track resource timing
  private trackResourceTiming(entry: PerformanceResourceTiming) {
    const resourceType = this.getResourceType(entry.name)
    
    this.addMetric('resource_load_time', entry.duration, 'ms', {
      resource_type: resourceType,
      resource_name: entry.name,
    })

    // Track large resources
    if (entry.transferSize > 100000) { // > 100KB
      this.addMetric('large_resource_size', entry.transferSize, 'bytes', {
        resource_name: entry.name,
        resource_type: resourceType,
      })
    }
  }

  // Track long tasks (> 50ms)
  private trackLongTask(entry: PerformanceEntry) {
    this.addMetric('long_task_duration', entry.duration, 'ms', {
      task_name: entry.name,
    })
  }

  // Get resource type from URL
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
    if (url.includes('/api/')) return 'api'
    return 'other'
  }

  // Add custom metric
  addMetric(name: string, value: number, unit: 'ms' | 'bytes' | 'count', tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    }

    this.metrics.push(metric)

    // Send to analytics
    this.sendMetric(metric)

    // Keep only last 100 metrics in memory
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  // Send metric to analytics service
  private async sendMetric(metric: PerformanceMetric) {
    try {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'performance_metric', {
          custom_parameter_name: metric.name,
          custom_parameter_value: metric.value,
          custom_parameter_unit: metric.unit,
          custom_parameter_tags: JSON.stringify(metric.tags || {}),
        })
      }

      // Send to custom analytics endpoint
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      }).catch(() => {
        // Ignore errors to avoid affecting user experience
      })
    } catch (error) {
      // Ignore errors
    }
  }

  // Get all metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name)
  }

  // Get average metric value
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name)
    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
    return sum / metrics.length
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = []
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window === 'undefined') return

  // Track Core Web Vitals using the web-vitals library pattern
  const vitalsScript = document.createElement('script')
  vitalsScript.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js'
  vitalsScript.onload = () => {
    if (window.webVitals) {
      // Cumulative Layout Shift
      window.webVitals.getCLS((metric: any) => {
        performanceMonitor.addMetric('CLS', metric.value, 'count')
      })

      // First Input Delay
      window.webVitals.getFID((metric: any) => {
        performanceMonitor.addMetric('FID', metric.value, 'ms')
      })

      // First Contentful Paint
      window.webVitals.getFCP((metric: any) => {
        performanceMonitor.addMetric('FCP', metric.value, 'ms')
      })

      // Largest Contentful Paint
      window.webVitals.getLCP((metric: any) => {
        performanceMonitor.addMetric('LCP', metric.value, 'ms')
      })

      // Time to First Byte
      window.webVitals.getTTFB((metric: any) => {
        performanceMonitor.addMetric('TTFB', metric.value, 'ms')
      })
    }
  }
  document.head.appendChild(vitalsScript)
}

// Memory usage tracking
export function trackMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  const memory = (performance as any).memory
  
  performanceMonitor.addMetric('memory_used', memory.usedJSHeapSize, 'bytes')
  performanceMonitor.addMetric('memory_total', memory.totalJSHeapSize, 'bytes')
  performanceMonitor.addMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes')
}

// Bundle size tracking
export function trackBundleSize() {
  if (typeof window === 'undefined') return

  // Track main bundle size
  const scripts = document.querySelectorAll('script[src]')
  scripts.forEach((script) => {
    const src = (script as HTMLScriptElement).src
    if (src.includes('/_next/static/')) {
      fetch(src, { method: 'HEAD' })
        .then(response => {
          const size = response.headers.get('content-length')
          if (size) {
            performanceMonitor.addMetric('bundle_size', parseInt(size), 'bytes', {
              bundle_type: 'javascript',
              bundle_url: src,
            })
          }
        })
        .catch(() => {
          // Ignore errors
        })
    }
  })

  // Track CSS bundle size
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
  stylesheets.forEach((link) => {
    const href = (link as HTMLLinkElement).href
    if (href.includes('/_next/static/')) {
      fetch(href, { method: 'HEAD' })
        .then(response => {
          const size = response.headers.get('content-length')
          if (size) {
            performanceMonitor.addMetric('bundle_size', parseInt(size), 'bytes', {
              bundle_type: 'css',
              bundle_url: href,
            })
          }
        })
        .catch(() => {
          // Ignore errors
        })
    }
  })
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Track initial metrics
  trackWebVitals()
  trackMemoryUsage()
  trackBundleSize()

  // Track memory usage every 30 seconds
  setInterval(trackMemoryUsage, 30000)

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup()
  })
}
