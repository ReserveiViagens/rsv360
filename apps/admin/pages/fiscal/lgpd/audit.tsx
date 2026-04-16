import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useLGPDAudit } from '@/src/modules/fiscal/hooks';
import { AuditLogTable } from '@/src/modules/fiscal/components/AuditLogTable';

export default function LGPDAuditPage() {
  const { data = [] } = useLGPDAudit();

  return (
    <div className="space-y-6">
      <PageHeader badge="Fiscal" title="Auditoria LGPD" description="Trilha completa de eventos e ações." />
      <Card>
        <CardContent className="p-5">
          <AuditLogTable items={data} />
        </CardContent>
      </Card>
    </div>
  );
}
