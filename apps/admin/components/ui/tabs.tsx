import type { HTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils';

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('w-full', className)} {...props} />;
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex rounded-lg bg-slate-100 p-1', className)} {...props} />;
}

export function TabsTrigger({ className, 'data-active': active, ...props }: HTMLAttributes<HTMLButtonElement> & { 'data-active'?: boolean }) {
  return (
    <button
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition',
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4', className)} {...props} />;
}
