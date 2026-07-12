'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import AnfitriaoRoleGuard from '../../../components/AnfitriaoRoleGuard';
import { AnfitriaoMonthCalendar, type CalendarioDiaView } from '../../../components/anfitriao/AnfitriaoMonthCalendar';
import { fase1Api } from '@/lib/fase1-api';

export default function AnfitriaoDisponibilidadePage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const [de, setDe] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [ate, setAte] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dias, setDias] = useState<CalendarioDiaView[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pendentesSalvar = useMemo(() => {
    return dias.filter((d) => d.estado !== 'reservado');
  }, [dias]);

  async function carregar() {
    if (!id) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fase1Api.anfitriaoCalendario(id, de, ate);
      const data = (res.data ?? []) as CalendarioDiaView[];
      setDias(data);
      setMsg(`${data.length} dia(s) no período.`);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, de, ate]);

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
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  function toggleDia(data: string, estadoAtual: CalendarioDiaView['estado']) {
    if (estadoAtual === 'reservado') return;
    setDias((prev) => {
      const i = prev.findIndex((d) => d.data === data);
      const nextEstado = estadoAtual === 'livre' ? 'bloqueado' : 'livre';
      const next: CalendarioDiaView = {
        data,
        estado: nextEstado,
        disponivel: nextEstado === 'livre',
        readOnly: false,
      };
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = next;
        return copy;
      }
      return [...prev, next];
    });
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
              onClick={() => void carregar()}
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

          {msg && <p className="mt-4 text-sm text-slate-600">{msg}</p>}
          {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
