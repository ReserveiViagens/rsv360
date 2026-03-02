import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCharacterCount = false,
      maxLength,
      autoResize = false,
      variant = 'default',
      size = 'md',
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const [characterCount, setCharacterCount] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    // Contador de caracteres
    useEffect(() => {
      if (props.value) {
        setCharacterCount(String(props.value).length);
      } else {
        setCharacterCount(0);
      }
    }, [props.value]);

    // Auto-resize
    const handleResize = (element: HTMLTextAreaElement) => {
      if (autoResize) {
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
      }
    };

    // Configurações por variante
    const variantConfig = {
      default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
      filled: 'bg-gray-50 border-gray-300 focus:border-primary-500 focus:ring-primary-500',
      outlined: 'border-2 border-gray-300 focus:border-primary-500 focus:ring-primary-500'
    };

    // Configurações por tamanho
    const sizeConfig = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-4 py-4 text-lg'
    };

    // Configurações de estado
    const stateConfig = {
      disabled: 'bg-gray-100 text-gray-500 cursor-not-allowed',
      error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
      focused: 'ring-2 ring-primary-500 ring-opacity-50',
      default: ''
    };

    const config = variantConfig[variant];
    const sizeClass = sizeConfig[size];
    const stateClass = disabled 
      ? stateConfig.disabled 
      : error 
        ? stateConfig.error 
        : isFocused 
          ? stateConfig.focused 
          : stateConfig.default;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        {/* Container do textarea */}
        <div className="relative">
          {/* Ícone esquerdo */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Textarea */}
          <textarea
            className={cn(
              'w-full rounded-lg border transition-all duration-200',
              'placeholder-gray-400',
              'focus:outline-none',
              config,
              sizeClass,
              stateClass,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              if (autoResize) {
                handleResize(e.target);
              }
              props.onChange?.(e);
            }}
            {...props}
          />

          {/* Ícone direito */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper text e contador de caracteres */}
        <div className="flex items-center justify-between mt-2">
          {/* Helper text */}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}

          {/* Mensagem de erro */}
          {error && (
            <p className="text-sm text-error-600">{error}</p>
          )}

          {/* Contador de caracteres */}
          {showCharacterCount && maxLength && (
            <span className={cn(
              'text-sm',
              characterCount > maxLength * 0.9 
                ? 'text-error-600' 
                : 'text-gray-500'
            )}>
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
