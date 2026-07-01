'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useEntradaContextual } from '@/hooks/useEntradaContextual';
import { useCotacaoLeadAbandono } from '@/hooks/useCotacaoLeadAbandono';
import { WizardProvider, useWizard } from './WizardContext';
import { WizardProgressBar } from './WizardProgressBar';
import { WizardResumoContextual } from './WizardResumoContextual';
import { WizardStickyTotal } from './WizardStickyTotal';
import { WizardStepDates } from './WizardStepDates';
import { WizardStepHotel } from './WizardStepHotel';
import { WizardStepActivities } from './WizardStepActivities';
import { WizardStepAttractions } from './WizardStepAttractions';
import { WizardStepBreakfast } from './WizardStepBreakfast';
import { WizardStepAccommodation } from './WizardStepAccommodation';
import { WizardStepItinerary } from './WizardStepItinerary';
import { WizardStepReview } from './WizardStepReview';
import type { WizardCatalog } from './wizard-types';
import { isValidWizardRange } from './wizard-date-utils';

function WizardContent() {
  const {
    currentStep,
    state,
    catalog,
    setCatalog,
    nextStep,
    resetWizard,
    runningTotal,
    setAvailabilityLoading,
    availabilityLoading,
    availabilityError,
    setAvailabilityError,
    registerRefetchAvailability,
    passosColapsados,
    hotelTravado,
    onHotelIndisponivel,
  } = useWizard();

  const fetchAvailability = useCallback(
    async (datesOverride?: { checkIn: string; checkOut: string }) => {
      const checkIn = datesOverride?.checkIn ?? state.checkIn;
      const checkOut = datesOverride?.checkOut ?? state.checkOut;
      if (!checkIn || !checkOut) return;

      setAvailabilityLoading(true);
      setAvailabilityError(null);
      try {
        const params = new URLSearchParams({
          checkIn,
          checkOut,
          adults: String(state.adults),
          children: String(state.children),
        });
        const res = await fetch(`/api/cotacao/disponibilidade?${params}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erro ao verificar disponibilidade');

        const nextCatalog: WizardCatalog = {
          hotels: json.data?.hotels ?? [],
          tickets: json.data?.tickets ?? [],
          attractions: json.data?.attractions ?? [],
          configuracoesPainel: json.data?.configuracoesPainel,
        };
        setCatalog(nextCatalog);

        if (hotelTravado && state.hotelId != null) {
          const match = nextCatalog.hotels.find(
            (h) =>
              (h.id === state.hotelId || h.contentId === state.hotelId) && h.available,
          );
          if (!match) onHotelIndisponivel();
        }

        const availableCount =
          nextCatalog.hotels.filter((h) => h.available).length +
          nextCatalog.tickets.filter((t) => t.available).length;

        if (availableCount === 0) {
          toast.info('Nenhum item disponível', {
            description: 'Tente alterar as datas ou número de hóspedes.',
          });
        }
      } catch (err) {
        const msg = (err as Error).message || 'Falha na disponibilidade';
        setAvailabilityError(msg);
        toast.error(msg, { description: 'Usando catálogo estático como fallback.' });
        try {
          const [h, t, a] = await Promise.all([
            fetch('/api/website/content/hotels?limit=50&status=active').then((r) => r.json()),
            fetch('/api/website/content/tickets?limit=50&status=active').then((r) => r.json()),
            fetch('/api/website/content/attractions?limit=50&status=active').then((r) => r.json()),
          ]);
          const mapFallback = (
            items: Array<Record<string, unknown>>,
            type: 'hotel' | 'ticket' | 'attraction',
          ) =>
            (items ?? []).map((item) => {
              const meta = (item.metadata ?? {}) as Record<string, unknown>;
              const images = Array.isArray(meta.images)
                ? (meta.images as string[])
                : Array.isArray(item.images)
                  ? (item.images as string[])
                  : [];
              return {
                id: item.id as number | string,
                contentId: item.content_id as string,
                type,
                title: item.title as string,
                description: item.description as string,
                price: (meta.price as number) ?? (item.price as number) ?? 0,
                location: meta.location as string,
                images,
                metadata: meta,
                available: true,
              };
            });
          const fallbackCatalog = {
            hotels: mapFallback(h.data ?? [], 'hotel'),
            tickets: mapFallback(t.data ?? [], 'ticket'),
            attractions: mapFallback(a.data ?? [], 'attraction'),
          };
          setCatalog(fallbackCatalog);

          if (hotelTravado && state.hotelId != null) {
            const match = fallbackCatalog.hotels.find(
              (h) => h.id === state.hotelId || h.contentId === state.hotelId,
            );
            if (!match) onHotelIndisponivel();
          }
        } catch {
          /* sem fallback */
        }
      } finally {
        setAvailabilityLoading(false);
      }
    },
    [
      state.checkIn,
      state.checkOut,
      state.adults,
      state.children,
      state.hotelId,
      hotelTravado,
      setCatalog,
      setAvailabilityLoading,
      setAvailabilityError,
      onHotelIndisponivel,
    ],
  );

  useEffect(() => {
    registerRefetchAvailability(fetchAvailability);
  }, [fetchAvailability, registerRefetchAvailability]);

  useEffect(() => {
    if (
      state.checkIn &&
      state.checkOut &&
      catalog.hotels.length === 0 &&
      !availabilityLoading &&
      currentStep >= 1
    ) {
      void fetchAvailability();
    }
  }, [
    currentStep,
    state.checkIn,
    state.checkOut,
    catalog.hotels.length,
    availabilityLoading,
    fetchAvailability,
  ]);

  const handleDatesNext = async () => {
    if (!isValidWizardRange(state.checkIn, state.checkOut)) {
      toast.error('Informe check-in e check-out válidos');
      return;
    }
    if (state.adults < 1) {
      toast.error('Informe ao menos 1 adulto');
      return;
    }
    if (catalog.hotels.length === 0) {
      await fetchAvailability();
    }
    nextStep();
  };

  const showStickyTotal = currentStep >= 1 && currentStep <= 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`mx-auto max-w-2xl px-4 py-6 ${
          showStickyTotal ? 'pb-28' : currentStep === 6 ? 'pb-8' : 'pb-12'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={resetWizard}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Reiniciar cotação
          </Button>
        </div>

        <WizardProgressBar currentStep={currentStep} passosColapsados={passosColapsados} />
        <WizardResumoContextual />

        {availabilityError && currentStep > 0 && (
          <div className="mb-4">
            <ErrorMessage error={availabilityError} />
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void fetchAvailability()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {currentStep === 0 && <WizardStepDates onNextClick={handleDatesNext} />}
        {currentStep === 1 && <WizardStepHotel />}
        {currentStep === 2 && <WizardStepActivities />}
        {currentStep === 3 && <WizardStepAttractions />}
        {currentStep === 4 && <WizardStepBreakfast />}
        {currentStep === 5 && <WizardStepAccommodation />}
        {currentStep === 6 && <WizardStepItinerary />}
        {currentStep === 7 && <WizardStepReview />}
      </div>

      <WizardStickyTotal total={runningTotal} visible={showStickyTotal} />
    </div>
  );
}

function WizardWithEntrada() {
  const searchParams = useSearchParams();
  const bootstrap = useEntradaContextual(searchParams);

  return (
    <WizardProvider bootstrap={bootstrap}>
      <LeadAbandonoListener entrada={bootstrap.ctx} />
      <WizardContent />
    </WizardProvider>
  );
}

function LeadAbandonoListener({ entrada }: { entrada: ReturnType<typeof useEntradaContextual>['ctx'] }) {
  useCotacaoLeadAbandono(entrada);
  return null;
}

export function WizardPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-muted-foreground">
          Carregando cotação…
        </div>
      }
    >
      <WizardWithEntrada />
    </Suspense>
  );
}

export default WizardPageWrapper;
