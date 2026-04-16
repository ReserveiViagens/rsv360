import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGuestSearch, useGuests } from '@/src/modules/crm/hooks';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/src/lib/format';

export default function GuestsListPage() {
  const { data = [] } = useGuests();
  const search = useGuestSearch('Silva');

  const items = search.data?.length ? search.data : data;

  return (
    <div className="space-y-6">
      <PageHeader badge="CRM" title="Hóspedes" description="Busca, lifecycle e filtros por segmento." actions={<Button asChild><Link href="/crm/guests/new">Novo hóspede</Link></Button>} />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar hóspedes..." />
          <Select defaultValue=""><option value="">Lifecycle</option><option value="loyal">Loyal</option></Select>
          <Select defaultValue=""><option value="">Segmento</option></Select>
          <Button variant="outline">Filtrar</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Lifecycle</TableHead>
                <TableHead>Estadias</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell><Link href={`/crm/guests/${guest.id}`} className="font-medium text-slate-900 hover:underline">{guest.first_name} {guest.last_name}</Link></TableCell>
                  <TableCell><Badge variant="outline">{guest.lifecycle_stage}</Badge></TableCell>
                  <TableCell>{guest.total_stays || 0}</TableCell>
                  <TableCell>{formatCurrency(guest.total_revenue || 0)}</TableCell>
                  <TableCell><Button asChild variant="outline" size="sm"><Link href={`/crm/guests/${guest.id}`}>Abrir</Link></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
