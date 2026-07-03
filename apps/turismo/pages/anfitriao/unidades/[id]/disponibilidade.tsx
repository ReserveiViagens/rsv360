import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AnfitriaoRoleGuard from '../../../../components/AnfitriaoRoleGuard';
import { fase1Api } from '@/lib/fase1-api';

export default function AnfitriaoDisponibilidadePage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const [de, setDe] = useState(() => new Date().toISOString().slice(0, 10));
  const [ate, setAte] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [rows, setRows] = useState<Array<{ data: string; disponivel: boolean }>>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function carregar() {
    if (!id) return;
    const res = await fase1Api.anfitriaoDisponibilidade(id, de, ate);
    const data = (res.data ?? []) as Array<{ data: string; disponivel: boolean }>;
    setRows(data.map((r) => ({ data: String(r.data).slice(0, 10), disponivel: r.disponivel !== false })));
    setMsg(`${data.length} dia(s) carregado(s).`);
  }

  async function salvar() {
    if (!id) return;
    await fase1Api.salvarAnfitriaoDisponibilidade(id, rows);
    setMsg('Calendário salvo.');
  }

  function toggleDia(data: string) {
    setRows((prev) => {
      const i = prev.findIndex((r) => r.data === data);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], disponivel: !next[i].disponivel };
        return next;
      }
      return [...prev, { data, disponivel: false }];
    });
  }

  return (
    <AnfitriaoRoleGuard>
      <Head>
        <title>Disponibilidade | Anfitrião</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl">
          <Link href={`/anfitriao/unidades/${id}`} className="text-sm text-blue-600 hover:underline">
            ← Unidade #{id}
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Calendário de disponibilidade</h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <label className="text-sm">
              De
              <input type="date" className="ml-2 rounded border px-2 py-1" value={de} onChange={(e) => setDe(e.target.value)} />
            </label>
            <label className="text-sm">
              Até
              <input type="date" className="ml-2 rounded border px-2 py-1" value={ate} onChange={(e) => setAte(e.target.value)} />
            </label>
            <button type="button" onClick={carregar} className="rounded bg-slate-800 px-3 py-1 text-sm text-white">
              Carregar
            </button>
            <button type="button" onClick={salvar} className="rounded bg-emerald-600 px-3 py-1 text-sm text-white">
              Salvar
            </button>
          </div>
          <ul className="mt-6 space-y-2">
            {rows.map((r) => (
              <li key={r.data} className="flex items-center justify-between rounded border bg-white px-4 py-2 text-sm">
                <span>{r.data}</span>
                <button
                  type="button"
                  onClick={() => toggleDia(r.data)}
                  className={r.disponivel ? 'text-emerald-700' : 'text-red-600'}
                >
                  {r.disponivel ? 'Livre' : 'Bloqueado'}
                </button>
              </li>
            ))}
          </ul>
          {msg && <p className="mt-4 text-sm text-slate-600">{msg}</p>}
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
