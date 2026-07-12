'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import AnfitriaoRoleGuard from '../../../../components/AnfitriaoRoleGuard';
import { AnfitriaoMonthCalendar, type CalendarioDiaView } from '../../../../components/anfitriao/AnfitriaoMonthCalendar';
import { useAnfitriaoCalendario } from '@/hooks/useAnfitriao';
import { fase1Api } from '@/lib/fase1-api';

export default function AnfitriaoDisponibilidadePage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const [de, setDe] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [ate, setAte] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const periodKey = `${id}|${de}|${ate}`;
  const [activePeriod, setActivePeriod] = useState(periodKey);
  const [overrides, setOverrides] = useState<Record<string, CalendarioDiaView>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (activePeriod !== periodKey) {
    setActivePeriod(periodKey);
    setOverrides({});
  }

  const { data, isLoading, isError, error, refetch, isFetching } = useAnfitriaoCalendario(id, de, ate);
  const serverDias = useMemo(
    () => (data?.data ?? []) as CalendarioDiaView[],
    [data?.data],
  );
  const loading = isLoading || isFetching;

  const dias = useMemo(() => {
    return serverDias.map((d) => overrides[d.data] ?? d);
  }, [serverDias, overrides]);

  const pendentesSalvar = useMemo(() => {
    return dias.filter((d) => d.estado !== 'reservado');
  }, [dias]);

  async function salvar() {
    if (!id) return;
    setErro(null);
    const payload = pendentesSalvar.map((d) => ({
      data: d.data,
      disponivel: d.estado === 'livre',
      observacao: d.estado === 'bloqueado' ? 'bloqueado' : undefined,
    }));
    try {
      await fase1Api.salvarAnfitriaoDisponibilidade(id, payload);
      setMsg('Calendário salvo.');
      setOverrides({});
      await refetch();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  function toggleDia(data: string, estadoAtual: CalendarioDiaView['estado']) {
    if (estadoAtual === 'reservado') return;
    const nextEstado = estadoAtual === 'livre' ? 'bloqueado' : 'livre';
    setOverrides((prev) => ({
      ...prev,
      [data]: {
        data,
        estado: nextEstado,
        disponivel: nextEstado === 'livre',
        readOnly: false,
      },
    }));
  }

  const statusMsg =
    msg ??
    (serverDias.length > 0 && !loading ? `${serverDias.length} dia(s) no período.` : null);

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
            Dias <strong>reservados</strong> vêm de propostas aceitas — somente leitura (D3).
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="text-sm">
              De
              <input
                type="date"
                className="ml-2 rounded border px-2 py-1"
                value={de}
                onChange={(e) => setDe(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Até
              <input
                type="date"
                className="ml-2 rounded border px-2 py-1"
                value={ate}
                onChange={(e) => setAte(e.target.value)}
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
            <button
              type="button"
              onClick={() => void salvar()}
              className="rounded bg-emerald-600 px-3 py-1 text-sm text-white"
            >
              Salvar alterações
            </button>
            <Link href="/anfitriao/reservas" className="rounded border border-slate-300 px-3 py-1 text-sm">
              Ver reservas
            </Link>
          </div>

          <div className="mt-6">
            <AnfitriaoMonthCalendar dias={dias} onToggleDia={toggleDia} />
          </div>

          {isError && (
            <p className="mt-4 text-sm text-red-600">{(error as Error)?.message || 'Erro ao carregar calendário'}</p>
          )}
          {statusMsg && <p className="mt-4 text-sm text-slate-600">{statusMsg}</p>}
          {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
