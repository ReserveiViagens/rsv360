import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { FileItem } from '../types';
import { formatDate } from '@/src/lib/format';

export function FileList({
  files,
  onDelete,
}: {
  files: FileItem[];
  onDelete?: (id: number) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Arquivo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="w-36">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{file.folder || 'raiz'}</p>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{file.mime_type || '-'}</Badge></TableCell>
                <TableCell>{Math.round((file.size || 0) / 1024)} KB</TableCell>
                <TableCell>{formatDate(file.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Baixar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete?.(file.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
