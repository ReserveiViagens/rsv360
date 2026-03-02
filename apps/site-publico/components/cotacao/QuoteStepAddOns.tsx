'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Coffee, Bed, UtensilsCrossed } from 'lucide-react';
import type { Hotel } from '@/hooks/useWebsiteData';
import { getHotelEligibleAddOns } from './cotacao-utils';
import type { CotacaoState } from './cotacao-utils';

interface QuoteStepAddOnsProps {
  state: CotacaoState;
  onChange: (updates: Partial<CotacaoState>) => void;
  onNext: () => void;
  onBack: () => void;
  selectedHotels: Hotel[];
}

export function QuoteStepAddOns({
  state,
  onChange,
  onNext,
  onBack,
  selectedHotels,
}: QuoteStepAddOnsProps) {
  const updateAddOn = (hotelId: number | string, key: 'cafeDaManha' | 'roupaDeCama' | 'almoco', value: boolean) => {
    const id = String(hotelId);
    onChange({
      addOns: {
        ...state.addOns,
        [id]: { ...state.addOns[id], [key]: value },
      },
    });
  };

  const hotelsWithAddOns = selectedHotels.filter((h) => {
    const el = getHotelEligibleAddOns(h);
    return el.cafeDaManha || el.roupaDeCama || el.almoco;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extras</CardTitle>
        <p className="text-sm text-muted-foreground">
          Café da manhã, roupa de cama e almoço quando disponíveis no hotel.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {hotelsWithAddOns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum dos hotéis escolhidos tem add-ons disponíveis ou você não selecionou hotéis.
          </p>
        ) : (
          hotelsWithAddOns.map((hotel) => {
            const el = getHotelEligibleAddOns(hotel);
            const id = String(hotel.id);
            const add = state.addOns[id] ?? {};
            return (
              <div key={hotel.id} className="border rounded-lg p-4 space-y-3">
                <p className="font-medium">{hotel.title}</p>
                <div className="flex flex-wrap gap-6">
                  {el.cafeDaManha && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={!!add.cafeDaManha}
                        onCheckedChange={(c) => updateAddOn(hotel.id, 'cafeDaManha', !!c)}
                      />
                      <Coffee className="w-4 h-4" />
                      <span>Café da manhã</span>
                    </label>
                  )}
                  {el.roupaDeCama && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={!!add.roupaDeCama}
                        onCheckedChange={(c) => updateAddOn(hotel.id, 'roupaDeCama', !!c)}
                      />
                      <Bed className="w-4 h-4" />
                      <span>Roupa de cama</span>
                    </label>
                  )}
                  {el.almoco && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={!!add.almoco}
                        onCheckedChange={(c) => updateAddOn(hotel.id, 'almoco', !!c)}
                      />
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>Almoço</span>
                    </label>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Voltar
          </Button>
          <Button onClick={onNext} className="flex-1">
            Próximo: contato
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
