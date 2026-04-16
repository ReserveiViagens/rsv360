import { useRouter } from 'next/router';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCampaign, useCampaignStats } from '@/src/modules/crm/hooks';
import { CampaignStatusBadge } from '@/src/modules/crm/components/CampaignStatusBadge';

export default function CampaignEditorPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const isNew = id === 'new';
  const { data: campaign } = useCampaign(isNew ? undefined : id);
  const { data: stats } = useCampaignStats(isNew ? undefined : (id || 0));

  return (
    <div className="space-y-6">
      <PageHeader
        badge="CRM"
        title={campaign?.name || (isNew ? 'Nova campanha' : `Campanha #${id || ''}`)}
        description="Audience builder, template, schedule e envio."
        actions={<Button asChild variant="outline"><Link href="/crm/campaigns">Voltar</Link></Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2"><Input defaultValue={campaign?.name || ''} placeholder="Nome" /></div>
              <div className="space-y-2"><Select defaultValue={campaign?.type || 'email'}><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></Select></div>
              <div className="space-y-2"><Input defaultValue={campaign?.audience_count || 0} placeholder="Audience" /></div>
              <div className="space-y-2"><CampaignStatusBadge status={campaign?.status || 'draft'} /></div>
            </div>
            <Textarea rows={6} placeholder="Segment filter JSON / audience rules" defaultValue={JSON.stringify(campaign?.segment_filter || {}, null, 2)} />
            <Button>Salvar campanha</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="font-semibold text-slate-900">Stats</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3">Sent: {stats?.sent_count ?? 0}</div>
              <div className="rounded-lg border border-slate-200 p-3">Delivered: {stats?.delivered_count ?? 0}</div>
            </div>
            <Button>Enviar agora</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
