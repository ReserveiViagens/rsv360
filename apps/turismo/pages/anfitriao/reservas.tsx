'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import AnfitriaoRoleGuard from '../../components/AnfitriaoRoleGuard';
import { fase1Api } from '@/lib/fase1-api';

interface ReservaItem {
  propostaId: number;
  codigo: string | null;
  titulo: string;
  status: string;
  acomodacaoId: number;
  checkIn: string;
  checkOut: string;
  valorTotal: string;
  clienteNome: string;
  clienteEmail: string | null;
  clienteTelefone: string | null;
  aceitoEm: string | null;
}

export default function AnfitriaoReservasPage() {
  const [de, setDe] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [ate, setAte] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [items, setItems] = useState<ReservaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fase1Api.anfitriaoReservas(de, ate);
      setItems((res.data ?? []) as ReservaItem[]);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [de, ate]);

  return (
    <AnfitriaoRoleGuard>
      <Head>
        <title>Reservas | Anfitrião</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/anfitriao" className="text-sm text-blue-600 hover:underline">
            ← Painel
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Reservas confirmadas</h1>
          <p className="mt-1 text-sm text-slate-600">
            Propostas <strong>accepted</strong> / <strong>paid</strong> no seu escopo. Contato mascarado (LGPD).
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="text-sm">
              De
              <input type="date" className="ml-2 rounded border px-2 py-1" value={de} onChange={(e) => setDe(e.target.value)} />
            </label>
            <label className="text-sm">
              Até
              <input type="date" className="ml-2 rounded border px-2 py-1" value={ate} onChange={(e) => setAte(e.target.value)} />
            </label>
            <button
              type="button"
              onClick={() => void carregar()}
              disabled={loading}
              className="rounded bg-slate-800 px-3 py-1 text-sm text-white"
            >
              Atualizar
            </button>
          </div>

          {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Proposta</th>
                  <th className="px-4 py-3">Unidade</th>
                  <th className="px-4 py-3">Check-in / out</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      {loading ? 'Carregando…' : 'Nenhuma reserva no período.'}
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.propostaId} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.codigo ?? `#${r.propostaId}`}</div>
                        <div className="text-xs text-slate-500">{r.titulo}</div>
                      </td>
                      <td className="px-4 py-3">#{r.acomodacaoId}</td>
                      <td className="px-4 py-3">
                        {r.checkIn} → {r.checkOut}
                      </td>
                      <td className="px-4 py-3">
                        <div>{r.clienteNome}</div>
                        <div className="text-xs text-slate-500">{r.clienteEmail ?? '—'}</div>
                        <div className="text-xs text-slate-500">{r.clienteTelefone ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3 capitalize">{r.status}</td>
                      <td className="px-4 py-3">R$ {r.valorTotal}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
