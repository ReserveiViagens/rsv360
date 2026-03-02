'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import type { Hotel, Ticket, Attraction } from '@/hooks/useWebsiteData';
import {
  COTACAO_DRAFT_KEY,
  initialCotacaoState,
  type CotacaoState,
} from '@/components/cotacao/cotacao-utils';
import { QuoteStepDates } from '@/components/cotacao/QuoteStepDates';
import { QuoteStepProducts } from '@/components/cotacao/QuoteStepProducts';
import { QuoteStepAddOns } from '@/components/cotacao/QuoteStepAddOns';
import { QuoteStepContact } from '@/components/cotacao/QuoteStepContact';
import { QuoteStepReview } from '@/components/cotacao/QuoteStepReview';
import { ErrorMessage } from '@/components/ui/error-message';

const STEPS = 5;
const FETCH_TIMEOUT_MS = 12000;
const FETCH_RETRIES = 2;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadDraft(): Partial<CotacaoState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem(COTACAO_DRAFT_KEY);
    return s ? (JSON.parse(s) as Partial<CotacaoState>) : null;
  } catch {
    return null;
  }
}

function saveDraft(state: CotacaoState) {
  try {
    localStorage.setItem(COTACAO_DRAFT_KEY, JSON.stringify(state));
  } catch {}
}

async function fetchContentWithRetry(url: string, label: string): Promise<any[]> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      return Array.isArray(json?.data) ? json.data : [];
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_RETRIES) {
        await wait(500 * (attempt + 1));
      }
      if (attempt === FETCH_RETRIES) break;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(`Falha ao carregar ${label}: ${String((lastError as Error)?.message || "erro desconhecido")}`);
}

export default function CotacaoPage() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<CotacaoState>(() => {
    const draft = loadDraft();
    if (draft && Object.keys(draft).length > 0) {
      return { ...initialCotacaoState, ...draft };
    }
    return initialCotacaoState;
  });

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadContent = async () => {
    const limit = 100;
    setLoading(true);
    setLoadError(null);
    try {
      const endpoints = [
        { key: "hoteis", label: "hoteis", url: `/api/website/content/hotels?limit=${limit}&status=active` },
        { key: "ingressos", label: "ingressos", url: `/api/website/content/tickets?limit=${limit}&status=active` },
        { key: "atracoes", label: "atracoes", url: `/api/website/content/attractions?limit=${limit}&status=active` },
      ] as const;

      const results: PromiseSettledResult<any[]>[] = [];
      for (const endpoint of endpoints) {
        // Sequencial no cold-start evita timeout simultâneo na compilação das rotas.
        const result = await Promise.allSettled([
          fetchContentWithRetry(endpoint.url, endpoint.label),
        ]);
        results.push(result[0]);
      }

      const failures: string[] = [];
      const nextHotels: Hotel[] = [];
      const nextTickets: Ticket[] = [];
      const nextAttractions: Attraction[] = [];

      results.forEach((result, index) => {
        const endpoint = endpoints[index];
        if (result.status === "fulfilled") {
          if (endpoint.key === "hoteis") nextHotels.push(...(result.value as Hotel[]));
          if (endpoint.key === "ingressos") nextTickets.push(...(result.value as Ticket[]));
          if (endpoint.key === "atracoes") nextAttractions.push(...(result.value as Attraction[]));
        } else {
          failures.push(endpoint.label);
        }
      });

      setHotels(nextHotels);
      setTickets(nextTickets);
      setAttractions(nextAttractions);

      if (failures.length > 0) {
        setLoadError(`Nao foi possivel carregar ${failures.join(", ")} agora.`);
      }
    } catch {
      setHotels([]);
      setTickets([]);
      setAttractions([]);
      setLoadError("Nao foi possivel carregar hoteis, ingressos e atracoes agora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    saveDraft(state);
  }, [state]);

  const updateState = useCallback((updates: Partial<CotacaoState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialCotacaoState);
    setStep(1);
    try {
      localStorage.removeItem(COTACAO_DRAFT_KEY);
    } catch {}
  }, []);

  const selectedHotels = hotels.filter(
    (h) => state.hotelIds.includes(h.id) || state.hotelIds.includes(h.content_id)
  );
  const hotelNames = selectedHotels.map((h) => h.title);
  const ticketNames = (state.ticketIds as (number | string)[]).map((id) => {
    const t = tickets.find((x) => x.id === id || x.content_id === id);
    return t?.title ?? String(id);
  });
  const attractionNames = (state.attractionIds as (number | string)[]).map((id) => {
    const a = attractions.find((x) => x.id === id || x.content_id === id);
    return a?.title ?? String(id);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-muted-foreground">Carregando opções...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Passo {step} de {STEPS}
          </span>
        </div>
        <Progress value={(step / STEPS) * 100} className="mb-6 h-2" />

        {loadError && (
          <div className="mb-4">
            <ErrorMessage error={loadError} />
            <Button variant="outline" size="sm" className="mt-2" onClick={loadContent}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!loadError && hotels.length === 0 && tickets.length === 0 && attractions.length === 0 && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            Nenhum item disponivel no momento. Voce pode seguir com uma cotacao textual (periodo e observacoes).
          </div>
        )}

        {step === 1 && (
          <QuoteStepDates
            state={state}
            onChange={updateState}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <QuoteStepProducts
            state={state}
            onChange={updateState}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            hotels={hotels}
            tickets={tickets}
            attractions={attractions}
            allowSkipSelection={hotels.length === 0 && tickets.length === 0 && attractions.length === 0}
          />
        )}
        {step === 3 && (
          <QuoteStepAddOns
            state={state}
            onChange={updateState}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
            selectedHotels={selectedHotels}
          />
        )}
        {step === 4 && (
          <QuoteStepContact
            state={state}
            onChange={updateState}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <QuoteStepReview
            state={state}
            onBack={() => setStep(4)}
            onReset={resetState}
            hotelNames={hotelNames}
            ticketNames={ticketNames}
            attractionNames={attractionNames}
          />
        )}
      </div>
    </div>
  );
}
