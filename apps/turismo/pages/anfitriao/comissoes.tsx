import Link from 'next/link';
import Head from 'next/head';
import AnfitriaoRoleGuard from '../../components/AnfitriaoRoleGuard';
import { useAnfitriaoMinhasComissoes } from '@/hooks/useAnfitriao';

function formatBrl(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pendente: 'Pendente',
    confirmada: 'Confirmada',
    paga: 'Paga',
    estornada: 'Estornada',
  };
  return map[status] ?? status;
}

export default function AnfitriaoComissoesPage() {
  const { data, isLoading, isError, error } = useAnfitriaoMinhasComissoes();
  const payload = data?.data;
  const items = payload?.items ?? [];

  return (
    <AnfitriaoRoleGuard>
      <Head>
        <title>Minhas comissões | Anfitrião RSV360</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Minhas comissões</h1>
              <p className="text-sm text-slate-600">Repasse após pagamento confirmado da proposta</p>
            </div>
            <Link href="/anfitriao" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
              Voltar ao painel
            </Link>
          </div>

          {payload && !payload.moduloAtivo && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              O módulo de comissões está em preparação. Os lançamentos aparecerão aqui quando o pagamento da
              proposta for confirmado.
            </div>
          )}

          {isLoading && <p className="text-slate-600">Carregando comissões...</p>}
          {isError && (
            <p className="text-red-600">{(error as Error)?.message || 'Erro ao carregar comissões'}</p>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              Nenhuma comissão registrada ainda.
            </div>
          )}

          {items.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Proposta</th>
                    <th className="px-4 py-3 font-medium">Papel</th>
                    <th className="px-4 py-3 font-medium">Base</th>
                    <th className="px-4 py-3 font-medium">%</th>
                    <th className="px-4 py-3 font-medium">Valor</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{row.propostaTitulo}</div>
                        <div className="text-xs text-slate-500">
                          {row.propostaCodigo ? `#${row.propostaCodigo}` : `ID ${row.propostaId}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-700">{row.papel}</td>
                      <td className="px-4 py-3 text-slate-700">{formatBrl(row.baseValor)}</td>
                      <td className="px-4 py-3 text-slate-700">{row.percentual}%</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatBrl(row.valorComissao)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                          {statusLabel(row.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
