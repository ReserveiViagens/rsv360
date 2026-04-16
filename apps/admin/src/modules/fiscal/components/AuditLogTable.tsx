import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LGPDAuditLog } from '../types';
import { formatDateTime } from '@/src/lib/format';

export function AuditLogTable({ items }: { items: LGPDAuditLog[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Auditoria LGPD</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDateTime(item.created_at)}</TableCell>
                <TableCell>{item.entity_type}</TableCell>
                <TableCell>{item.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
