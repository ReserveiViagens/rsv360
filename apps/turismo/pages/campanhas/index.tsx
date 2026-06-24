import Link from 'next/link';
import Head from 'next/head';
import { useCampanhas, useCampanhasMetricas, useCupons } from '@/hooks/useFase1Modules';

export default function CampanhasPage() {
  const { data: camp } = useCampanhas();
  const { data: met } = useCampanhasMetricas();
  const { data: cup } = useCupons();
  const campanhas = (camp as { data?: unknown[] })?.data ?? [];
  const metricas = (met as { data?: Record<string, unknown> })?.data;
  const cupons = (cup as { data?: unknown[] })?.data ?? [];

  return (
    <>
      <Head><title>Campanhas</title></Head>
      <div className="p-6">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">Campanhas & Cupons</h1>
          <Link href="/modulos" className="text-sm text-blue-600">Hub</Link>
        </div>
        {metricas && (
          <div className="mb-6 grid gap-3 sm:grid-cols-4">
            {Object.entries(metricas).map(([k, v]) => (
              <div key={k} className="rounded-lg border bg-white p-3 text-sm">
                <p className="text-slate-500">{k}</p>
                <p className="font-bold">{String(v)}</p>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Campanhas ({campanhas.length})</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {(campanhas as Array<Record<string, unknown>>).map((c) => (
                <li key={String(c.id)}>{String(c.nome)} — {String(c.status)}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Cupons ({cupons.length})</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {(cupons as Array<Record<string, unknown>>).map((c) => (
                <li key={String(c.id)}>{String(c.codigo)} — {String(c.tipoDesconto)} {String(c.valorDesconto)}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
