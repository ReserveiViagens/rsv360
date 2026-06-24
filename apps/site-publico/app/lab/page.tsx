import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Gauge,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react';
import { PRIMARY_SITE_URL } from '@/lib/app-mode';

const modules = [
  {
    title: 'Analytics',
    description: 'Receita, demanda, concorrentes e insights.',
    href: '/analytics',
    icon: BarChart3,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'CRM e campanhas',
    description: 'Clientes, segmentos e campanhas de marketing.',
    href: '/crm',
    icon: Users,
    status: 'Pronto',
    statusClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    title: 'Marketing',
    description: 'Campanhas, funis, A/B tests e broadcasts.',
    href: '/marketing',
    icon: Megaphone,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Precificação',
    description: 'Dashboard, smart pricing e rotas em evolução.',
    href: '/pricing',
    icon: Calendar,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Admin',
    description: 'Dashboard operacional e gestão interna.',
    href: '/admin/dashboard',
    icon: Settings,
    status: 'Pronto',
    statusClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    title: 'Observabilidade',
    description: 'Grafana e Prometheus do stack Docker.',
    href: 'http://localhost:3007',
    icon: Gauge,
    status: 'Externo',
    statusClass: 'bg-slate-100 text-slate-700',
    external: true,
  },
] as const;

export default function LabHomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-violet-600">
          Overview
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          Laboratório de marketing e analytics
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Ambiente interno na porta <strong>:3000</strong>. O site público B2C
          (hotéis, leilões, reservas) permanece em{' '}
          <a
            href={PRIMARY_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-violet-700 underline-offset-2 hover:underline"
          >
            {PRIMARY_SITE_URL}
          </a>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const card = (
            <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="rounded-lg bg-violet-50 p-2 text-violet-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${mod.statusClass}`}
                >
                  {mod.status}
                </span>
              </div>
              <h2 className="mt-4 font-semibold text-slate-900">{mod.title}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-600">
                {mod.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-700">
                Abrir
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </article>
          );

          if ('external' in mod && mod.external) {
            return (
              <a
                key={mod.href}
                href={mod.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {card}
              </a>
            );
          }

          return (
            <Link key={mod.href} href={mod.href} className="block">
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
