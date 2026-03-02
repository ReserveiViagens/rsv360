'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
// Import direto - ambos são Client Components, não precisa de dynamic import
import ToastNotification, { type Toast, type ToastType } from '@/components/ui/toast-notification';

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastWrapper');
  }
  return context;
}

interface ToastWrapperProps {
  children: ReactNode;
}

export function ToastWrapper({ children }: ToastWrapperProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: string, duration?: number): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message, duration };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) => showToast('success', message, duration);
  const error = (message: string, duration?: number) => showToast('error', message, duration);
  const warning = (message: string, duration?: number) => showToast('warning', message, duration);
  const info = (message: string, duration?: number) => showToast('info', message, duration);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, success, error, warning, info }}>
      {children}
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </ToastContext.Provider>
  );
}

export default ToastWrapper;
