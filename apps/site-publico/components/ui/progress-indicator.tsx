/**
 * ✅ INDICADORES DE PROGRESSO
 * 
 * Componentes para mostrar progresso de operações:
 * - Progress bar
 * - Loading overlay
 * - Step indicator
 */

"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function ProgressBar({ value, className, showLabel = true, color = 'primary' }: ProgressBarProps) {
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span>Progresso</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, message, progress, children }: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        {message && <p className="text-sm text-muted-foreground mb-2">{message}</p>}
        {progress !== undefined && (
          <div className="w-64">
            <ProgressBar value={progress} />
          </div>
        )}
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepIndicator({ currentStep, totalSteps, labels, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? '✓' : step}
              </div>
              {labels && labels[index] && (
                <span className={cn('text-xs mt-1', isCurrent && 'font-medium')}>
                  {labels[index]}
                </span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

