import { TrendingDown, TrendingUp, Wallet, Percent } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import type { RevenueKPIs } from '../types';

export function KPICards({ kpis }: { kpis?: RevenueKPIs }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="ADR" value={kpis?.adr ?? 0} icon={<Wallet className="h-4 w-4" />} />
      <StatCard label="RevPAR" value={kpis?.revpar ?? 0} icon={<TrendingUp className="h-4 w-4" />} tone="success" />
      <StatCard label="Ocupação" value={kpis?.occupancy_rate ?? 0} icon={<Percent className="h-4 w-4" />} tone="warning" />
    </div>
  );
}
