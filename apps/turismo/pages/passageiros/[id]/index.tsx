import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { usePassageiro } from '@/hooks/useFase1Modules';
import { fase1Api } from '@/lib/fase1-api';

export default function PassageiroDetailPage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const { data, refetch } = usePassageiro(id);
  const p = (data as { data?: Record<string, unknown> })?.data;
  const fnrh = (p?.fnrh as Array<Record<string, unknown>>) ?? [];
  const docs = (p?.documentos as Array<Record<string, unknown>>) ?? [];
  const [fnrhForm, setFnrhForm] = useState({ hotelNome: '', motivoViagem: '', meioTransporte: '' });

  if (!id) return null;

  return (
    <>
      <Head><title>Passageiro #{id}</title></Head>
      <div className="mx-auto max-w-2xl p-6">
        <Link href="/passageiros" className="text-sm text-blue-600">← Lista</Link>
        <h1 className="mt-2 text-xl font-bold">{String(p?.nome ?? `#${id}`)}</h1>
        <p className="text-sm text-slate-600">{String(p?.email ?? '')} · CPF {String(p?.cpf ?? '—')}</p>

        <section className="mt-6 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Documentos ({docs.length})</h2>
          <ul className="mt-2 text-sm">{docs.map((d, i) => <li key={i}>{String(d.tipo)} — {String(d.numero ?? '')}</li>)}</ul>
        </section>

        <section className="mt-6 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">FNRH</h2>
          {fnrh.map((f) => (
            <div key={String(f.id)} className="mt-2 text-sm">
              {String(f.hotelNome)} · {String(f.status)} · {String(f.motivoViagem ?? '')}
            </div>
          ))}
          <form
            className="mt-3 space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await fase1Api.createFnrh(id, fnrhForm);
              setFnrhForm({ hotelNome: '', motivoViagem: '', meioTransporte: '' });
              refetch();
            }}
          >
            <input placeholder="Hotel" value={fnrhForm.hotelNome} onChange={(e) => setFnrhForm({ ...fnrhForm, hotelNome: e.target.value })} className="w-full rounded border px-2 py-1 text-sm" />
            <input placeholder="Motivo viagem" value={fnrhForm.motivoViagem} onChange={(e) => setFnrhForm({ ...fnrhForm, motivoViagem: e.target.value })} className="w-full rounded border px-2 py-1 text-sm" />
            <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Registrar FNRH</button>
          </form>
        </section>
      </div>
    </>
  );
}
