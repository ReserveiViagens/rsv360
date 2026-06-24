import Link from 'next/link';
import Head from 'next/head';
import { useLogisticaDashboard, useFornecedores, useVouchers } from '@/hooks/useFase1Modules';
import { fase1Api } from '@/lib/fase1-api';
import { useState } from 'react';

export default function LogisticaPage() {
  const dash = useLogisticaDashboard();
  const forn = useFornecedores();
  const vouch = useVouchers();
  const summary = (dash.data as { data?: Record<string, unknown> })?.data;
  const fornecedores = (forn.data as { data?: unknown[] })?.data ?? [];
  const vouchers = (vouch.data as { data?: unknown[] })?.data ?? [];
  const [titulo, setTitulo] = useState('');

  return (
    <>
      <Head><title>Logística</title></Head>
      <div className="p-6">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">Logística</h1>
          <Link href="/modulos" className="text-sm text-blue-600">Hub</Link>
        </div>
        {summary && (
          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            {Object.entries(summary).map(([k, v]) => (
              <span key={k} className="rounded-full bg-slate-100 px-3 py-1">{k}: {String(v)}</span>
            ))}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Fornecedores</h2>
            <ul className="mt-2 text-sm">
              {(fornecedores as Array<Record<string, unknown>>).map((f) => (
                <li key={String(f.id)}>{String(f.nome)} — {String(f.categoria ?? '')}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">Vouchers</h2>
            <ul className="mt-2 text-sm">
              {(vouchers as Array<Record<string, unknown>>).map((v) => (
                <li key={String(v.id)}>{String(v.codigo)} — {String(v.titulo)}</li>
              ))}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                await fase1Api.createVoucher({ titulo });
                setTitulo('');
                window.location.reload();
              }}
            >
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Novo voucher" className="flex-1 rounded border px-2 py-1 text-sm" />
              <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Criar</button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
