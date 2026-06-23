import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useConvertOrcamento, useOrcamento } from '@/hooks/useFase1Modules';
import { fase1Api } from '@/lib/fase1-api';

export default function OrcamentoDetailPage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const { data, refetch } = useOrcamento(id);
  const convert = useConvertOrcamento();
  const [itemNome, setItemNome] = useState('');
  const [itemValor, setItemValor] = useState('0');

  const orc = (data as { data?: Record<string, unknown> })?.data;
  const itens = (orc?.itens as Array<Record<string, unknown>>) ?? [];

  const addItem = async () => {
    await fase1Api.addOrcamentoItem(id, {
      nome: itemNome,
      quantidade: 1,
      precoUnitario: itemValor,
    });
    setItemNome('');
    setItemValor('0');
    refetch();
  };

  if (!id) return null;

  return (
    <>
      <Head><title>Orçamento #{id}</title></Head>
      <div className="mx-auto max-w-3xl p-6">
        <Link href="/orcamentos" className="text-sm text-blue-600">← Lista</Link>
        <h1 className="mt-2 text-xl font-bold">{String(orc?.titulo ?? `Orçamento #${id}`)}</h1>
        <p className="text-sm text-slate-600">{String(orc?.clienteNome ?? '')}</p>
        <p className="mt-2 font-semibold text-emerald-700">Total: R$ {String(orc?.total ?? '0')}</p>

        <section className="mt-6 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Itens</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {itens.map((i) => (
              <li key={String(i.id)} className="flex justify-between border-b py-1">
                <span>{String(i.nome)}</span>
                <span>{String(i.precoTotal ?? i.precoUnitario)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input placeholder="Item" value={itemNome} onChange={(e) => setItemNome(e.target.value)} className="flex-1 rounded border px-2 py-1 text-sm" />
            <input placeholder="Valor" value={itemValor} onChange={(e) => setItemValor(e.target.value)} className="w-24 rounded border px-2 py-1 text-sm" />
            <button type="button" onClick={addItem} className="rounded bg-slate-800 px-3 py-1 text-sm text-white">+</button>
          </div>
        </section>

        <button
          type="button"
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
          disabled={convert.isPending}
          onClick={async () => {
            const res = await convert.mutateAsync(id);
            const pid = (res as { data: { id: number } }).data.id;
            router.push(`/propostas/${pid}`);
          }}
        >
          Converter em proposta
        </button>
      </div>
    </>
  );
}
