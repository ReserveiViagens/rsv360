'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee } from 'lucide-react';
import { BREAKFAST_OPTIONS } from '@/lib/cotacao-catalog';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import { sortByProfile } from './wizard-behavior';
import { ItineraryCard } from './ItineraryCard';
import { formatBRL } from './wizard-pricing';
import { useWizard } from './WizardContext';
import { countNights } from './wizard-types';

export function WizardStepBreakfast() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const guests = state.adults + state.children;
  const nights = countNights(state.checkIn, state.checkOut) || 1;
  const options = sortByProfile(BREAKFAST_OPTIONS, state.profile);

  const selectBreakfast = (id: string, price: number) => {
    updateState({ breakfastId: state.breakfastId === id ? null : id });
    if (state.breakfastId !== id) {
      trackCotacaoEvent('cotacao_item_selected', { itemType: 'breakfast', itemId: id, price });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Café da manhã
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Escolha 1 opção — cobrado por hóspede/dia ({guests} pessoa{guests !== 1 ? 's' : ''} ×{' '}
            {nights} noite{nights !== 1 ? 's' : ''})
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {options.map((opt) => {
          const total = opt.price * guests * nights;
          return (
            <ItineraryCard
              key={opt.id}
              title={opt.title}
              subtitle={`${opt.description} · ${formatBRL(opt.price)}/pessoa/dia × ${guests} × ${nights} noite${nights !== 1 ? 's' : ''}`}
              image={opt.images[0]}
              images={opt.images}
              price={total}
              isSelected={state.breakfastId === opt.id}
              onSelect={() => selectBreakfast(opt.id, opt.price)}
              behaviorTag={`Para ${guests} pessoa${guests !== 1 ? 's' : ''}`}
              tagColor="green"
            />
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Voltar
        </Button>
        <Button onClick={nextStep} className="flex-1">
          Próximo: kit acomodação
        </Button>
      </div>
    </div>
  );
}
