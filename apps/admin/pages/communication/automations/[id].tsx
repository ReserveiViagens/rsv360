import { useRouter } from 'next/router';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAutomations } from '@/src/modules/communication/hooks';

export default function AutomationEditorPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const { data = [] } = useAutomations();
  const automation = data.find((item) => String(item.id) === String(id));

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Communication"
        title={id === 'new' ? 'Nova automação' : `Automação #${id || ''}`}
        description="Trigger → Canal → Template → Delay → Conditions"
        actions={<Button asChild variant="outline"><Link href="/communication/automations">Voltar</Link></Button>}
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Nome</Label><Input defaultValue={automation?.name || ''} /></div>
            <div className="space-y-2"><Label>Trigger</Label><Input defaultValue={automation?.trigger || ''} /></div>
            <div className="space-y-2"><Label>Canal</Label><Select defaultValue={automation?.channel || 'email'}><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></Select></div>
            <div className="space-y-2"><Label>Template</Label><Input placeholder="ID do template" defaultValue={automation?.template_id || ''} /></div>
            <div className="space-y-2"><Label>Delay (min)</Label><Input type="number" defaultValue={automation?.delay_minutes || 0} /></div>
            <div className="flex items-end gap-3">
              <Label>Ativa</Label>
              <Switch checked={automation?.enabled ?? true} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Condições</Label>
            <Textarea rows={6} placeholder="Ex.: total_stays >= 2 && lifecycle_stage === 'repeat'" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
