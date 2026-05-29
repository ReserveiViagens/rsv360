import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';
