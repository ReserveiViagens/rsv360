import type { Fase1ModuleKey } from '@/src/modules/fase1/api/fase1.api';
import { useFase1ModuleList } from '@/src/modules/fase1/hooks';

const LABELS: Record<Fase1ModuleKey, string> = {
  orcamentos: 'Orçamentos',
  propostas: 'Propostas',
  passageiros: 'Passageiros',
  financeiro: 'Financeiro',
  campanhas: 'Campanhas & Cupons',
  logistica: 'Logística',
  relatorios: 'Relatórios',
};

export function Fase1ModulePage({ module }: { module: Fase1ModuleKey }) {
  const { data, isLoading, error } = useFase1ModuleList(module);
  const payload = data?.data;

  const isDashboard = module === 'financeiro' || module === 'logistica' || module === 'relatorios';
  const rows = isDashboard ? [] : (payload as Record<string, unknown>[]) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{LABELS[module]}</h1>
        <p className="text-sm text-slate-600">Fase 4 — API `/api/v1/{module}`</p>
      </div>

      {isLoading && <p className="text-slate-500">Carregando...</p>}
      {error && <p className="text-red-600">{(error as Error).message}</p>}

      {isDashboard && payload && (
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(payload as Record<string, unknown>).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">{k}</p>
              <p className="text-lg font-bold">{String(v)}</p>
            </div>
          ))}
        </div>
      )}

      {!isDashboard && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Resumo</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-t border-slate-100">
                  <td className="px-4 py-3">{String(row.id ?? '—')}</td>
                  <td className="px-4 py-3">
                    {String(row.titulo ?? row.nome ?? row.clienteNome ?? row.codigo ?? '—')}
                  </td>
                  <td className="px-4 py-3">{String(row.status ?? '—')}</td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    Nenhum registro. Use turismo (:3005) para CRUD completo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
