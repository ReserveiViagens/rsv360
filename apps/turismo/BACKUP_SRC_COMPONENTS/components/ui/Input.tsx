import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    size = 'md',
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'flex w-full items-center gap-2 rounded-lg border bg-white px-3 text-sm transition-all duration-200',
      'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
      {
        // Variants
        'border-neutral-200 bg-white': variant === 'default',
        'border-neutral-200 bg-neutral-50': variant === 'filled',
        'border-2 border-neutral-300 bg-transparent': variant === 'outlined',
        
        // Sizes
        'h-8 px-2 text-xs': size === 'sm',
        'h-10 px-3 text-sm': size === 'md',
        'h-12 px-4 text-base': size === 'lg',
        
        // States
        'border-error-500 focus:ring-error-500/20': error,
        'hover:border-primary-300': !error && !disabled,
        'focus:border-primary-500': !error && !disabled,
      },
      className
    );

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              baseClasses,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-error-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-xs text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
