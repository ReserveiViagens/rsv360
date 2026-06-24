import Link from 'next/link';
import Head from 'next/head';
import { useOrcamentos, useConvertOrcamento } from '@/hooks/useFase1Modules';

export default function OrcamentosPage() {
  const { data, isLoading } = useOrcamentos();
  const convert = useConvertOrcamento();
  const items = (data as { data?: Array<Record<string, unknown>> })?.data ?? [];

  return (
    <>
      <Head><title>Orçamentos | Turismo</title></Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Orçamentos</h1>
            <div className="flex gap-2">
              <Link href="/orcamentos/nova" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Novo</Link>
              <Link href="/modulos" className="rounded-lg border px-4 py-2 text-sm">Hub módulos</Link>
            </div>
          </div>
          {isLoading && <p>Carregando...</p>}
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Título</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={String(o.id)} className="border-t">
                    <td className="px-4 py-3">{String(o.id)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/orcamentos/${o.id}`} className="text-blue-600 hover:underline">{String(o.titulo)}</Link>
                    </td>
                    <td className="px-4 py-3">{String(o.clienteNome)}</td>
                    <td className="px-4 py-3">{String(o.total)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={convert.isPending}
                        onClick={async () => {
                          const res = await convert.mutateAsync(Number(o.id));
                          window.location.href = `/propostas/${(res as { data: { id: number } }).data.id}`;
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        → Proposta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
