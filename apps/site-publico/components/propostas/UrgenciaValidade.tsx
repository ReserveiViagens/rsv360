'use client';

import { Clock, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { urgencyLoadingClockClass } from '@/lib/proposta-cinematic-telemetry';
import {
  formatRestanteMs,
  formatValidoAteLegivel,
  normalizeUrgenciaEstilo,
  shouldShowUrgenciaIndicador,
} from '@/lib/proposta-validade-ui';

export interface UrgenciaValidadeProps {
  urgenciaEstilo?: string | null;
  restanteMs: number | null;
  validoAte?: string | null;
  expirada: boolean;
  loading?: boolean;
  className?: string;
  prefersReducedMotion?: boolean;
}

export function UrgenciaValidade({
  urgenciaEstilo,
  restanteMs,
  validoAte,
  expirada,
  loading,
  className,
  prefersReducedMotion = false,
}: UrgenciaValidadeProps) {
  const estilo = normalizeUrgenciaEstilo(urgenciaEstilo);

  if (!shouldShowUrgenciaIndicador(estilo, expirada)) {
    return null;
  }

  if (estilo === 'badge') {
    const ate = formatValidoAteLegivel(validoAte);
    return (
      <span
        data-testid="urgencia-badge"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200',
          className,
        )}
      >
        <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{ate ? `Válido até ${ate}` : 'Oferta por tempo limitado'}</span>
      </span>
    );
  }

  if (loading) {
    return (
      <span
        data-testid="urgencia-countdown-loading"
        className={cn('inline-flex items-center gap-1.5 text-xs text-slate-400', className)}
      >
        <Clock className={urgencyLoadingClockClass(prefersReducedMotion)} aria-hidden />
        Sincronizando validade…
      </span>
    );
  }

  if (restanteMs == null || restanteMs <= 0) {
    return null;
  }

  return (
    <span
      data-testid="urgencia-countdown"
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-xs font-medium text-slate-700',
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
      Válida por {formatRestanteMs(restanteMs)}
    </span>
  );
}
