import Link from 'next/link';
import Head from 'next/head';
import { useFinanceiroDashboard, useFluxoCaixa, useTransacoes } from '@/hooks/useFase1Modules';

export default function FinanceiroPage() {
  const dash = useFinanceiroDashboard();
  const fluxo = useFluxoCaixa();
  const tx = useTransacoes();
  const summary = (dash.data as { data?: Record<string, unknown> })?.data;
  const fluxoData = (fluxo.data as { data?: Record<string, unknown> })?.data;
  const transacoes = (tx.data as { data?: unknown[] })?.data ?? [];

  return (
    <>
      <Head><title>Financeiro</title></Head>
      <div className="p-6">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <Link href="/modulos" className="text-sm text-blue-600">Hub módulos</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Receitas', summary?.receitas],
            ['Despesas', summary?.despesas],
            ['Saldo', summary?.saldo],
            ['A receber', summary?.contasReceberAberto],
            ['A pagar', summary?.contasPagarAberto],
            ['Fluxo líquido', summary?.fluxoLiquido],
          ].map(([label, val]) => (
            <div key={String(label)} className="rounded-xl border bg-white p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-bold">{typeof val === 'number' ? val.toFixed(2) : String(val ?? '—')}</p>
            </div>
          ))}
        </div>
        <section className="mt-6 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Fluxo de caixa</h2>
          <p className="text-sm">Entradas: {String(fluxoData?.entradas ?? '—')} · Saídas: {String(fluxoData?.saidas ?? '—')}</p>
        </section>
        <section className="mt-6">
          <h2 className="mb-2 font-semibold">Transações ({transacoes.length})</h2>
          <div className="overflow-hidden rounded-xl border bg-white text-sm">
            <table className="w-full">
              <thead className="bg-slate-50"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Tipo</th><th className="p-2 text-left">Descrição</th><th className="p-2 text-left">Valor</th></tr></thead>
              <tbody>
                {(transacoes as Array<Record<string, unknown>>).slice(0, 20).map((t) => (
                  <tr key={String(t.id)} className="border-t"><td className="p-2">{String(t.id)}</td><td className="p-2">{String(t.tipo)}</td><td className="p-2">{String(t.descricao)}</td><td className="p-2">{String(t.valor)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
