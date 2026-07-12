'use client';

import { formatBRL } from './wizard-pricing';
import type { WizardPricingBreakdown } from './wizard-pricing';

interface WizardStickyTotalProps {
  total: number;
  breakdown: WizardPricingBreakdown;
  visible: boolean;
}

export function WizardStickyTotal({ total, breakdown, visible }: WizardStickyTotalProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {breakdown.taxaAtiva ? (
            <div className="space-y-0.5 text-xs text-muted-foreground">
              <p className="flex justify-between gap-2">
                <span>Subtotal estimado</span>
                <span>{formatBRL(breakdown.subtotal)}</span>
              </p>
              <p
                className="flex justify-between gap-2"
                title={breakdown.taxaHospedeDescricao}
              >
                <span>
                  {breakdown.taxaHospedeNome} ({breakdown.taxaHospedePct}%)
                </span>
                <span>{formatBRL(breakdown.taxaHospede)}</span>
              </p>
              <p className="text-sm font-bold text-gray-900">
                Total final{' '}
                <span className="float-right">{formatBRL(total)}</span>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground">Total estimado</p>
              <p className="text-xl font-bold text-gray-900">{formatBRL(total)}</p>
            </div>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-accent-lime/30 px-3 py-1 text-xs font-semibold text-gray-900">
          Atualizado em tempo real
        </span>
      </div>
    </div>
  );
}
