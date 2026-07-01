'use client';

import { formatBRL } from './wizard-pricing';

interface WizardStickyTotalProps {
  total: number;
  visible: boolean;
}

export function WizardStickyTotal({ total, visible }: WizardStickyTotalProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total estimado</p>
          <p className="text-xl font-bold text-gray-900">{formatBRL(total)}</p>
        </div>
        <span className="rounded-full bg-accent-lime/30 px-3 py-1 text-xs font-semibold text-gray-900">
          Atualizado em tempo real
        </span>
      </div>
    </div>
  );
}
