'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRestanteMs } from '@/hooks/useRoteiroValidade';

interface CountdownTimerProps {
  restanteMs: number | null;
  expirada: boolean;
  loading?: boolean;
  className?: string;
}

export function CountdownTimer({ restanteMs, expirada, loading, className }: CountdownTimerProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-white/40', className)}>
        <Clock className="h-3.5 w-3.5 animate-pulse" />
        <span>Sincronizando validade…</span>
      </div>
    );
  }

  if (expirada || restanteMs === null || restanteMs <= 0) {
    return (
      <div className={cn('flex items-center gap-2 text-xs font-medium text-amber-400', className)}>
        <Clock className="h-3.5 w-3.5" />
        <span>Cotação expirada</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 text-xs text-white/70', className)}>
      <Clock className="h-3.5 w-3.5 text-amber-300/90" />
      <span>
        Tarifa válida por{' '}
        <strong className="font-semibold tabular-nums text-white">{formatRestanteMs(restanteMs)}</strong>
      </span>
    </div>
  );
}
