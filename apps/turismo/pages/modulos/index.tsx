import Link from 'next/link';
import Head from 'next/head';

const MODULOS = [
  { href: '/orcamentos', label: 'Orçamentos', desc: 'CRUD + itens + converter proposta' },
  { href: '/propostas', label: 'Propostas', desc: 'CRUD + templates + chat HITL' },
  { href: '/passageiros', label: 'Passageiros', desc: 'CRUD + documentos + FNRH' },
  { href: '/financeiro', label: 'Financeiro', desc: 'Transações + contas + fluxo de caixa' },
  { href: '/campanhas', label: 'Campanhas', desc: 'Campanhas + cupons + métricas' },
  { href: '/logistica', label: 'Logística', desc: 'Fornecedores + reservas + vouchers' },
  { href: '/relatorios', label: 'Relatórios', desc: 'Dashboard + export CSV/PDF' },
  { href: '/anfitriao', label: 'Anfitrião', desc: 'Unidades parceiro + aprovação' },
];

export default function ModulosHubPage() {
  return (
    <>
      <Head><title>Módulos Fase 4 | Turismo</title></Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Módulos Fase 4</h1>
        <p className="mt-1 text-sm text-slate-600">Migração Sistema A → B — backend + frontend completo</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <h2 className="font-semibold text-slate-900">{m.label}</h2>
              <p className="mt-1 text-sm text-slate-600">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
