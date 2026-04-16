import { Card, CardContent } from '@/components/ui/card';
import type { ConsolidatedStats } from '../types';
import { StatCard } from '@/components/StatCard';

export function ConsolidatedKPIs({ stats }: { stats?: ConsolidatedStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Propriedades" value={stats?.total_properties ?? 0} />
      <StatCard label="Quartos" value={stats?.total_rooms ?? 0} />
      <StatCard label="Hóspedes" value={stats?.total_guests ?? 0} />
    </div>
  );
}
