"use client";

import React from 'react';
import { LoadingSpinner } from './loading-spinner';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EnhancedLoadingProps {
  isLoading: boolean;
  message?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EnhancedLoading({
  isLoading,
  message,
  variant = 'spinner',
  size = 'md',
  className,
}: EnhancedLoadingProps) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      {variant === 'spinner' && (
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      )}
      {variant === 'dots' && (
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
      {variant === 'pulse' && (
        <div className={cn('bg-primary rounded-full animate-pulse', sizeClasses[size])} />
      )}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'warning';
  message?: string;
  className?: string;
}

export function StatusIndicator({ status, message, className }: StatusIndicatorProps) {
  const icons = {
    loading: <Loader2 className="h-5 w-5 animate-spin text-blue-600" />,
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
  };

  const colors = {
    loading: 'text-blue-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {icons[status]}
      {message && <p className={cn('text-sm', colors[status])}>{message}</p>}
    </div>
  );
}

