import Link from 'next/link';
import Head from 'next/head';
import { usePassageiros } from '@/hooks/useFase1Modules';

export default function PassageirosPage() {
  const { data, isLoading } = usePassageiros();
  const items = (data as { data?: Array<Record<string, unknown>> })?.data ?? [];

  return (
    <>
      <Head><title>Passageiros</title></Head>
      <div className="p-6">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">Passageiros</h1>
          <Link href="/passageiros/nova" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Novo</Link>
        </div>
        {isLoading && <p>Carregando...</p>}
        <table className="w-full rounded-xl border bg-white text-sm">
          <thead className="bg-slate-50"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Nome</th><th className="p-3 text-left">CPF</th><th className="p-3 text-left">Ações</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={String(p.id)} className="border-t">
                <td className="p-3">{String(p.id)}</td>
                <td className="p-3">{String(p.nome)}</td>
                <td className="p-3">{String(p.cpf ?? '—')}</td>
                <td className="p-3"><Link href={`/passageiros/${p.id}`} className="text-blue-600">Detalhe</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
