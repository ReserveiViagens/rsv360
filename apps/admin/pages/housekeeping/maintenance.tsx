import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMaintenance } from '@/src/modules/housekeeping/hooks';
import { MaintenanceOrderCard } from '@/src/modules/housekeeping/components/MaintenanceOrderCard';

export default function MaintenanceOrdersPage() {
  const { data = [] } = useMaintenance();

  return (
    <div className="space-y-6">
      <PageHeader badge="Housekeeping" title="Manutenção" description="Ordens abertas e resolução rápida." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar ordem..." />
          <Select defaultValue=""><option value="">Status</option></Select>
          <Select defaultValue=""><option value="">Prioridade</option></Select>
          <Button>Criar ordem</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((order) => <MaintenanceOrderCard key={order.id} order={order} />)}
      </div>
    </div>
  );
}
