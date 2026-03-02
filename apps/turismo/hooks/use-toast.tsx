// Hook para sistema de notificações toast conforme documentação (linha 131)
'use client';

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

/**
 * Hook customizado para sistema de notificações toast
 * Integração com componente toast.tsx do shadcn/ui
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: generateId(),
      duration: toast.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Remover automaticamente após duração
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(newToast.id);
      }, newToast.duration);
    }

    return newToast.id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    return toast({ type: 'success', title, message });
  }, [toast]);

  const error = useCallback((title: string, message?: string) => {
    return toast({ type: 'error', title, message });
  }, [toast]);

  const warning = useCallback((title: string, message?: string) => {
    return toast({ type: 'warning', title, message });
  }, [toast]);

  const info = useCallback((title: string, message?: string) => {
    return toast({ type: 'info', title, message });
  }, [toast]);

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    remove: removeToast,
    clear: () => setToasts([]),
  };
}

