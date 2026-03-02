import React from 'react';
import { cn } from '../../utils/cn';

export interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md'
}) => {
  // Configurações por variante
  const variantConfig = {
    default: 'text-gray-700',
    muted: 'text-gray-500',
    accent: 'text-primary-600'
  };

  // Configurações por tamanho
  const sizeConfig = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const config = variantConfig[variant];
  const sizeClass = sizeConfig[size];

  return (
    <div
      className={cn(
        'mt-1 leading-relaxed',
        sizeClass,
        config,
        className
      )}
    >
      {children}
    </div>
  );
};

export { AlertDescription };
export type { AlertDescriptionProps };
