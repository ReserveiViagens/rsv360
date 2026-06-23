import Link from 'next/link';
import Head from 'next/head';
import { useOrcamentos, useCreatePropostaFromOrcamento } from '@/hooks/useFase1Modules';

export default function OrcamentosPage() {
  const { data, isLoading } = useOrcamentos();
  const fromOrcamento = useCreatePropostaFromOrcamento();
  const items = data?.data ?? [];

  return (
    <>
      <Head>
        <title>Orçamentos | Turismo RSV360</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Orçamentos</h1>
            <Link href="/propostas" className="text-sm text-blue-600">
              Ver propostas →
            </Link>
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
                  <th className="px-4 py-3 text-left">Ação</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3">{o.id}</td>
                    <td className="px-4 py-3">{o.titulo}</td>
                    <td className="px-4 py-3">{o.clienteNome}</td>
                    <td className="px-4 py-3">{o.total}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={fromOrcamento.isPending}
                        onClick={async () => {
                          const res = await fromOrcamento.mutateAsync(o.id);
                          window.location.href = `/propostas/${res.data.id}`;
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
