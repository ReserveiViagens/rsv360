/**
 * ✅ CODE SPLITTING UTILITIES
 * 
 * Utilitários para code splitting:
 * - Dynamic imports
 * - Route-based splitting
 * - Component-based splitting
 */

import { ComponentType } from 'react';

/**
 * Dynamic import com retry
 */
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return dynamicImportWithRetry(importFn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Preload module
 */
export function preloadModule<T>(importFn: () => Promise<T>): void {
  if (typeof window !== 'undefined') {
    importFn().catch(() => {
      // Ignorar erros de preload
    });
  }
}

/**
 * Route-based code splitting
 */
export function createRouteLoader<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return {
    load: () => importFn(),
    preload: () => preloadModule(importFn),
  };
}

/**
 * Component-based code splitting
 */
export function createComponentLoader<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return {
    load: () => importFn(),
    preload: () => preloadModule(importFn),
    fallback,
  };
}

/**
 * Lazy load com preload automático
 */
export function createLazyLoader<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    preload?: boolean;
    preloadDelay?: number;
    retry?: boolean;
  } = {}
) {
  const { preload = false, preloadDelay = 0, retry = false } = options;

  if (preload && typeof window !== 'undefined') {
    setTimeout(() => {
      preloadModule(importFn);
    }, preloadDelay);
  }

  if (retry) {
    return () => dynamicImportWithRetry(importFn);
  }

  return importFn;
}

/**
 * Split por feature
 */
export const featureLoaders = {
  // Analytics
  analytics: () => import('@/app/analytics/page'),
  
  // CRM
  crm: () => import('@/app/admin/crm/page'),
  
  // Pricing
  smartPricing: () => import('@/app/pricing/smart/page'),
  
  // Reports
  reports: () => import('@/app/reports/page'),
  
  // Group Chat
  groupChat: () => import('@/app/group-chat/[id]/page'),
  
  // Wishlists
  wishlists: () => import('@/app/wishlists/page'),
  
  // Split Payment
  splitPayment: () => import('@/app/split-payment/[id]/page'),
};

/**
 * Preload features com base em rota atual
 */
export function preloadFeaturesForRoute(route: string) {
  if (route.includes('/analytics')) {
    featureLoaders.analytics();
  }
  if (route.includes('/crm')) {
    featureLoaders.crm();
  }
  if (route.includes('/pricing')) {
    featureLoaders.smartPricing();
  }
  if (route.includes('/reports')) {
    featureLoaders.reports();
  }
  if (route.includes('/group-chat')) {
    featureLoaders.groupChat();
  }
  if (route.includes('/wishlists')) {
    featureLoaders.wishlists();
  }
  if (route.includes('/split-payment')) {
    featureLoaders.splitPayment();
  }
}

