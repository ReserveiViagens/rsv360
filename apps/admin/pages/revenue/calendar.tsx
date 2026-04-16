import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useRateCalendar } from '@/src/modules/revenue/hooks';
import { RateCalendar } from '@/src/modules/revenue/components/RateCalendar';
import { PriceSimulator } from '@/src/modules/revenue/components/PriceSimulator';

export default function RateCalendarPage() {
  const { data = [] } = useRateCalendar();

  return (
    <div className="space-y-6">
      <PageHeader badge="Revenue" title="Calendário de tarifas" description="Editar preços por dia e simular preço." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar data..." />
          <Select defaultValue=""><option value="">Room type</option></Select>
          <Select defaultValue=""><option value="">Mês</option></Select>
          <Button>Aplicar em massa</Button>
        </CardContent>
      </Card>
      <RateCalendar entries={data} />
      <PriceSimulator baseRate={250} occupancy={85} weekday={6} />
    </div>
  );
}
