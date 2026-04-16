import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { useFloorMap, useHousekeepingDashboard, useTasks } from '@/src/modules/housekeeping/hooks';
import { FloorMap } from '@/src/modules/housekeeping/components/FloorMap';
import { TaskCard } from '@/src/modules/housekeeping/components/TaskCard';
import { StaffWorkload } from '@/src/modules/housekeeping/components/StaffWorkload';

export default function HousekeepingDashboardPage() {
  const { data: dashboard } = useHousekeepingDashboard();
  const { data: rooms = [] } = useFloorMap();
  const { data: tasks = [] } = useTasks();

  return (
    <div className="space-y-6">
      <PageHeader badge="Housekeeping" title="Governança operacional" description="Mapa de quartos, tarefas e manutenção." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Quartos" value={dashboard?.totalRooms ?? 0} />
        <StatCard label="Sujo" value={dashboard?.dirtyRooms ?? 0} tone="danger" />
        <StatCard label="Limpeza" value={dashboard?.cleaningRooms ?? 0} tone="warning" />
        <StatCard label="Tarefas hoje" value={dashboard?.tasksToday ?? 0} tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="p-5">
            <FloorMap rooms={rooms} />
          </CardContent>
        </Card>
        <div className="space-y-4">
          {tasks.slice(0, 3).map((task) => <TaskCard key={task.id} task={task} />)}
          <StaffWorkload data={[{ name: 'Equipe A', tasks: 8 }, { name: 'Equipe B', tasks: 12 }]} />
        </div>
      </div>
    </div>
  );
}
