/**
 * Utilitários de Performance para RSV 360
 * Otimizações, monitoramento e métricas de performance
 */

// Web Vitals Monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.set('LCP', lastEntry.startTime);
          this.reportMetric('LCP', lastEntry.startTime);
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
            const fid = entry.processingStart - entry.startTime;
            this.metrics.set('FID', fid);
            this.reportMetric('FID', fid);
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
          this.metrics.set('CLS', clsValue);
          this.reportMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private reportMetric(name: string, value: number) {
    // Em produção, enviar para analytics
    if (process.env.NODE_ENV === 'production') {
      // Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', name, {
          event_category: 'Web Vitals',
          value: Math.round(value),
          non_interaction: true,
        });
      }
    } else {
      console.log(`🎯 ${name}: ${Math.round(value)}ms`);
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Image Lazy Loading com Intersection Observer
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
              this.images.delete(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer && img.dataset.src) {
      this.images.add(img);
      this.observer.observe(img);
    }
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    }
  }

  disconnect() {
    this.observer?.disconnect();
    this.images.clear();
  }
}

// Cache Manager para otimizar requisições
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Cleanup automático
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Virtual Scrolling para listas grandes
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private totalCount: number;
  private scrollTop: number = 0;
  private startIndex: number = 0;
  private endIndex: number = 0;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    visibleCount: number,
    totalCount: number
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleCount = visibleCount;
    this.totalCount = totalCount;

    this.updateVisibleRange();
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  private handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.updateVisibleRange();
  }

  private updateVisibleRange() {
    this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
    this.endIndex = Math.min(
      this.startIndex + this.visibleCount + 1,
      this.totalCount
    );
  }

  getVisibleRange(): { start: number; end: number } {
    return {
      start: this.startIndex,
      end: this.endIndex,
    };
  }

  getOffsetY(): number {
    return this.startIndex * this.itemHeight;
  }

  getTotalHeight(): number {
    return this.totalCount * this.itemHeight;
  }

  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll.bind(this));
  }
}

// Debounce para otimizar eventos
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

// Throttle para otimizar eventos de scroll
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Preload de recursos críticos
export class ResourcePreloader {
  private preloadedResources: Set<string> = new Set();

  preloadImage(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }

  preloadScript(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  }

  preloadCSS(href: string): Promise<void> {
    if (this.preloadedResources.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => {
        this.preloadedResources.add(href);
        resolve();
      };
      link.onerror = reject;
      link.href = href;
      document.head.appendChild(link);
    });
  }
}

// Bundle Size Analyzer (desenvolvimento)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    console.group('📦 Bundle Analysis');

    scripts.forEach((script: any) => {
      fetch(script.src)
        .then(response => response.blob())
        .then(blob => {
          console.log(`📄 ${script.src.split('/').pop()}: ${(blob.size / 1024).toFixed(2)}KB`);
        });
    });

    styles.forEach((style: any) => {
      fetch(style.href)
        .then(response => response.blob())
        .then(blob => {
          console.log(`🎨 ${style.href.split('/').pop()}: ${(blob.size / 1024).toFixed(2)}KB`);
        });
    });

    console.groupEnd();
  }
}

// Memory Usage Monitor
export class MemoryMonitor {
  static getMemoryUsage(): any {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  static logMemoryUsage() {
    const memory = this.getMemoryUsage();
    if (memory) {
      console.group('🧠 Memory Usage');
      console.log(`Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`);
      console.log(`Total: ${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`);
      console.log(`Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`);
      console.groupEnd();
    }
  }

  static startMonitoring(interval: number = 30000) {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        this.logMemoryUsage();
      }, interval);
    }
  }
}

// Code Splitting Helper
export function loadComponent<T = any>(
  importFunc: () => Promise<{ default: T }>
): Promise<T> {
  return importFunc().then(module => module.default);
}

// Service Worker Registration
export function registerServiceWorker(): void {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Singletons para uso global
export const performanceMonitor = PerformanceMonitor.getInstance();
export const lazyImageLoader = new LazyImageLoader();
export const cacheManager = new CacheManager();
export const resourcePreloader = new ResourcePreloader();

// Inicialização automática em produção
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  registerServiceWorker();
  MemoryMonitor.startMonitoring();
}
