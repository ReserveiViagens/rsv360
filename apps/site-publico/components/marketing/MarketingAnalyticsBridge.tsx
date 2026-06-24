'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, LineChart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingPageHeader } from './MarketingPageHeader';

const quickLinks = [
  {
    title: 'Dashboard completo',
    description: 'Receita, demanda, heatmap e benchmark de concorrentes.',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Previsão de receita',
    description: 'Projeções e cenários por propriedade.',
    href: '/analytics/revenue-forecast',
    icon: TrendingUp,
  },
  {
    title: 'Pricing analytics',
    description: 'Correlacionar campanhas com regras de preço dinâmico.',
    href: '/pricing/dashboard',
    icon: LineChart,
  },
];

export function MarketingAnalyticsBridge() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <MarketingPageHeader
        title="Analytics de marketing"
        description="O hub principal de métricas fica em /analytics. Use os atalhos abaixo para análises detalhadas."
        action={
          <Button asChild>
            <Link href="/analytics">
              Abrir analytics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.href} className="transition hover:border-violet-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-violet-600" aria-hidden />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-slate-600">{item.description}</p>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-violet-700 hover:underline"
                >
                  Ir para módulo →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-violet-100 bg-violet-50/50">
        <CardContent className="pt-6 text-sm text-violet-900">
          <strong>Dica:</strong> campanhas criadas em{' '}
          <Link href="/marketing/campaigns" className="underline">
            /marketing/campaigns
          </Link>{' '}
          alimentam métricas de conversão exibidas no CRM e, futuramente, cruzadas
          com analytics de receita.
        </CardContent>
      </Card>
    </div>
  );
}
