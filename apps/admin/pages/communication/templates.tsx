import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useTemplates } from '@/src/modules/communication/hooks';
import { MessageStatusBadge } from '@/src/modules/communication/components/MessageStatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/src/lib/format';

export default function CommunicationTemplatesPage() {
  const { data = [] } = useTemplates();

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Communication"
        title="Templates"
        description="Crie e gerencie templates por canal."
        actions={
          <Button asChild>
            <Link href="/communication/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo template
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar template..." />
          <Select defaultValue="">
            <option value="">Todos canais</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </Select>
          <Select defaultValue="">
            <option value="">Todos tipos</option>
            <option value="welcome">Welcome</option>
            <option value="confirmation">Confirmação</option>
          </Select>
          <Select defaultValue="">
            <option value="">Ordenar</option>
            <option value="recent">Recentes</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{template.name}</p>
                      <p className="text-xs text-slate-500">{template.subject || 'Sem assunto'}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{template.channel}</Badge></TableCell>
                  <TableCell><MessageStatusBadge status={template.active === false ? 'failed' : 'sent'} /></TableCell>
                  <TableCell>{formatDateTime(template.updated_at)}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/communication/templates/${template.id}`}>Editar</Link>
                    </Button>
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
