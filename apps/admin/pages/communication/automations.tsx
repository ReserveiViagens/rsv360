import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAutomations, useToggleAutomation } from '@/src/modules/communication/hooks';

export default function CommunicationAutomationsPage() {
  const { data = [] } = useAutomations();
  const toggleAutomation = useToggleAutomation();

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Communication"
        title="Automações"
        description="Triggers, canais, delays e condições."
        actions={
          <Button asChild>
            <Link href="/communication/automations/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova automação
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((automation) => (
          <Card key={automation.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{automation.name}</p>
                  <p className="text-sm text-slate-500">{automation.trigger || 'sem trigger'}</p>
                </div>
                <Switch checked={automation.enabled} onChange={(event) => toggleAutomation.mutate({ id: automation.id, enabled: event.target.checked })} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{automation.channel}</Badge>
                <Badge variant="secondary">{automation.delay_minutes || 0} min</Badge>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/communication/automations/${automation.id}`}>Editar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
