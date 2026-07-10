'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import { montarRoteiroPreview } from '@/lib/montar-roteiro-preview';
import { montarRoteiroPreviewInteligente } from '@/lib/montar-roteiro-preview-inteligente';
import { isRoteiroInteligenteClientEnabled } from '@/lib/roteiro-inteligente-enabled';
import { RoteiroImersivo } from '@/components/cotacao/roteiro/RoteiroImersivo';
import type { RoteiroAtracao } from '@rsv360/shared';
import { useWizard } from './WizardContext';

export function WizardStepItinerary() {
  const { state, catalog, runningTotal, nextStep, prevStep } = useWizard();
  const intelligent = isRoteiroInteligenteClientEnabled();
  const [atracoes, setAtracoes] = useState<RoteiroAtracao[] | null>(null);
  const [loadingAtracoes, setLoadingAtracoes] = useState(intelligent);

  useEffect(() => {
    if (!intelligent) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/cotacao/roteiro-atracoes');
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setAtracoes(json.data as RoteiroAtracao[]);
        }
      } catch {
        if (!cancelled) setAtracoes([]);
      } finally {
        if (!cancelled) setLoadingAtracoes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [intelligent]);

  const preview = useMemo(() => {
    if (intelligent && atracoes && atracoes.length > 0) {
      return montarRoteiroPreviewInteligente(state, catalog, atracoes);
    }
    return montarRoteiroPreview(state, catalog);
  }, [intelligent, atracoes, state, catalog]);

  const handleApprove = () => {
    trackCotacaoEvent('cotacao_roteiro_preview_approved', {
      total: runningTotal,
      profile: state.profile,
    });
    nextStep();
  };

  return (
    <div className="space-y-4">
      <RoteiroImersivo
        preview={preview}
        total={runningTotal}
        onApprove={handleApprove}
        approveLabel="Aprovar Roteiro"
        isLoading={loadingAtracoes}
      />
      <div className="fixed bottom-24 left-0 right-0 z-30 mx-auto max-w-2xl px-4">
        <Button variant="outline" onClick={prevStep} className="w-full bg-white/95 backdrop-blur-sm">
          Voltar: kit acomodação
        </Button>
      </div>
    </div>
  );
}
