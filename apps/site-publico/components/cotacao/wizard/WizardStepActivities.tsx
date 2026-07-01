'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket } from 'lucide-react';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import { getBehaviorBadge, sortCatalogItems } from './wizard-behavior';
import { ItineraryCard } from './ItineraryCard';
import { useWizard } from './WizardContext';
import { countNights } from './wizard-types';
import { wizardStateToDateRange } from './wizard-date-utils';

const FALLBACK =
  'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop';

function ActivitiesSkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export function WizardStepActivities() {
  const {
    state,
    catalog,
    updateState,
    nextStep,
    prevStep,
    updateTravelDates,
    availabilityLoading,
  } = useWizard();
  const tickets = sortCatalogItems(catalog.tickets, state.profile);
  const guests = state.adults + state.children;
  const nights = countNights(state.checkIn, state.checkOut) || 0;
  const dateRange = wizardStateToDateRange(state.checkIn, state.checkOut);

  const toggleTicket = (id: number | string, price: number) => {
    const ids = state.ticketIds.includes(id)
      ? state.ticketIds.filter((x) => x !== id)
      : [...state.ticketIds, id];
    updateState({ ticketIds: ids });
    if (!state.ticketIds.includes(id)) {
      trackCotacaoEvent('cotacao_item_selected', { itemType: 'ticket', itemId: id, price });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Diversão — Parques e ingressos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione um ou mais parques ({guests} pessoa{guests !== 1 ? 's' : ''})
          </p>
        </CardHeader>
      </Card>

      <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
        <p className="text-xs text-muted-foreground">
          Período da viagem{nights > 0 ? ` · ${nights} noite${nights !== 1 ? 's' : ''}` : ''}
        </p>
        <DateRangePicker
          variant="compact"
          value={dateRange}
          onChange={updateTravelDates}
          disabled={availabilityLoading}
        />
      </div>

      {availabilityLoading ? (
        <ActivitiesSkeletonGrid />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.map((ticket) => {
            const meta = ticket.metadata ?? {};
            const images = ticket.images.length ? ticket.images : [FALLBACK];
            const selected =
              state.ticketIds.includes(ticket.id) ||
              state.ticketIds.includes(ticket.contentId!);
            return (
              <ItineraryCard
                key={String(ticket.id)}
                title={ticket.title}
                subtitle={ticket.description}
                image={images[0]}
                images={images}
                price={ticket.price * guests}
                location={ticket.location}
                isSelected={selected}
                onSelect={() => ticket.available && toggleTicket(ticket.id, ticket.price)}
                behaviorTag={getBehaviorBadge(ticket, state.profile)}
                hasVideo={Boolean(meta.videoUrl)}
                videoUrl={meta.videoUrl as string | undefined}
                unavailable={!ticket.available}
                unavailableReason={ticket.unavailableReason}
              />
            );
          })}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Voltar
        </Button>
        <Button onClick={nextStep} className="flex-1" disabled={availabilityLoading}>
          Próximo: atrações
        </Button>
      </div>
    </div>
  );
}
