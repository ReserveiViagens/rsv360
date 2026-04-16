import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvoices } from '@/src/modules/fiscal/hooks';
import { InvoiceStatusBadge } from '@/src/modules/fiscal/components/InvoiceStatusBadge';

export default function InvoicesListPage() {
  const { data = [] } = useInvoices();

  return (
    <div className="space-y-6">
      <PageHeader badge="Fiscal" title="Invoices" description="Recibos, NFS-e stub e downloads de PDF." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar invoice..." />
          <Select defaultValue=""><option value="">Status</option></Select>
          <Select defaultValue=""><option value="">Tipo</option></Select>
          <Button>Criar invoice</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.number || invoice.id}</TableCell>
                  <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                  <TableCell>{invoice.total}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">PDF</Button>
                      <Button variant="outline" size="sm">NFS-e</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
