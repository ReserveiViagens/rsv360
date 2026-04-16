import { useRouter } from 'next/router';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTask } from '@/src/modules/housekeeping/hooks';
import { ChecklistProgress } from '@/src/modules/housekeeping/components/ChecklistProgress';

export default function TaskDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const isNew = id === 'new';
  const { data } = useTask(isNew ? undefined : id);
  const checklist = data?.checklist || [];
  const done = checklist.filter((item) => item.done).length;

  return (
    <div className="space-y-6">
      <PageHeader badge="Housekeeping" title={data?.title || (isNew ? 'Nova tarefa' : `Tarefa #${id || ''}`)} description="Checklist interativo e timeline de execução." actions={<Button asChild variant="outline"><Link href="/housekeeping/tasks">Voltar</Link></Button>} />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2"><Label>Título</Label><Input defaultValue={data?.title || ''} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea rows={5} /></div>
            <ChecklistProgress done={done} total={checklist.length} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            {checklist.map((item) => (
              <label key={item.label} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                <Checkbox checked={item.done} />
                <span className={item.done ? 'text-slate-400 line-through' : 'text-slate-900'}>{item.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
