import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function StorageSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader badge="Cloud" title="Configurações de storage" description="Provider, quota e credenciais." />
      <Card>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Provider</Label><Input placeholder="s3 / minio" /></div>
          <div className="space-y-2"><Label>Bucket</Label><Input placeholder="rsv360-files" /></div>
          <div className="space-y-2"><Label>Endpoint</Label><Input placeholder="https://..." /></div>
          <div className="space-y-2"><Label>Região</Label><Input placeholder="sa-east-1" /></div>
          <Button className="md:col-span-2">Salvar configuração</Button>
        </CardContent>
      </Card>
    </div>
  );
}
