import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LoyaltyTransaction } from '../types';
import { formatDateTime } from '@/src/lib/format';

export function PointsStatement({ items }: { items: LoyaltyTransaction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Extrato de pontos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Pontos</TableHead>
              <TableHead>Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDateTime(item.created_at)}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.points}</TableCell>
                <TableCell>{item.balance_after ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
