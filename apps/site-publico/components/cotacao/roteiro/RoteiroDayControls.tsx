'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoteiroDayControlsProps {
  activeDay: number;
  totalDays: number;
  onNavigate: (day: number) => void;
  disabled?: boolean;
}

export function RoteiroDayControls({
  activeDay,
  totalDays,
  onNavigate,
  disabled = false,
}: RoteiroDayControlsProps) {
  const atFirst = activeDay <= 1;
  const atLast = activeDay >= totalDays;

  return (
    <div className="mt-6 flex items-center justify-between gap-2 px-2">
      <Button
        type="button"
        variant="outline"
        data-testid="roteiro-day-prev"
        disabled={disabled || atFirst}
        onClick={() => onNavigate(activeDay - 1)}
        className="rounded-full px-4 sm:px-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Anterior
      </Button>

      <span
        className="text-center text-sm font-medium text-muted-foreground"
        data-testid="roteiro-day-indicator"
      >
        Dia {activeDay} de {totalDays}
      </span>

      <Button
        type="button"
        variant="default"
        data-testid="roteiro-day-next"
        disabled={disabled || atLast}
        onClick={() => onNavigate(activeDay + 1)}
        className="rounded-full px-4 sm:px-6"
      >
        Próximo
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}
