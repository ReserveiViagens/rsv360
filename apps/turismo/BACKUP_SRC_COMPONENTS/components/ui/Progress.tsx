import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressProps {
  value: number; // Valor de 0 a 100
  max?: number; // Valor máximo (padrão: 100)
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  orientation?: 'horizontal' | 'vertical';
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  animated?: boolean;
  className?: string;
  labelClassName?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  orientation = 'horizontal',
  showLabel = false,
  labelPosition = 'top',
  animated = true,
  className,
  labelClassName
}) => {
  // Calcular porcentagem
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Classes de tamanho
  const sizeClasses = {
    sm: orientation === 'horizontal' ? 'h-1' : 'w-1',
    md: orientation === 'horizontal' ? 'h-2' : 'w-2',
    lg: orientation === 'horizontal' ? 'h-3' : 'w-3'
  };

  // Classes de variante
  const variantClasses = {
    default: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-info-500'
  };

  // Classes de animação
  const animationClasses = animated ? 'transition-all duration-300 ease-out' : '';

  // Renderizar label
  const renderLabel = () => {
    if (!showLabel) return null;

    const labelClasses = cn(
      'text-sm font-medium text-gray-700',
      labelClassName
    );

    const labelContent = `${Math.round(percentage)}%`;

    switch (labelPosition) {
      case 'top':
        return (
          <div className="mb-2 text-center">
            <span className={labelClasses}>{labelContent}</span>
          </div>
        );
      case 'bottom':
        return (
          <div className="mt-2 text-center">
            <span className={labelClasses}>{labelContent}</span>
          </div>
        );
      case 'left':
        return (
          <div className="mr-2 text-right">
            <span className={labelClasses}>{labelContent}</span>
          </div>
        );
      case 'right':
        return (
          <div className="ml-2 text-left">
            <span className={labelClasses}>{labelContent}</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Renderizar barra de progresso
  const renderProgressBar = () => {
    if (orientation === 'vertical') {
      return (
        <div className={cn(
          'relative bg-gray-200 rounded-full',
          sizeClasses[size],
          className
        )}>
          <div
            className={cn(
              'absolute bottom-0 left-0 w-full rounded-full',
              variantClasses[variant],
              animationClasses
            )}
            style={{ height: `${percentage}%` }}
          />
        </div>
      );
    }

    return (
      <div className={cn(
        'relative bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size],
        className
      )}>
        <div
          className={cn(
            'h-full rounded-full',
            variantClasses[variant],
            animationClasses
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // Layout baseado na orientação
  if (orientation === 'vertical') {
    return (
      <div className="flex items-center">
        {labelPosition === 'left' && renderLabel()}
        {renderProgressBar()}
        {labelPosition === 'right' && renderLabel()}
      </div>
    );
  }

  return (
    <div className="w-full">
      {labelPosition === 'top' && renderLabel()}
      {renderProgressBar()}
      {labelPosition === 'bottom' && renderLabel()}
    </div>
  );
};

export { Progress };
export type { ProgressProps };
