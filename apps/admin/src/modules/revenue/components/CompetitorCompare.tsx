import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CompetitorRate } from '../types';
import { formatCurrency } from '@/src/lib/format';

export function CompetitorCompare({ data }: { data: CompetitorRate[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comparativo de concorrentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concorrente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Tarifa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.competitor}</TableCell>
                <TableCell>{item.room_type || '-'}</TableCell>
                <TableCell>{formatCurrency(item.rate, item.currency || 'BRL')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
