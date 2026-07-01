'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Shield } from 'lucide-react';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import { getBehaviorBadge, sortCatalogItems } from './wizard-behavior';
import { ItineraryCard } from './ItineraryCard';
import { TRAVEL_INSURANCE_PRICE_PER_GUEST, formatBRL } from './wizard-pricing';
import { useWizard } from './WizardContext';
import { cn } from '@/lib/utils';

const FALLBACK =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop';

const INSURANCE_IMG =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop';

export function WizardStepAttractions() {
  const { state, catalog, updateState, nextStep, prevStep } = useWizard();
  const attractions = sortCatalogItems(catalog.attractions, state.profile);
  const guests = state.adults + state.children;
  const insuranceTotal = TRAVEL_INSURANCE_PRICE_PER_GUEST * guests;

  const toggleAttraction = (id: number | string, price: number) => {
    const ids = state.attractionIds.includes(id)
      ? state.attractionIds.filter((x) => x !== id)
      : [...state.attractionIds, id];
    updateState({ attractionIds: ids });
    if (!state.attractionIds.includes(id)) {
      trackCotacaoEvent('cotacao_item_selected', { itemType: 'attraction', itemId: id, price });
    }
  };

  const toggleInsurance = () => {
    const next = !state.travelInsurance;
    updateState({ travelInsurance: next });
    if (next) {
      trackCotacaoEvent('cotacao_item_selected', {
        itemType: 'travel_insurance',
        price: TRAVEL_INSURANCE_PRICE_PER_GUEST,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Atrações locais
          </CardTitle>
          <p className="text-sm text-muted-foreground">Opcional — enriqueça seu roteiro</p>
        </CardHeader>
      </Card>

      <Card
        className={cn(
          'cursor-pointer border-2 transition-colors',
          state.travelInsurance ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300',
        )}
        onClick={toggleInsurance}
      >
        <CardContent className="flex gap-4 pt-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
            <img src={INSURANCE_IMG} alt="Seguro viagem" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="font-semibold">Seguro Assistência Local</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Cobertura para acidentes leves, insolação e emergências em parques aquáticos — ideal em Caldas
              Novas.
            </p>
            <p className="mt-2 text-sm font-bold text-primary">
              {formatBRL(insuranceTotal)} · {formatBRL(TRAVEL_INSURANCE_PRICE_PER_GUEST)}/pessoa (
              {guests} pessoa{guests !== 1 ? 's' : ''})
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {attractions.map((attr) => {
          const meta = attr.metadata ?? {};
          const images = attr.images.length ? attr.images : [FALLBACK];
          const selected =
            state.attractionIds.includes(attr.id) ||
            (attr.contentId ? state.attractionIds.includes(attr.contentId) : false);
          return (
            <ItineraryCard
              key={String(attr.id)}
              title={attr.title}
              subtitle={attr.description}
              image={images[0]}
              images={images}
              price={attr.price * guests}
              location={attr.location}
              isSelected={selected}
              onSelect={() => attr.available && toggleAttraction(attr.id, attr.price)}
              behaviorTag={getBehaviorBadge(attr, state.profile)}
              hasVideo={Boolean(meta.videoUrl)}
              videoUrl={meta.videoUrl as string | undefined}
              unavailable={!attr.available}
              unavailableReason={attr.unavailableReason}
              selectLabel={attr.price === 0 ? 'Incluir grátis' : 'Selecionar'}
            />
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Voltar
        </Button>
        <Button onClick={nextStep} className="flex-1">
          Próximo: café da manhã
        </Button>
      </div>
    </div>
  );
}
