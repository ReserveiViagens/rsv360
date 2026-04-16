import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useRooms } from '@/src/modules/housekeeping/hooks';
import { FloorMap } from '@/src/modules/housekeeping/components/FloorMap';

export default function RoomStatusBoardPage() {
  const { data = [] } = useRooms();

  return (
    <div className="space-y-6">
      <PageHeader badge="Housekeeping" title="Status dos quartos" description="Board por status e filtros rápidos." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Select defaultValue=""><option value="">Todos andares</option></Select>
          <Select defaultValue=""><option value="">Todos status</option><option value="clean">Clean</option><option value="dirty">Dirty</option><option value="cleaning">Cleaning</option><option value="maintenance">Maintenance</option></Select>
          <Select defaultValue=""><option value="">Todos tipos</option></Select>
          <Select defaultValue=""><option value="">Ordenar</option></Select>
        </CardContent>
      </Card>
      <FloorMap rooms={data} />
    </div>
  );
}
