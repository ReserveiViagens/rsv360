'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import type { RoteiroPreviewMeta } from '@/lib/montar-roteiro-preview';
import { RoteiroPreviewShell } from '@/components/cotacao/roteiro/RoteiroPreviewShell';
import { ConciergeModal } from '@/components/cotacao/concierge/ConciergeModal';

interface RoteiroData {
  id: number;
  titulo: string;
  clienteNome: string;
  valorTotal: string;
  moeda?: string;
  comparativoCache?: ComparativoItem[];
  exibirComparativo?: boolean;
  conteudo?: {
    dailySchedule?: Array<{
      id?: string;
      day: number;
      title: string;
      description: string;
      image?: string;
      videoUrl?: string;
      actionLabel?: string;
      type?: string;
      mood?: string;
      behaviorTag?: string;
    }>;
    inclusions?: { nights?: number; guests?: number; destination?: string; previewTitle?: string };
    media?: { heroImage?: string };
    previewTitle?: string;
  };
  metadata?: { checkIn?: string; checkOut?: string };
}

type ComparativoItem = {
  titulo: string;
  preco?: number;
  valorTotal?: number;
  fornecedor?: string;
  nomeFornecedor?: string;
  fonte?: string;
};

function formatCurrency(value: string | number, moeda = 'BRL') {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(num || 0);
}

function normalizeComparativo(items: ComparativoItem[]) {
  return items.map((o) => ({
    titulo: o.titulo,
    preco: o.preco ?? o.valorTotal ?? 0,
    fornecedor: o.fornecedor ?? o.nomeFornecedor ?? 'Referência',
  }));
}

function toPreview(data: RoteiroData): RoteiroPreviewMeta {
  const schedule = data.conteudo?.dailySchedule ?? [];
  const nights = data.conteudo?.inclusions?.nights ?? (schedule.length || 1);
  const guests = data.conteudo?.inclusions?.guests ?? 2;

  return {
    title: data.conteudo?.inclusions?.previewTitle ?? data.conteudo?.previewTitle ?? data.titulo,
    nights,
    guests,
    destination: data.conteudo?.inclusions?.destination ?? 'Caldas Novas',
    heroImage: data.conteudo?.media?.heroImage,
    activities: schedule.map((a, i) => ({
      id: a.id ?? `${a.day}-${i}`,
      day: a.day,
      title: a.title,
      description: a.description,
      image: a.image,
      videoUrl: a.videoUrl,
      actionLabel: a.actionLabel,
      type: a.type,
      mood: a.mood as RoteiroPreviewMeta['activities'][0]['mood'],
      behaviorTag: a.behaviorTag,
    })),
  };
}

export function RoteiroPublico({ token }: { token: string }) {
  const [data, setData] = useState<RoteiroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conciergeOpen, setConciergeOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/cotacao/roteiro/${encodeURIComponent(token)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Roteiro não encontrado');
        if (!cancelled) {
          setData(json.data);
          trackCotacaoEvent('cotacao_roteiro_opened', { token, source: 'public' });
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          toast.error((err as Error).message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">{error ?? 'Roteiro não encontrado'}</p>
        <Link href="/cotacao" className="text-primary underline">
          Fazer nova cotação
        </Link>
      </div>
    );
  }

  const total = parseFloat(data.valorTotal) || 0;
  const preview = toPreview(data);
  const comparativo = normalizeComparativo(data.comparativoCache ?? []);
  const showComparativo = Boolean(data.exibirComparativo && comparativo.length > 0);
  const whatsappMsg = encodeURIComponent(
    `Olá! Gostaria de confirmar meu roteiro "${data.titulo}" (token: ${token})`,
  );
  const whatsappUrl = `https://wa.me/5564999999999?text=${whatsappMsg}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/">
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </Link>
          <h1 className="text-lg font-bold">Seu Roteiro</h1>
          <div className="w-6" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <RoteiroPreviewShell
          preview={preview}
          total={total}
          mode="public"
          onConcierge={() => setConciergeOpen(true)}
          whatsappUrl={whatsappUrl}
          showConcierge
        />

        {showComparativo && (
          <section className="mt-8 animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-amber-200 bg-amber-50 p-6 duration-500">
            <h2 className="mb-2 text-lg font-semibold text-amber-900">Referências de mercado</h2>
            <p className="mb-4 text-sm text-amber-800">
              Valores de referência coletados em fontes públicas — apenas para comparação.
            </p>
            <ul className="space-y-3">
              {comparativo.map((o, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">{o.titulo}</p>
                    <p className="text-xs text-slate-500">{o.fornecedor}</p>
                  </div>
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(o.preco, data.moeda ?? 'BRL')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <ConciergeModal
        open={conciergeOpen}
        onClose={() => setConciergeOpen(false)}
        propostaId={data.id}
        clientName={data.clienteNome}
      />
    </div>
  );
}
