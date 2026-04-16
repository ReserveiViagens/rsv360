import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useChannels } from '@/src/modules/communication/hooks';
import { ChannelIcon } from '@/src/modules/communication/components/ChannelIcon';

export default function CommunicationChannelsPage() {
  const { data = [] } = useChannels();

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Communication"
        title="Canais"
        description="Credenciais, status e teste de conexão."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((channel) => (
          <Card key={channel.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <ChannelIcon channel={channel.channel} />
                <p className="font-medium text-slate-900">{channel.channel}</p>
              </div>
              <div className="grid gap-3">
                <div className="space-y-2"><Label>Provider</Label><Input defaultValue={channel.provider || ''} /></div>
                <div className="space-y-2"><Label>Config JSON</Label><Input defaultValue={JSON.stringify(channel.config || {})} /></div>
                <Button variant="outline">Testar conexão</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
