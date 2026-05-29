import type { InputHTMLAttributes, ForwardedRef } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef(function Input(
  { className, ...props }: InputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
