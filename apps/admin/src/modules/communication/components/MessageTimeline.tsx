import { CheckCircle2, Circle, Send, MailOpen, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/src/lib/utils';

const steps = [
  { key: 'queued', label: 'Enfileirada', icon: Circle },
  { key: 'sent', label: 'Enviada', icon: Send },
  { key: 'delivered', label: 'Entregue', icon: CheckCircle2 },
  { key: 'opened', label: 'Aberta', icon: MailOpen },
  { key: 'failed', label: 'Falhou', icon: XCircle },
] as const;

export function MessageTimeline({ status }: { status?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Linha do tempo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const active = status === step.key || steps.findIndex((item) => item.key === step.key) <= steps.findIndex((item) => item.key === status);
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full border', active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-400')}>
                <Icon className="h-4 w-4" />
              </div>
              <p className={cn('text-sm font-medium', active ? 'text-slate-900' : 'text-slate-500')}>{step.label}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
