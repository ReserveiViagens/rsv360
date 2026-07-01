'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PricingModuleShell } from '../PricingModuleShell';
import { CompetitorTable } from '../competitor-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PricingBookingsBreakdown } from '../PricingBookingsBreakdown';
import type { BookingBreakdownItem } from '@/components/analytics/BookingBreakdownTable';

type CompareData = {
  current_price: number;
  competitors: Array<{
    competitor_name: string;
    price: number;
    currency: string;
    availability_status: string;
    scraped_at: string;
  }>;
  statistics: { average: number; min: number; max: number; count: number };
  position: string;
  recommendation: string;
};

type CompareResponse = {
  data: CompareData;
  breakdown: BookingBreakdownItem[];
};

function ComparisonPanel({ itemId }: { itemId: string }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['pricing-compare', itemId, date],
    queryFn: async () => {
      const res = await fetch(
        `/api/pricing/competitors/compare?item_id=${itemId}&date=${date}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro na comparação');
      return json as CompareResponse;
    },
  });

  const data = response?.data;
  const breakdown = response?.breakdown ?? [];

  const positionLabel: Record<string, string> = {
    competitive: 'Competitivo',
    above_market: 'Acima do mercado',
    below_market: 'Abaixo do mercado',
    no_data: 'Sem dados',
  };

  return (
    <div className="space-y-4">
      <div className="w-full max-w-xs">
        <Label>Data de referência</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Calculando posicionamento…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{(error as Error).message}</p>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Seu preço</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {data.current_price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Média mercado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {data.statistics.average.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Posição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge>{positionLabel[data.position] || data.position}</Badge>
                <p className="text-sm text-slate-600">{data.recommendation}</p>
              </CardContent>
            </Card>
          </div>

          <CompetitorTable
            competitors={data.competitors}
            currentPrice={data.current_price}
            title="Comparativo detalhado"
          />

          <PricingBookingsBreakdown
            title={`Reservas em ${new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}`}
            description="Clientes e valores das reservas na data de referência do comparativo."
            bookings={breakdown}
            showProperty={false}
          />
        </>
      ) : null}
    </div>
  );
}

export function PricingComparisonModule() {
  return (
    <PricingModuleShell
      title="Comparação de mercado"
      description="Posicionamento da sua tarifa versus concorrentes na data escolhida."
    >
      {({ itemId }) => <ComparisonPanel itemId={itemId} />}
    </PricingModuleShell>
  );
}
