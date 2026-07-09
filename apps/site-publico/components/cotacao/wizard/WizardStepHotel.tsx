'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown, Sparkles } from 'lucide-react';
import type { CardArquetipoPasso2 } from '@rsv360/shared';
import { formatAcomodacaoConfigLabel } from '@rsv360/shared';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import { getBehaviorBadge, sortCatalogItems } from './wizard-behavior';
import { ItineraryCard } from './ItineraryCard';
import { formatBRL, sumUpgradeVaranda, sumWizardAddons, type WizardAddonPricing } from './wizard-pricing';
import { useWizard } from './WizardContext';
import { countNights, formatDateBR } from './wizard-types';
import { cn } from '@/lib/utils';

const FALLBACK =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop';

export function WizardStepHotel() {
  const {
    state,
    catalog,
    updateState,
    nextStep,
    prevStep,
    goToStep,
    hotelTravado,
    unlockHotelTravado,
  } = useWizard();
  const nights = countNights(state.checkIn, state.checkOut);
  const hotels = sortCatalogItems(catalog.hotels, state.profile);
  const permitirApenasHotel = catalog.configuracoesPainel?.permitirApenasHotel ?? true;
  const selectedHotel = hotels.find(
    (h) => h.id === state.hotelId || h.contentId === state.hotelId,
  );

  const [arquetipoCards, setArquetipoCards] = useState<CardArquetipoPasso2[]>([]);
  const [fallbackHotelUnico, setFallbackHotelUnico] = useState(true);
  const [addons, setAddons] = useState<WizardAddonPricing[]>([]);
  const [loadingAcomod, setLoadingAcomod] = useState(false);

  const hotelRef = state.hotelId != null ? String(state.hotelId) : null;
  const hotelTitulo = selectedHotel?.title ?? null;

  const loadAcomodacoes = useCallback(async () => {
    if (!hotelRef) {
      setArquetipoCards([]);
      setFallbackHotelUnico(true);
      return;
    }
    setLoadingAcomod(true);
    try {
      const params = new URLSearchParams({
        hotelId: hotelRef,
        adults: String(state.adults),
        children: String(state.children),
        hospedes: String(state.adults + state.children),
        perfil: state.profile,
      });
      if (hotelTitulo) params.set('titulo', hotelTitulo);
      const res = await fetch(`/api/cotacao/acomodacoes/disponiveis?${params}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setArquetipoCards(json.data?.cards ?? []);
        setFallbackHotelUnico(Boolean(json.data?.fallbackHotelUnico ?? true));
      } else {
        setArquetipoCards([]);
        setFallbackHotelUnico(true);
      }
    } catch {
      setArquetipoCards([]);
      setFallbackHotelUnico(true);
    } finally {
      setLoadingAcomod(false);
    }
  }, [hotelRef, hotelTitulo, state.adults, state.children, state.profile]);

  useEffect(() => {
    void loadAcomodacoes();
  }, [loadAcomodacoes]);

  useEffect(() => {
    void fetch('/api/cotacao/addons')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAddons(
            json.data.map(
              (a: { id: number; precoTipo: string; valor: string; nome: string; descricao?: string }) => ({
                id: a.id,
                nome: a.nome,
                descricao: a.descricao,
                precoTipo: a.precoTipo,
                valor: Number(a.valor),
              }),
            ),
          );
        }
      })
      .catch(() => setAddons([]));
  }, []);

  const hotelsParaExibir =
    hotelTravado && selectedHotel ? [selectedHotel] : hotels;

  const toggleHotel = (id: number | string, price: number) => {
    if (hotelTravado) return;
    const selected = state.hotelId === id ? null : id;
    updateState({
      hotelId: selected,
      selectedAcomodacaoId: null,
      suiteUpgrade: selected ? state.suiteUpgrade : false,
      upgradeVaranda: false,
      upgradeVarandaValor: 0,
    });
    if (selected) {
      trackCotacaoEvent('cotacao_item_selected', { itemType: 'hotel', itemId: id, price });
    }
  };

  const selectArquetipo = (card: CardArquetipoPasso2) => {
    const acc = card.acomodacao;
    const canUpgrade = acc.upgradeVarandaDisponivel === true;
    updateState({
      selectedAcomodacaoId: Number(acc.id),
      upgradeVaranda: canUpgrade ? state.upgradeVaranda : false,
      upgradeVarandaValor: canUpgrade ? Number(acc.upgradeVarandaValor ?? 80) : 0,
    });
    trackCotacaoEvent('cotacao_item_selected', {
      itemType: 'acomodacao_arquetipo',
      itemId: card.acomodacao.id,
      price: card.acomodacao.precoDiaria,
      lastAction: card.arquetipo.id,
    });
  };

  const toggleAddon = (addonId: number) => {
    const ids = state.wizardAddonIds.includes(addonId)
      ? state.wizardAddonIds.filter((x) => x !== addonId)
      : [...state.wizardAddonIds, addonId];
    const suiteMaster = addons.find((a) => a.id === addonId);
    updateState({
      wizardAddonIds: ids,
      suiteUpgrade: suiteMaster?.precoTipo === 'por_noite' ? ids.includes(addonId) : state.suiteUpgrade,
    });
  };

  const handleApenasHotel = () => {
    if (!state.hotelId) return;
    updateState({ hotelOnlyFlow: true, ticketIds: [], attractionIds: [] });
    goToStep(4);
    trackCotacaoEvent('cotacao_item_selected', { itemType: 'hotel_only_flow', lastAction: 'skip_tickets' });
  };

  const handleNext = () => {
    updateState({ hotelOnlyFlow: false });
    nextStep();
  };

  const guests = state.adults + state.children;
  const showArquetipos = !fallbackHotelUnico && arquetipoCards.length > 0 && state.hotelId;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Escolha seu hotel
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {hotelTravado
              ? 'Hotel pré-selecionado a partir da vitrine'
              : 'Selecione 1 hotel para sua estadia'}
          </p>
          {hotelTravado && selectedHotel && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge className="bg-emerald-600 hover:bg-emerald-600">Escolhido na vitrine</Badge>
              <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={unlockHotelTravado}>
                Trocar hotel
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {(!showArquetipos || !state.hotelId) && (
        <div className="grid gap-4 md:grid-cols-2">
          {hotelsParaExibir.map((hotel) => {
            const meta = hotel.metadata ?? {};
            const images = hotel.images.length ? hotel.images : [FALLBACK];
            const scarcity = meta.scarcity as { unitsLeft?: number } | undefined;
            const social = meta.socialProof as { bookings24h?: number } | undefined;
            const isSelected =
              state.hotelId === hotel.id || state.hotelId === hotel.contentId;
            return (
              <ItineraryCard
                key={String(hotel.id)}
                title={hotel.title}
                subtitle={`${nights} noite${nights !== 1 ? 's' : ''} (${formatDateBR(state.checkIn)} a ${formatDateBR(state.checkOut)})`}
                image={images[0]}
                images={images}
                price={hotel.price * Math.max(nights, 1)}
                location={hotel.location}
                isSelected={isSelected}
                onSelect={() => (!hotel.available || hotelTravado ? undefined : toggleHotel(hotel.id, hotel.price))}
                behaviorTag={getBehaviorBadge(hotel, state.profile)}
                tagColor={state.profile === 'casal' ? 'purple' : 'green'}
                hasVideo={Boolean(meta.videoUrl)}
                videoUrl={meta.videoUrl as string | undefined}
                showPremium={Boolean(meta.premiumLabel)}
                premiumLabel={meta.premiumLabel as string | undefined}
                availableUnits={scarcity?.unitsLeft}
                recentBookings={social?.bookings24h}
                unavailable={!hotel.available}
                unavailableReason={hotel.unavailableReason}
              />
            );
          })}
        </div>
      )}

      {loadingAcomod && state.hotelId && (
        <p className="text-center text-sm text-muted-foreground">Carregando opções de acomodação…</p>
      )}

      {showArquetipos && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-800">Opções para sua viagem</p>
          <div className="grid gap-4 md:grid-cols-2">
            {arquetipoCards.map((card) => {
              const acc = card.acomodacao;
              const selected = state.selectedAcomodacaoId === Number(acc.id);
              return (
                <Card
                  key={card.arquetipo.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    selected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-gray-300',
                  )}
                  onClick={() => selectArquetipo(card)}
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{acc.titulo}</p>
                        <p className="text-xs text-muted-foreground">{card.arquetipo.label}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {acc.premiumAncora && (
                          <Badge className="bg-amber-600 hover:bg-amber-600">Premium</Badge>
                        )}
                        <Badge variant={card.badge === 'Recomendado' ? 'default' : 'secondary'}>
                          {card.badge}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {formatAcomodacaoConfigLabel(acc.configSala, acc.configBanheiro, acc.quartos, acc.capacidadeMax)}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {formatBRL(acc.precoDiaria * Math.max(nights, 1))}
                      <span className="text-xs font-normal text-muted-foreground"> / estadia</span>
                    </p>
                    {acc.upgradeVarandaDisponivel && (
                      <p className="text-xs text-emerald-700">
                        Opção: varanda/vista +{formatBRL(Number(acc.upgradeVarandaValor ?? 80))}/noite
                      </p>
                    )}
                    {card.acomodacao.difere.length > 0 && (
                      <p className="text-xs text-amber-800">{card.acomodacao.difere[0]}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {(() => {
        const selectedCard = arquetipoCards.find(
          (c) => Number(c.acomodacao.id) === state.selectedAcomodacaoId,
        );
        const acc = selectedCard?.acomodacao;
        if (!acc?.upgradeVarandaDisponivel) return null;
        const valor = Number(acc.upgradeVarandaValor ?? state.upgradeVarandaValor ?? 80);
        const addonTotal = sumUpgradeVaranda(true, valor, Math.max(nights, 1));
        return (
          <Card className="border-emerald-200 bg-emerald-50/60">
            <CardContent className="pt-4">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left"
                onClick={() =>
                  updateState({
                    upgradeVaranda: !state.upgradeVaranda,
                    upgradeVarandaValor: valor,
                  })
                }
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-gray-900">Adicionar varanda/vista</p>
                    <p className="text-xs text-muted-foreground">
                      Upgrade opcional nesta unidade — você decide
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +{formatBRL(addonTotal)} ({formatBRL(valor)} / noite)
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border-2',
                    state.upgradeVaranda
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-gray-300',
                  )}
                >
                  {state.upgradeVaranda && <ChevronDown className="h-4 w-4 rotate-180" />}
                </div>
              </button>
            </CardContent>
          </Card>
        );
      })()}

      {selectedHotel && addons.length > 0 && (
        <div className="space-y-2">
          {addons.map((addon) => {
            const active = state.wizardAddonIds.includes(addon.id);
            const addonTotal = sumWizardAddons([addon], [addon.id], Math.max(nights, 1), guests);
            return (
              <Card key={addon.id} className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left"
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-gray-900">{addon.nome ?? `Add-on #${addon.id}`}</p>
                        {addon.descricao && (
                          <p className="text-xs text-muted-foreground">{addon.descricao}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          +{formatBRL(addonTotal)} ({addon.precoTipo.replace(/_/g, ' ')})
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border-2',
                        active ? 'border-primary bg-primary text-white' : 'border-gray-300',
                      )}
                    >
                      {active && <ChevronDown className="h-4 w-4 rotate-180" />}
                    </div>
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedHotel && addons.length === 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => updateState({ suiteUpgrade: !state.suiteUpgrade })}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-gray-900">Upgrade Suíte Master</p>
                  <p className="text-sm text-muted-foreground">Mais conforto e vista premium</p>
                </div>
              </div>
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2',
                  state.suiteUpgrade ? 'border-primary bg-primary text-white' : 'border-gray-300',
                )}
              >
                {state.suiteUpgrade && <ChevronDown className="h-4 w-4 rotate-180" />}
              </div>
            </button>
          </CardContent>
        </Card>
      )}

      {hotels.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nenhum hotel disponível para estas datas.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Voltar
        </Button>
        {permitirApenasHotel && state.hotelId && (
          <Button variant="secondary" onClick={handleApenasHotel} className="flex-1">
            Apenas hotel
          </Button>
        )}
        <Button
          onClick={handleNext}
          className="flex-1"
          disabled={!state.hotelId || (showArquetipos && !state.selectedAcomodacaoId)}
        >
          Próximo: diversão
        </Button>
      </div>
    </div>
  );
}
