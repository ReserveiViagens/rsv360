'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import AnfitriaoRoleGuard from '../../components/AnfitriaoRoleGuard';
import { useAnfitriaoCalendarioAgregado } from '@/hooks/useAnfitriao';

function contarEstados(dias: Array<{ estado: string; precoOverride?: string | null }>) {
  return dias.reduce(
    (acc, d) => {
      if (d.estado === 'livre') acc.livre += 1;
      if (d.estado === 'bloqueado') acc.bloqueado += 1;
      if (d.estado === 'reservado') acc.reservado += 1;
      if (d.precoOverride) acc.preco += 1;
      return acc;
    },
    { livre: 0, bloqueado: 0, reservado: 0, preco: 0 },
  );
}

export default function AnfitriaoCalendarioAgregadoPage() {
  const [de, setDe] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [ate, setAte] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data, isLoading, isError, error } = useAnfitriaoCalendarioAgregado(de, ate);
  const unidades = useMemo(() => data?.data?.data ?? [], [data]);

  return (
    <AnfitriaoRoleGuard>
      <Head>
        <title>Calendário agregado | Anfitrião</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/anfitriao" className="text-sm text-blue-600 hover:underline">
            ← Painel
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Calendário agregado</h1>
          <p className="mt-1 text-sm text-slate-600">
            Visão somente leitura de todas as suas unidades — bloqueios, reservas e preços especiais.
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
          </div>

          {isLoading && <p className="mt-6 text-sm text-slate-600">Carregando…</p>}
          {isError && (
            <p className="mt-6 text-sm text-red-600">{(error as Error)?.message || 'Erro ao carregar'}</p>
          )}

          {!isLoading && !isError && unidades.length === 0 && (
            <p className="mt-6 text-sm text-slate-600">Nenhuma unidade no seu escopo.</p>
          )}

          <div className="mt-6 space-y-4">
            {unidades.map((u) => {
              const stats = contarEstados(u.dias);
              return (
                <div key={u.acomodacaoId} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold text-slate-900">{u.titulo}</h2>
                      <p className="text-xs text-slate-500">
                        #{u.acomodacaoId} · {u.hotelId}
                      </p>
                    </div>
                    <Link
                      href={`/anfitriao/unidades/${u.acomodacaoId}/disponibilidade`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Editar calendário
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">
                      {stats.livre} livre(s)
                    </span>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-red-800">
                      {stats.bloqueado} bloqueado(s)
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-900">
                      {stats.reservado} reservado(s)
                    </span>
                    <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-800">
                      {stats.preco} preço especial
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
