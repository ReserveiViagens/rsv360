/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { ButtonHTMLAttributes, ForwardedRef, ReactElement, ReactNode } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-brand-900 text-white hover:bg-brand-800 shadow-soft',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  destructive: 'bg-rose-600 text-white hover:bg-rose-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
  icon: 'h-10 w-10',
};

export const Button = forwardRef(function Button(
  { className, variant = 'default', size = 'default', asChild = false, children, ...props }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const composedClassName = cn(
    'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: cn((children as ReactElement<{ className?: string }>).props.className, composedClassName),
    });
  }

  return (
    <button ref={ref} className={composedClassName} {...props}>
      {children as ReactNode}
    </button>
  );
});

Button.displayName = 'Button';
