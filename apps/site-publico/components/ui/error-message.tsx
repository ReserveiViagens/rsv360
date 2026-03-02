"use client";

import React from 'react';
import { AlertCircle, X, Info } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  error: string | Error | null;
  userMessage?: string;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

export function ErrorMessage({
  error,
  userMessage,
  onDismiss,
  variant = 'error',
  className,
}: ErrorMessageProps) {
  if (!error) return null;

  const errorText = error instanceof Error ? error.message : error;
  const displayMessage = userMessage || errorText;

  const variants = {
    error: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
  };

  const style = variants[variant];

  return (
    <div
      className={cn(
        'p-4 rounded-lg border flex items-start gap-3',
        style.bg,
        style.border,
        className
      )}
    >
      {style.icon}
      <div className="flex-1">
        <p className={cn('text-sm font-medium', style.text)}>{displayMessage}</p>
        {process.env.NODE_ENV === 'development' && errorText !== displayMessage && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">{errorText}</p>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

