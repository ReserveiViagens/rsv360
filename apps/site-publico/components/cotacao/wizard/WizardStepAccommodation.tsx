'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { revalidarKitSelecionado, KIT_CAPACIDADE_FALLBACK, resolveKitCapacidadeMax } from '@rsv360/shared';
import { getAccommodationKitById, ACCOMMODATION_ITEMS, ACCOMMODATION_KITS } from '@/lib/cotacao-catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BedDouble, Users } from 'lucide-react';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import { sortByProfile } from './wizard-behavior';
import { ItineraryCard } from './ItineraryCard';
import { useWizard } from './WizardContext';
import { cn } from '@/lib/utils';

function kitCapacidadeFromCatalog(kitId: string): number {
  return resolveKitCapacidadeMax(kitId, KIT_CAPACIDADE_FALLBACK[kitId]);
}

export function WizardStepAccommodation() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const kits = sortByProfile(ACCOMMODATION_KITS, state.profile);
  const guests = state.adults + state.children;
  const revalidado = useRef(false);

  useEffect(() => {
    if (!state.accommodationKitId) return;
    const kit = getAccommodationKitById(state.accommodationKitId);
    const capacidadeMax = kit
      ? kitCapacidadeFromCatalog(kit.id)
      : resolveKitCapacidadeMax(state.accommodationKitId);
    const { limpar, sugestaoKitId } = revalidarKitSelecionado(
      state.accommodationKitId,
      guests,
      capacidadeMax,
    );
    if (limpar) {
      updateState({ accommodationKitId: null });
      const sugestao = sugestaoKitId
        ? getAccommodationKitById(sugestaoKitId)?.title ?? sugestaoKitId
        : 'outro kit';
      if (!revalidado.current) {
        revalidado.current = true;
        toast.info('Kit incompatível com o número de hóspedes', {
          description: `Limpamos a seleção. Considere ${sugestao} ou itens avulsos.`,
          duration: 6000,
        });
      }
    }
  }, [state.accommodationKitId, guests, updateState]);

  const toggleItem = (id: string, price: number) => {
    const ids = state.accommodationItemIds.includes(id)
      ? state.accommodationItemIds.filter((x) => x !== id)
      : [...state.accommodationItemIds, id];
    updateState({ accommodationItemIds: ids, accommodationMode: 'items', accommodationKitId: null });
    if (!state.accommodationItemIds.includes(id)) {
      trackCotacaoEvent('cotacao_item_selected', { itemType: 'accommodation_item', itemId: id, price });
    }
  };

  const selectKit = (id: string, price: number) => {
    updateState({
      accommodationKitId: state.accommodationKitId === id ? null : id,
      accommodationMode: 'kit',
      accommodationItemIds: [],
    });
    if (state.accommodationKitId !== id) {
      trackCotacaoEvent('cotacao_item_selected', { itemType: 'accommodation_kit', itemId: id, price });
    }
  };

  const selectedKitLimit = state.accommodationKitId
    ? kitCapacidadeFromCatalog(state.accommodationKitId)
    : null;
  const kitOverCapacity =
    selectedKitLimit != null && guests > selectedKitLimit;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="w-5 h-5" />
            Kit de acomodação
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Escolha um kit pronto ou monte item a item — valores por estadia ou por unidade
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-accent-lime/10 px-3 py-2 text-sm">
            <Users className="h-4 w-4 text-accent-lime" />
            <span>
              Para sua viagem de <strong>{guests} pessoa{guests !== 1 ? 's' : ''}</strong>
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={state.accommodationMode === 'kit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateState({ accommodationMode: 'kit' })}
            >
              Kits
            </Button>
            <Button
              type="button"
              variant={state.accommodationMode === 'items' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateState({ accommodationMode: 'items' })}
            >
              Itens avulsos
            </Button>
          </div>
        </CardContent>
      </Card>

      {state.accommodationMode === 'kit' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {kits.map((kit) => {
            const limit = kitCapacidadeFromCatalog(kit.id);
            const tooSmall = guests > limit;
            return (
              <ItineraryCard
                key={kit.id}
                title={kit.title}
                subtitle={`${kit.description} · até ${limit} pessoa${limit !== 1 ? 's' : ''}`}
                image={kit.images[0]}
                images={kit.images}
                price={kit.price}
                isSelected={state.accommodationKitId === kit.id}
                onSelect={() => selectKit(kit.id, kit.price)}
                behaviorTag={tooSmall ? `Indicado para até ${limit} pessoas` : undefined}
                tagColor="blue"
              />
            );
          })}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {ACCOMMODATION_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id, item.price)}
              className={cn(
                'flex items-center justify-between rounded-lg border p-4 text-left transition-colors',
                state.accommodationItemIds.includes(item.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <div>
                <Label className="font-medium">{item.title}</Label>
                <p className="text-xs text-muted-foreground">
                  R$ {item.price.toFixed(2)}/un · cobrado por unidade (estadia)
                </p>
              </div>
              <span className="font-bold">R$ {item.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}

      {kitOverCapacity && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          O kit selecionado é indicado para até {selectedKitLimit} pessoas. Considere o Kit Família ou itens avulsos.
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Voltar
        </Button>
        <Button onClick={nextStep} className="flex-1">
          Ver meu roteiro
        </Button>
      </div>
    </div>
  );
}
