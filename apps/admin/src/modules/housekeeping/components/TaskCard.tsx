import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { TaskItem } from '../types';

export function TaskCard({ task }: { task: TaskItem }) {
  const items = task.checklist || [];
  const done = items.filter((item) => item.done).length;
  const progress = items.length ? (done / items.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">{task.title}</CardTitle>
            <p className="text-sm text-slate-500">{task.assignee_name || 'Sem responsável'}</p>
          </div>
          <Badge variant="secondary">{task.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progress} />
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={item.done ? 'h-4 w-4 text-emerald-500' : 'h-4 w-4 text-slate-300'} />
              <span className={item.done ? 'text-slate-900' : 'text-slate-500'}>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-slate-500">Quarto: {task.room_id || '-'}</CardFooter>
    </Card>
  );
}
