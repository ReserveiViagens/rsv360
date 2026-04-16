import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFNRH } from '@/src/modules/fiscal/hooks';
import { FNRHForm } from '@/src/modules/fiscal/components/FNRHForm';

export default function FNRHListPage() {
  const { data = [] } = useFNRH();

  return (
    <div className="space-y-6">
      <PageHeader badge="Fiscal" title="FNRH" description="Registro nacional e exportação Embratur." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar hóspede..." />
          <Select defaultValue=""><option value="">Status</option></Select>
          <Select defaultValue=""><option value="">Mês</option></Select>
          <Button>Exportar Embratur</Button>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.full_name}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.check_in_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <FNRHForm />
      </div>
    </div>
  );
}
