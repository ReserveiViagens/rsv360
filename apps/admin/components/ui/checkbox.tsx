import type { InputHTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils';

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={cn('h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400', className)} {...props} />;
}
