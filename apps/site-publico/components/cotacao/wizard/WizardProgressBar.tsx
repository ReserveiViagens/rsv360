'use client';

import { WIZARD_STEP_NAMES } from '@/lib/cotacao-analytics';
import { passosVisiveis } from '@rsv360/shared';
import { cn } from '@/lib/utils';

interface WizardProgressBarProps {
  currentStep: number;
  passosColapsados: number[];
}

export function WizardProgressBar({ currentStep, passosColapsados }: WizardProgressBarProps) {
  const visiveis = passosVisiveis(passosColapsados);
  const posicaoAtual = Math.max(0, visiveis.indexOf(currentStep));
  const passoExibido = posicaoAtual >= 0 ? posicaoAtual + 1 : 1;
  const totalExibido = visiveis.length || WIZARD_STEP_NAMES.length;
  const nomePasso = WIZARD_STEP_NAMES[currentStep] ?? '';

  return (
    <div className="mb-6 space-y-2">
      <div className="flex gap-1">
        {visiveis.map((stepIndex) => (
          <div
            key={stepIndex}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              stepIndex <= currentStep ? 'bg-accent-lime' : 'bg-gray-200',
            )}
          />
        ))}
      </div>
      <p className="text-center text-sm font-medium text-muted-foreground">
        Passo {passoExibido} de {totalExibido} — {nomePasso}
      </p>
    </div>
  );
}
