import Link from 'next/link';
import Head from 'next/head';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAnfitriaoMinhas } from '@/hooks/useAnfitriao';

type Unidade = {
  id: number;
  titulo: string;
  hotelId: string;
  statusPublicacao: string;
  precoDiaria?: string | number | null;
};

export default function AnfitriaoUnidadesPage() {
  const { data, isLoading } = useAnfitriaoMinhas();
  const items = (data?.data?.items ?? []) as Unidade[];

  return (
    <ProtectedRoute>
      <Head>
        <title>Minhas unidades | Anfitrião</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Minhas unidades</h1>
              <p className="text-sm text-slate-600">Escopo por proprietário ou carteira do corretor</p>
            </div>
            <Link href="/anfitriao" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
              Voltar ao painel
            </Link>
          </div>

          {isLoading && <p className="text-slate-600">Carregando...</p>}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Hotel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{u.id}</td>
                    <td className="px-4 py-3">{u.titulo}</td>
                    <td className="px-4 py-3">{u.hotelId}</td>
                    <td className="px-4 py-3">{u.statusPublicacao}</td>
                    <td className="px-4 py-3">
                      <Link href={`/anfitriao/unidades/${u.id}`} className="text-blue-600 hover:underline">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Nenhuma unidade no seu escopo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
