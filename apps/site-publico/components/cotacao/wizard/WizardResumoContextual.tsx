'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Building2, Users } from 'lucide-react';
import { useWizard } from './WizardContext';
import { formatDateBR } from './wizard-types';

export function WizardResumoContextual() {
  const { state, passosColapsados, editarPassoColapsado, catalog } = useWizard();

  if (passosColapsados.length === 0) return null;

  const hotel = catalog.hotels.find(
    (h) => h.id === state.hotelId || h.contentId === state.hotelId,
  );

  return (
    <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-800">
        Resumo da sua viagem
      </p>
      <div className="flex flex-wrap gap-2">
        {passosColapsados.includes(0) && state.checkIn && state.checkOut && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 bg-white text-xs"
            onClick={() => editarPassoColapsado(0)}
          >
            <Calendar className="h-3.5 w-3.5" />
            {formatDateBR(state.checkIn)} – {formatDateBR(state.checkOut)}
          </Button>
        )}
        {passosColapsados.includes(1) && state.hotelId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 bg-white text-xs"
            onClick={() => editarPassoColapsado(1)}
          >
            <Building2 className="h-3.5 w-3.5" />
            {hotel?.title ?? `Hotel ${state.hotelId}`}
          </Button>
        )}
        {(passosColapsados.includes(0) || passosColapsados.includes(1)) && (
          <Badge variant="secondary" className="h-8 gap-1 px-2 text-xs font-normal">
            <Users className="h-3.5 w-3.5" />
            {state.adults} adulto{state.adults !== 1 ? 's' : ''}
            {state.children > 0 ? ` · ${state.children} criança(s)` : ''}
          </Badge>
        )}
      </div>
    </div>
  );
}
