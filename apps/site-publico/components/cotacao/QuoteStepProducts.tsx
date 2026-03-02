'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Hotel, Ticket, MapPin } from 'lucide-react';
import type { Hotel as HotelType, Ticket as TicketType, Attraction } from '@/hooks/useWebsiteData';
import type { CotacaoState } from './cotacao-utils';

interface QuoteStepProductsProps {
  state: CotacaoState;
  onChange: (updates: Partial<CotacaoState>) => void;
  onNext: () => void;
  onBack: () => void;
  hotels: HotelType[];
  tickets: TicketType[];
  attractions: Attraction[];
  allowSkipSelection?: boolean;
}

function toggleId(ids: (number | string)[], id: number | string): (number | string)[] {
  const key = typeof id === 'number' ? id : String(id);
  if (ids.includes(id) || ids.includes(key)) {
    return ids.filter((x) => (typeof x === 'number' ? x : String(x)) !== key);
  }
  return [...ids, id];
}

export function QuoteStepProducts({
  state,
  onChange,
  onNext,
  onBack,
  hotels,
  tickets,
  attractions,
  allowSkipSelection = false,
}: QuoteStepProductsProps) {
  const [searchHotel, setSearchHotel] = useState('');
  const [searchTicket, setSearchTicket] = useState('');
  const [searchAttr, setSearchAttr] = useState('');

  const hasAny =
    state.hotelIds.length > 0 || state.ticketIds.length > 0 || state.attractionIds.length > 0;

  const filter = (list: { title: string }[], q: string) =>
    !q.trim()
      ? list
      : list.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));

  const filteredHotels = filter(hotels, searchHotel);
  const filteredTickets = filter(tickets, searchTicket);
  const filteredAttractions = filter(attractions, searchAttr);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monte suas férias</CardTitle>
        <p className="text-sm text-muted-foreground">
          Escolha hotéis, ingressos e atrações. Pelo menos um item.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Hotel className="w-4 h-4" />
            <span className="font-medium">Hotéis</span>
          </div>
          <Input
            placeholder="Buscar hotel..."
            value={searchHotel}
            onChange={(e) => setSearchHotel(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
            {filteredHotels.slice(0, 20).map((h) => {
              const selected = state.hotelIds.includes(h.id) || state.hotelIds.includes(h.content_id);
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      hotelIds: toggleId(state.hotelIds, h.id),
                    })
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selected ? 'bg-blue-100 border border-blue-300' : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  {h.title}
                  {h.price != null && (
                    <span className="text-muted-foreground ml-2">
                      R$ {h.price.toLocaleString('pt-BR')}
                    </span>
                  )}
                </button>
              );
            })}
            {filteredHotels.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">Nenhum hotel encontrado.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-4 h-4" />
            <span className="font-medium">Ingressos</span>
          </div>
          <Input
            placeholder="Buscar ingresso..."
            value={searchTicket}
            onChange={(e) => setSearchTicket(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
            {filteredTickets.slice(0, 20).map((t) => {
              const selected = state.ticketIds.includes(t.id) || state.ticketIds.includes(t.content_id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      ticketIds: toggleId(state.ticketIds, t.id),
                    })
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selected ? 'bg-blue-100 border border-blue-300' : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  {t.title}
                  <span className="text-muted-foreground ml-2">
                    R$ {t.price.toLocaleString('pt-BR')}
                  </span>
                </button>
              );
            })}
            {filteredTickets.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">Nenhum ingresso encontrado.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Atrações</span>
          </div>
          <Input
            placeholder="Buscar atração..."
            value={searchAttr}
            onChange={(e) => setSearchAttr(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
            {filteredAttractions.slice(0, 20).map((a) => {
              const selected =
                state.attractionIds.includes(a.id) || state.attractionIds.includes(a.content_id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      attractionIds: toggleId(state.attractionIds, a.id),
                    })
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selected ? 'bg-blue-100 border border-blue-300' : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  {a.title}
                  <span className="text-muted-foreground ml-2">
                    R$ {a.price.toLocaleString('pt-BR')}
                  </span>
                </button>
              );
            })}
            {filteredAttractions.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">Nenhuma atração encontrada.</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Voltar
          </Button>
          <Button onClick={onNext} disabled={!hasAny && !allowSkipSelection} className="flex-1">
            Próximo: add-ons
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
