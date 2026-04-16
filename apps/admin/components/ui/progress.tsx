import type { HTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils';

export function Progress({ className, value = 0, ...props }: HTMLAttributes<HTMLDivElement> & { value?: number }) {
  return (
    <div className={cn('h-2 w-full rounded-full bg-slate-100', className)} {...props}>
      <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
