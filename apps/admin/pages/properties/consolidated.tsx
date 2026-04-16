import { PageHeader } from '@/components/PageHeader';
import { useConsolidatedStats } from '@/src/modules/properties/hooks';
import { ConsolidatedKPIs } from '@/src/modules/properties/components/ConsolidatedKPIs';

export default function ConsolidatedDashboardPage() {
  const { data } = useConsolidatedStats();

  return (
    <div className="space-y-6">
      <PageHeader badge="Multi-property" title="Consolidado" description="KPIs agregados de todas as propriedades." />
      <ConsolidatedKPIs stats={data} />
    </div>
  );
}
