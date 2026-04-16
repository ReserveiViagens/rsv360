import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCampaigns } from '@/src/modules/crm/hooks';
import { CampaignStatusBadge } from '@/src/modules/crm/components/CampaignStatusBadge';

export default function CampaignsListPage() {
  const { data = [] } = useCampaigns();

  return (
    <div className="space-y-6">
      <PageHeader badge="CRM" title="Campanhas" description="Audience builder, schedule e envio." actions={<Button asChild><Link href="/crm/campaigns/new">Nova campanha</Link></Button>} />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar campanha..." />
          <Select defaultValue=""><option value="">Tipo</option></Select>
          <Select defaultValue=""><option value="">Status</option></Select>
          <Button variant="outline">Filtrar</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell><Link href={`/crm/campaigns/${campaign.id}`} className="font-medium text-slate-900 hover:underline">{campaign.name}</Link></TableCell>
                  <TableCell>{campaign.type}</TableCell>
                  <TableCell><CampaignStatusBadge status={campaign.status} /></TableCell>
                  <TableCell>{campaign.audience_count || 0}</TableCell>
                  <TableCell><Button asChild variant="outline" size="sm"><Link href={`/crm/campaigns/${campaign.id}`}>Editar</Link></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
