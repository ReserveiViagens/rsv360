import type { InputHTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils';

export function Switch({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('inline-flex items-center gap-2', className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="relative h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-emerald-500">
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
