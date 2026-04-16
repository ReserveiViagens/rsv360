import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTasks } from '@/src/modules/housekeeping/hooks';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/src/lib/format';

export default function TasksListPage() {
  const { data = [] } = useTasks();

  return (
    <div className="space-y-6">
      <PageHeader badge="Housekeeping" title="Tarefas" description="Fila, assign e inspeção." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar tarefa..." />
          <Select defaultValue=""><option value="">Status</option><option value="pending">Pending</option><option value="in_progress">In progress</option></Select>
          <Select defaultValue=""><option value="">Prioridade</option></Select>
          <div className="flex items-center justify-end"><Button asChild><Link href="/housekeeping/tasks/new">Nova tarefa</Link></Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Criada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((task) => (
                <TableRow key={task.id}>
                  <TableCell><Link href={`/housekeeping/tasks/${task.id}`} className="font-medium text-slate-900 hover:underline">{task.title}</Link></TableCell>
                  <TableCell><Badge variant="outline">{task.status}</Badge></TableCell>
                  <TableCell>{task.assignee_name || '-'}</TableCell>
                  <TableCell>{formatDateTime(task.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
