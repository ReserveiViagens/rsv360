import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRICING_MODULES } from './pricing-modules';
import { PricingPageHeader } from './PricingPageHeader';

export function PricingHub() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PricingPageHeader
        title="Hub de precificação"
        description="Dashboard e smart pricing operacionais; demais rotas em evolução no laboratório S2."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRICING_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
            >
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
              <p className="mt-1 text-sm text-slate-600">{mod.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-700">
                Abrir
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
