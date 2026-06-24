import Link from 'next/link';
import Head from 'next/head';
import { useRelatoriosDashboard } from '@/hooks/useFase1Modules';
import { fase1Api } from '@/lib/fase1-api';

export default function RelatoriosPage() {
  const { data } = useRelatoriosDashboard();
  const dash = (data as { data?: Record<string, unknown> })?.data;
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  const download = (tipo: 'csv' | 'pdf', module: string) => {
    const url = tipo === 'csv' ? fase1Api.exportCsvUrl(module) : fase1Api.exportPdfUrl(module);
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `relatorio-${module}.${tipo === 'csv' ? 'csv' : 'html'}`;
        a.click();
      });
  };

  return (
    <>
      <Head><title>Relatórios</title></Head>
      <div className="p-6">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <Link href="/modulos" className="text-sm text-blue-600">Hub</Link>
        </div>
        {dash && (
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {Object.entries(dash).map(([k, v]) => (
              <div key={k} className="rounded-xl border bg-white p-4">
                <p className="text-xs text-slate-500">{k}</p>
                <p className="text-xl font-bold">{String(v)}</p>
              </div>
            ))}
          </div>
        )}
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Exportar</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {['dashboard', 'orcamentos', 'propostas', 'passageiros', 'transacoes'].map((m) => (
              <div key={m} className="flex gap-1">
                <button type="button" onClick={() => download('csv', m)} className="rounded border px-2 py-1 text-xs">CSV {m}</button>
                <button type="button" onClick={() => download('pdf', m)} className="rounded border px-2 py-1 text-xs">PDF {m}</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
