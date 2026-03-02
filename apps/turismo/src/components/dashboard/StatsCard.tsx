import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: 'bg-white border-neutral-200 text-neutral-700',
    success: 'bg-success-50 border-success-200 text-success-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    error: 'bg-error-50 border-error-200 text-error-700',
    info: 'bg-info-50 border-info-200 text-info-700',
  };

  const iconStyles = {
    default: 'text-neutral-500 bg-neutral-100',
    success: 'text-success-600 bg-success-100',
    warning: 'text-warning-600 bg-warning-100',
    error: 'text-error-600 bg-error-100',
    info: 'text-info-600 bg-info-100',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 transition-all duration-200 hover:shadow-medium',
        variantStyles[variant],
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm">
            <Icon className={cn('h-6 w-6', iconStyles[variant])} />
          </div>
          
          {change && (
            <div className="flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs backdrop-blur-sm">
              {change.isPositive ? (
                <TrendingUp className="h-3 w-3 text-success-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-error-600" />
              )}
              <span
                className={cn(
                  'font-medium',
                  change.isPositive ? 'text-success-600' : 'text-error-600'
                )}
              >
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>
          
          {change && (
            <p className="mt-1 text-xs text-neutral-500">
              {change.isPositive ? 'Aumentou' : 'Diminuiu'} {change.period}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export { StatsCard };
