'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import AnfitriaoRoleGuard from '../../../../components/AnfitriaoRoleGuard';
import {
  AnfitriaoMonthCalendar,
  type CalendarioDiaView,
} from '../../../../components/anfitriao/AnfitriaoMonthCalendar';
import { useAnfitriaoCalendario } from '@/hooks/useAnfitriao';
import { fase1Api } from '@/lib/fase1-api';

export default function AnfitriaoDisponibilidadePage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const [de, setDe] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [ate, setAte] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useAnfitriaoCalendario(id, de, ate);
  const dias = useMemo(
    () => (data?.data ?? []) as CalendarioDiaView[],
    [data?.data],
  );
  const loading = isLoading || isFetching || busy;

  function toggleSelect(data: string, estado: CalendarioDiaView['estado']) {
    if (estado === 'reservado') return;
    setSelectedDates((prev) =>
      prev.includes(data) ? prev.filter((d) => d !== data) : [...prev, data],
    );
  }

  async function runBulk(action: 'bloquear' | 'desbloquear' | 'preco') {
    if (!id || selectedDates.length === 0) return;
    setErro(null);
    setMsg(null);
    setBusy(true);
    try {
      if (action === 'bloquear') {
        await fase1Api.anfitriaoBulkBloquear(id, selectedDates);
        setMsg(`${selectedDates.length} dia(s) bloqueado(s).`);
      } else if (action === 'desbloquear') {
        await fase1Api.anfitriaoBulkDesbloquear(id, selectedDates);
        setMsg(`${selectedDates.length} dia(s) desbloqueado(s).`);
      } else {
        const raw = window.prompt('Preço especial (R$). Deixe vazio para remover override:');
        if (raw === null) return;
        const preco = raw.trim() === '' ? null : Number(raw.replace(',', '.'));
        if (preco != null && !Number.isFinite(preco)) {
          setErro('Preço inválido');
          return;
        }
        await fase1Api.anfitriaoAjustarPreco(id, selectedDates, preco);
        setMsg(
          preco == null
            ? 'Preço especial removido.'
            : `Preço R$ ${preco.toFixed(2)} aplicado em ${selectedDates.length} dia(s).`,
        );
      }
      setSelectedDates([]);
      await refetch();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnfitriaoRoleGuard>
      <Head>
        <title>Calendário | Anfitrião</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Link href={`/anfitriao/unidades/${id}`} className="text-sm text-blue-600 hover:underline">
            ← Unidade #{id}
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Calendário da unidade</h1>
          <p className="mt-1 text-sm text-slate-600">
            Selecione vários dias para bloquear, desbloquear ou ajustar preço. Dias{' '}
            <strong>reservados</strong> são somente leitura (D3).
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="text-sm">
              De
              <input
                type="date"
                className="ml-2 rounded border px-2 py-1"
                value={de}
                onChange={(e) => {
                  setDe(e.target.value);
                  setSelectedDates([]);
                }}
              />
            </label>
            <label className="text-sm">
              Até
              <input
                type="date"
                className="ml-2 rounded border px-2 py-1"
                value={ate}
                onChange={(e) => {
                  setAte(e.target.value);
                  setSelectedDates([]);
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={loading}
              className="rounded bg-slate-800 px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              {loading ? 'Carregando…' : 'Recarregar'}
            </button>
            <Link href="/anfitriao/calendario" className="rounded border border-slate-300 px-3 py-1 text-sm">
              Visão agregada
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading || selectedDates.length === 0}
              onClick={() => void runBulk('bloquear')}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              Bloquear ({selectedDates.length})
            </button>
            <button
              type="button"
              disabled={loading || selectedDates.length === 0}
              onClick={() => void runBulk('desbloquear')}
              className="rounded bg-emerald-600 px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              Desbloquear ({selectedDates.length})
            </button>
            <button
              type="button"
              disabled={loading || selectedDates.length === 0}
              onClick={() => void runBulk('preco')}
              className="rounded bg-indigo-600 px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              Ajustar preço ({selectedDates.length})
            </button>
            {selectedDates.length > 0 && (
              <button
                type="button"
                className="text-sm text-slate-600 underline"
                onClick={() => setSelectedDates([])}
              >
                Limpar seleção
              </button>
            )}
          </div>

          <div className="mt-6">
            <AnfitriaoMonthCalendar
              dias={dias}
              selectedDates={selectedDates}
              onSelectDia={toggleSelect}
            />
          </div>

          {isError && (
            <p className="mt-4 text-sm text-red-600">{(error as Error)?.message || 'Erro ao carregar calendário'}</p>
          )}
          {msg && <p className="mt-4 text-sm text-slate-600">{msg}</p>}
          {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
