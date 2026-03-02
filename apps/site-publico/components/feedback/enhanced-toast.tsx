"use client";

import React from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface EnhancedToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2,
};

const colors = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  loading: 'text-gray-600',
};

/**
 * ✅ ENHANCED TOAST
 * 
 * Sistema de toast melhorado com:
 * - Ícones contextuais
 * - Ações customizadas
 * - Animações suaves
 * - Diferentes variantes
 */
export function showToast(options: EnhancedToastOptions) {
  const { title, description, variant = 'info', duration = 4000, action, cancel } = options;
  const Icon = icons[variant];

  const toastContent = (
    <div className="flex items-start gap-3">
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', colors[variant])} />
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );

  const toastOptions: any = {
    duration: variant === 'loading' ? Infinity : duration,
    description: toastContent,
  };

  if (action) {
    toastOptions.action = {
      label: action.label,
      onClick: action.onClick,
    };
  }

  if (cancel) {
    toastOptions.cancel = {
      label: cancel.label,
      onClick: cancel.onClick,
    };
  }

  switch (variant) {
    case 'success':
      return toast.success(title, toastOptions);
    case 'error':
      return toast.error(title, toastOptions);
    case 'warning':
      return toast.warning(title, toastOptions);
    case 'loading':
      return toast.loading(title, toastOptions);
    default:
      return toast.info(title, toastOptions);
  }
}

/**
 * Toast de sucesso
 */
export function showSuccessToast(title: string, description?: string, options?: Partial<EnhancedToastOptions>) {
  return showToast({ title, description, variant: 'success', ...options });
}

/**
 * Toast de erro
 */
export function showErrorToast(title: string, description?: string, options?: Partial<EnhancedToastOptions>) {
  return showToast({ title, description, variant: 'error', ...options });
}

/**
 * Toast de aviso
 */
export function showWarningToast(title: string, description?: string, options?: Partial<EnhancedToastOptions>) {
  return showToast({ title, description, variant: 'warning', ...options });
}

/**
 * Toast de informação
 */
export function showInfoToast(title: string, description?: string, options?: Partial<EnhancedToastOptions>) {
  return showToast({ title, description, variant: 'info', ...options });
}

/**
 * Toast de carregamento
 */
export function showLoadingToast(title: string, description?: string) {
  return showToast({ title, description, variant: 'loading' });
}

/**
 * Dismiss toast
 */
export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}

