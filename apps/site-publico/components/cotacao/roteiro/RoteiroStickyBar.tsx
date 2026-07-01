'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { formatBRL } from '@/components/cotacao/wizard/wizard-pricing';

interface RoteiroStickyBarProps {
  total: number;
  onConcierge: () => void;
  whatsappUrl?: string;
}

export function RoteiroStickyBar({ total, onConcierge, whatsappUrl }: RoteiroStickyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Total do roteiro</p>
          <p className="text-xl font-bold">{formatBRL(total)}</p>
        </div>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            <Phone className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={onConcierge}
          className="flex items-center gap-1 rounded-lg bg-accent-lime px-4 py-2 text-sm font-bold text-gray-900 hover:bg-accent-lime/90"
        >
          <MessageCircle className="h-4 w-4" />
          Concierge
        </button>
      </div>
    </div>
  );
}
