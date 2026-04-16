import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { useFiscalStats } from '@/src/modules/fiscal/hooks';

export default function FiscalDashboardPage() {
  const { data } = useFiscalStats();

  return (
    <div className="space-y-6">
      <PageHeader badge="Fiscal" title="Fiscal & LGPD" description="Recibos, FNRH, consentimentos e auditoria." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Invoices" value={data?.invoices_total ?? 0} />
        <StatCard label="FNRH" value={data?.fnrh_total ?? 0} />
        <StatCard label="Requests LGPD" value={data?.lgpd_requests ?? 0} />
      </div>
    </div>
  );
}
