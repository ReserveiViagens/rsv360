'use client';

import Link from 'next/link';
import { AlertTriangle, MessageCircle, RefreshCw } from 'lucide-react';
import { PROPOSTA_EXPIRADA_MSG } from '@/hooks/useRoteiroValidade';

interface PropostaExpiradaPanelProps {
  whatsappUrl: string;
  recotacaoUrl: string;
}

export function PropostaExpiradaPanel({ whatsappUrl, recotacaoUrl }: PropostaExpiradaPanelProps) {
  return (
    <section
      className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6"
      role="alert"
      data-testid="proposta-expirada-panel"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-amber-900">Proposta expirada</h2>
          <p className="mt-1 text-sm text-amber-800">{PROPOSTA_EXPIRADA_MSG}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={recotacaoUrl}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
          data-testid="btn-recotacao"
        >
          <RefreshCw className="h-4 w-4" />
          Solicitar nova cotação
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-5 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
          data-testid="btn-falar-consultor"
        >
          <MessageCircle className="h-4 w-4" />
          Falar com consultor
        </a>
      </div>
    </section>
  );
}
