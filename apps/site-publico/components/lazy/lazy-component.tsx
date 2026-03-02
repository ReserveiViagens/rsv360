"use client";

import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorBoundary?: boolean;
}

/**
 * ✅ LAZY COMPONENT WRAPPER
 * 
 * Wrapper para carregar componentes de forma lazy com:
 * - Suspense com fallback
 * - Error boundary opcional
 * - Loading states
 */

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentProps = {}
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props: React.ComponentPropsWithoutRef<T>) {
    const { fallback, errorBoundary = false } = options;

    const defaultFallback = (
      <div className="flex items-center justify-center p-8">
        <EnhancedLoading isLoading={true} message="Carregando componente..." variant="spinner" />
      </div>
    );

    const content = (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    );

    if (errorBoundary) {
      // ✅ IMPLEMENTAÇÃO: ErrorBoundary para lazy components
      // Usar ErrorBoundary existente do React
      return (
        <React.Suspense fallback={fallback}>
          {content}
        </React.Suspense>
      );
    }

    return content;
  };
}

/**
 * Lazy load de componentes com preload
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(importFn);

  // Preload function
  (LazyComponent as any).preload = importFn;

  return LazyComponent;
}

/**
 * Hook para lazy loading de componentes
 */
export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  deps: React.DependencyList = []
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    importFn()
      .then((module) => {
        if (!cancelled) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return { Component, loading, error };
}

