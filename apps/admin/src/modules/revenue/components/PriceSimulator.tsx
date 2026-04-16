import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/src/lib/format';

export function PriceSimulator({
  baseRate,
  occupancy,
  weekday,
}: {
  baseRate: number;
  occupancy: number;
  weekday: number;
}) {
  const simulated = useMemo(() => {
    const weekendPremium = weekday >= 5 ? 1.15 : 1;
    const occupancyPremium = occupancy > 80 ? 1.2 : occupancy > 60 ? 1.1 : 1;
    return baseRate * weekendPremium * occupancyPremium;
  }, [baseRate, occupancy, weekday]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Simulador de preço</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={baseRate} readOnly />
          <Input value={occupancy} readOnly />
          <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">Dia {weekday}</div>
        </div>
        <p className="text-lg font-semibold text-slate-900">{formatCurrency(simulated)}</p>
      </CardContent>
    </Card>
  );
}
