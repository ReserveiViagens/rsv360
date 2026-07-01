'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { PricingModuleShell } from '../PricingModuleShell';
import { PricingBookingsBreakdown } from '../PricingBookingsBreakdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BookingBreakdownItem } from '@/components/analytics/BookingBreakdownTable';

const PricingCalendar = dynamic(() => import('../PricingCalendar'), { ssr: false });

type DashboardData = {
  metrics: {
    currentRevenue: number;
    averagePrice: number;
    occupancy: number;
    priceChange: number;
    totalBookings: number;
  };
  breakdown: {
    bookings: BookingBreakdownItem[];
    price_history: Array<{
      date: string;
      base_price: number;
      final_price: number;
      demand_level: string | null;
    }>;
    rules: Array<{ id: number; rule_name: string; rule_type: string; is_active: boolean }>;
    competitors: Array<{ competitor_name: string; price: number }>;
    alerts: Array<{ id: number; title: string; severity: string }>;
  };
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function DashboardPanel({ itemId, basePrice }: { itemId: string; basePrice: number }) {
  const [activeSection, setActiveSection] = useState<
    'bookings' | 'history' | 'rules' | 'competitors' | 'alerts' | null
  >('bookings');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['pricing-dashboard', itemId],
    queryFn: async () => {
      const res = await fetch(`/api/pricing/dashboard?item_id=${itemId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar dashboard');
      return json.data as DashboardData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const metrics = data?.metrics;
  const breakdown = data?.breakdown;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('bookings')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Receita (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(metrics?.currentRevenue ?? 0)}</p>
            <p className="text-xs text-slate-500 mt-1">{metrics?.totalBookings ?? 0} reservas</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('history')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Preço médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(metrics?.averagePrice ?? basePrice)}</p>
            {(metrics?.priceChange ?? 0) !== 0 && (
              <Badge variant={(metrics?.priceChange ?? 0) > 0 ? 'default' : 'destructive'} className="mt-1">
                {(metrics?.priceChange ?? 0) > 0 ? '+' : ''}
                {(metrics?.priceChange ?? 0).toFixed(1)}%
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('bookings')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ocupação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(metrics?.occupancy ?? 0).toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSection('alerts')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{breakdown?.alerts?.length ?? 0}</p>
            <Link href={`/pricing/alerts`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
              Ver alertas <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendário embutido</CardTitle>
        </CardHeader>
        <CardContent>
          <PricingCalendar
            propertyId={itemId}
            dateRange={{
              start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            }}
            onPriceChange={async (date, newPrice) => {
              const res = await fetch(`/api/pricing/calendar/${itemId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: date.toISOString().slice(0, 10), price: newPrice }),
              });
              if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Erro ao salvar');
              }
              refetch();
            }}
          />
        </CardContent>
      </Card>

      {activeSection === 'bookings' && breakdown?.bookings && (
        <Card>
          <CardContent className="pt-6">
            <PricingBookingsBreakdown
              title="Reservas que compõem a receita"
              description="Clientes, datas, valores e status das reservas confirmadas desta propriedade."
              bookings={breakdown.bookings}
              showProperty={false}
            />
          </CardContent>
        </Card>
      )}

      {activeSection === 'history' && breakdown?.price_history && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de tarifas (pricing_history)</CardTitle>
          </CardHeader>
          <CardContent>
            {breakdown.price_history.length === 0 ? (
              <p className="text-sm text-slate-500">Sem registros de tarifa no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-600">
                      <th className="py-2 pr-4">Data</th>
                      <th className="py-2 pr-4">Base</th>
                      <th className="py-2 pr-4">Final</th>
                      <th className="py-2">Demanda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.price_history.map((row) => (
                      <tr key={row.date} className="border-b border-slate-100">
                        <td className="py-2 pr-4">{row.date}</td>
                        <td className="py-2 pr-4">{formatCurrency(row.base_price)}</td>
                        <td className="py-2 pr-4 font-medium">{formatCurrency(row.final_price)}</td>
                        <td className="py-2">{row.demand_level || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'rules' && breakdown?.rules && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Regras ativas ({breakdown.rules.length})</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing/rules">Gerenciar regras</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {breakdown.rules.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma regra cadastrada.</p>
            ) : (
              breakdown.rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{rule.rule_name}</p>
                    <p className="text-xs text-slate-500">{rule.rule_type}</p>
                  </div>
                  <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                    {rule.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'competitors' && breakdown?.competitors && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Concorrentes monitorados</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing/competitors">Ver concorrentes</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {breakdown.competitors.length === 0 ? (
              <p className="text-sm text-slate-500">Sem tarifas de concorrentes registradas.</p>
            ) : (
              <ul className="space-y-2">
                {breakdown.competitors.map((c, i) => (
                  <li key={i} className="flex justify-between rounded border p-2 text-sm">
                    <span>{c.competitor_name}</span>
                    <span className="font-medium">{formatCurrency(Number(c.price))}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'alerts' && breakdown?.alerts && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alertas recentes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing/alerts">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {breakdown.alerts.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum alerta gerado.</p>
            ) : (
              breakdown.alerts.map((alert) => (
                <div key={alert.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <Badge variant="outline">{alert.severity}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function PricingDashboardModule() {
  return (
    <PricingModuleShell
      title="Dashboard de precificação"
      description="Visão geral, calendário embutido e métricas com drill-down de reservas e tarifas."
    >
      {({ itemId, item }) => (
        <DashboardPanel itemId={itemId} basePrice={item?.basePrice ?? 250} />
      )}
    </PricingModuleShell>
  );
}
