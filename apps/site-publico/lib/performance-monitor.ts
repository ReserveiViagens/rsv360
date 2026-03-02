/**
 * ✅ PERFORMANCE MONITOR
 * 
 * Sistema de monitoramento de performance:
 * - Métricas de carregamento
 * - Web Vitals
 * - Tempo de resposta de APIs
 * - Memory usage
 * - Error tracking
 */

import React from 'react';

export interface PerformanceMetrics {
  pageLoad: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoad: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    timeToInteractive: 0,
    totalBlockingTime: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
  };
  private observers: PerformanceObserver[] = [];
  private apiTimings: Map<string, number[]> = new Map();

  /**
   * Inicializar monitoramento
   */
  init() {
    if (typeof window === 'undefined') return;

    // Web Vitals
    this.observeWebVitals();

    // API timings
    this.observeAPITimings();

    // Memory usage (se disponível)
    this.observeMemoryUsage();

    // Page load
    this.observePageLoad();
  }

  /**
   * Observar Web Vitals
   */
  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }

  /**
   * Observar tempos de API
   */
  private observeAPITimings() {
    if (typeof window === 'undefined') return;

    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;

        // Armazenar timing
        if (!this.apiTimings.has(url)) {
          this.apiTimings.set(url, []);
        }
        this.apiTimings.get(url)!.push(duration);

        // Log se for lento (> 1s)
        if (duration > 1000) {
          console.warn(`Slow API call: ${url} took ${duration.toFixed(2)}ms`);
        }

        return response;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`API error: ${url} failed after ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    };
  }

  /**
   * Observar uso de memória
   */
  private observeMemoryUsage() {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    const memory = (performance as any).memory;
    this.metrics.memoryUsage = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }

  /**
   * Observar carregamento da página
   */
  private observePageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.metrics.pageLoad = navigation.loadEventEnd - navigation.fetchStart;
        this.metrics.firstContentfulPaint = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
      }

      // Calcular Total Blocking Time (TBT)
      try {
        const longTasks = performance.getEntriesByType('longtask') as PerformanceEntry[];
        let blockingTime = 0;
        longTasks.forEach((task) => {
          if (task.duration > 50) {
            blockingTime += task.duration - 50;
          }
        });
        this.metrics.totalBlockingTime = blockingTime;
      } catch (e) {
        // Long task API pode não estar disponível
        console.warn('Long task API not supported');
      }
    });
  }

  /**
   * Obter métricas atuais
   */
  getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  /**
   * Obter estatísticas de API
   */
  getAPIStats(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    this.apiTimings.forEach((timings, url) => {
      const sum = timings.reduce((a, b) => a + b, 0);
      stats[url] = {
        avg: sum / timings.length,
        min: Math.min(...timings),
        max: Math.max(...timings),
        count: timings.length,
      };
    });

    return stats;
  }

  /**
   * Enviar métricas para servidor
   */
  async sendMetrics(endpoint: string = '/api/analytics/performance') {

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: this.metrics,
          apiStats: this.getAPIStats(),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Error sending performance metrics:', error);
    }
  }

  /**
   * Limpar observers
   */
  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Singleton
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
    if (typeof window !== 'undefined') {
      performanceMonitor.init();
    }
  }
  return performanceMonitor;
}

/**
 * Hook para usar métricas de performance
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);

  React.useEffect(() => {
    const monitor = getPerformanceMonitor();
    
    // Obter métricas após carregamento
    const timer = setTimeout(() => {
      setMetrics(monitor.getMetrics());
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return metrics;
}

