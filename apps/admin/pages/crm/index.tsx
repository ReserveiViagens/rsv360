import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { useCRMStats, useGuests, useSegments } from '@/src/modules/crm/hooks';
import { LifecycleFunnel } from '@/src/modules/crm/components/LifecycleFunnel';
import { GuestProfileCard } from '@/src/modules/crm/components/GuestProfileCard';

const funnelData = [
  { name: 'Prospect', value: 40 },
  { name: 'First stay', value: 30 },
  { name: 'Repeat', value: 22 },
  { name: 'Loyal', value: 16 },
  { name: 'Advocate', value: 10 },
];

export default function CRMDashboardPage() {
  const { data: stats } = useCRMStats();
  const { data: guests = [] } = useGuests();
  const { data: segments = [] } = useSegments();

  return (
    <div className="space-y-6">
      <PageHeader badge="CRM" title="CRM & Loyalty" description="Hóspedes, fidelidade, campanhas e segmentos." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Hóspedes" value={stats?.total_guests ?? 0} />
        <StatCard label="Ativos" value={stats?.active_guests ?? 0} tone="success" />
        <StatCard label="VIPs" value={stats?.vip_count ?? 0} tone="warning" />
        <StatCard label="Membros loyalty" value={stats?.loyalty_members ?? 0} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <LifecycleFunnel data={funnelData} />
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-semibold text-slate-900">Segmentos</p>
            <div className="grid gap-3 md:grid-cols-2">
              {segments.slice(0, 4).map((segment) => (
                <div key={segment.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{segment.name}</p>
                  <p className="text-sm text-slate-500">{segment.description || 'Segmento dinâmico'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {guests.slice(0, 6).map((guest) => <GuestProfileCard key={guest.id} guest={guest} />)}
      </div>
    </div>
  );
}
