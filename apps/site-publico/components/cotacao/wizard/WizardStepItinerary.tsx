'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import { montarRoteiroPreview } from '@/lib/montar-roteiro-preview';
import { montarRoteiroPreviewInteligente } from '@/lib/montar-roteiro-preview-inteligente';
import { RoteiroImersivo } from '@/components/cotacao/roteiro/RoteiroImersivo';
import { roteiroInteligentePreviewAtivo, type RoteiroAtracao } from '@rsv360/shared';
import { useWizard } from './WizardContext';

type RoteiroAtracoesBffResponse = {
  success?: boolean;
  enabled?: boolean;
  data?: RoteiroAtracao[];
};

export function WizardStepItinerary() {
  const { state, catalog, runningTotal, nextStep, prevStep } = useWizard();
  const [serverEnabled, setServerEnabled] = useState<boolean | null>(null);
  const [atracoes, setAtracoes] = useState<RoteiroAtracao[] | null>(null);
  const [loadingAtracoes, setLoadingAtracoes] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/cotacao/roteiro-atracoes', { cache: 'no-store' });
        const json = (await res.json()) as RoteiroAtracoesBffResponse;
        if (cancelled) return;
        const enabled = json.enabled === true;
        setServerEnabled(enabled);
        if (enabled && json.success && Array.isArray(json.data)) {
          setAtracoes(json.data);
        } else {
          setAtracoes([]);
        }
      } catch {
        if (!cancelled) {
          setServerEnabled(false);
          setAtracoes([]);
        }
      } finally {
        if (!cancelled) setLoadingAtracoes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const intelligent = roteiroInteligentePreviewAtivo(serverEnabled ?? false, atracoes);

  const preview = useMemo(() => {
    if (intelligent && atracoes) {
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
