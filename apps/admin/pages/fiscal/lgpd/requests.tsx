import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLGPDRequests } from '@/src/modules/fiscal/hooks';
import { LGPDRequestStatusBadge } from '@/src/modules/fiscal/components/LGPDRequestStatusBadge';

export default function LGPDRequestsPage() {
  const { data = [] } = useLGPDRequests();

  return (
    <div className="space-y-6">
      <PageHeader badge="Fiscal" title="Requisições LGPD" description="SLA, processamento e prazos legais." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Guest ID" />
          <Select defaultValue=""><option value="">Tipo</option></Select>
          <Select defaultValue=""><option value="">Status</option></Select>
          <Button>Nova requisição</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.request_type}</TableCell>
                  <TableCell><LGPDRequestStatusBadge status={request.status} /></TableCell>
                  <TableCell>{request.deadline}</TableCell>
                  <TableCell><Button variant="outline" size="sm">Processar</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
