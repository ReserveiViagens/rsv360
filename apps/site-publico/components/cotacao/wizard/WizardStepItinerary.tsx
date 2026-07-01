'use client';

import { Button } from '@/components/ui/button';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import { montarRoteiroPreview } from '@/lib/montar-roteiro-preview';
import { RoteiroPreviewShell } from '@/components/cotacao/roteiro/RoteiroPreviewShell';
import { useWizard } from './WizardContext';

export function WizardStepItinerary() {
  const { state, catalog, runningTotal, nextStep, prevStep, currentStep } = useWizard();
  const preview = montarRoteiroPreview(state, catalog);

  const handleApprove = () => {
    trackCotacaoEvent('cotacao_roteiro_preview_approved', {
      total: runningTotal,
      profile: state.profile,
    });
    nextStep();
  };

  return (
    <div className="space-y-4">
      <RoteiroPreviewShell
        key={`roteiro-step-${currentStep}`}
        preview={preview}
        total={runningTotal}
        mode="wizard"
        onApprove={handleApprove}
        approveLabel="Aprovar Roteiro"
      />
      <div className="fixed bottom-24 left-0 right-0 z-30 mx-auto max-w-2xl px-4">
        <Button variant="outline" onClick={prevStep} className="w-full bg-white/95 backdrop-blur-sm">
          Voltar: kit acomodação
        </Button>
      </div>
    </div>
  );
}
