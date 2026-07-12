import Link from 'next/link';
import Head from 'next/head';
import AnfitriaoRoleGuard from '../../components/AnfitriaoRoleGuard';
import { useAnfitriaoDashboard } from '@/hooks/useAnfitriao';

export default function AnfitriaoDashboardPage() {
  const { data, isLoading } = useAnfitriaoDashboard();
  const kpis = data?.data;

  return (
    <AnfitriaoRoleGuard>
      <Head>
        <title>Anfitrião | Turismo RSV360</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Painel do anfitrião</h1>
              <p className="text-sm text-slate-600">Suas unidades e status de publicação</p>
            </div>
            <div className="flex gap-2">
              <Link href="/anfitriao/unidades" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                Minhas unidades
              </Link>
              <Link href="/anfitriao/reservas" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
                Reservas
              </Link>
              <Link href="/anfitriao/importar" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
                Importar
              </Link>
              <Link href="/anfitriao/tarifas" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
                Tarifário
              </Link>
              <Link href="/anfitriao/comissoes" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
                Comissões
              </Link>
              <Link href="/anfitriao/perfil" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
                Perfil
              </Link>
            </div>
          </div>

          {isLoading && <p className="text-slate-600">Carregando KPIs...</p>}

          {kpis && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total', value: kpis.total },
                { label: 'Incompletas', value: kpis.incompletas },
                { label: 'Em aprovação', value: kpis.emAprovacao },
                { label: 'Publicadas', value: kpis.publicadas },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
