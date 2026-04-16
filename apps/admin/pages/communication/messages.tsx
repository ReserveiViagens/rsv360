import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMessages } from '@/src/modules/communication/hooks';
import { MessageStatusBadge } from '@/src/modules/communication/components/MessageStatusBadge';
import { ChannelIcon } from '@/src/modules/communication/components/ChannelIcon';
import { MessageTimeline } from '@/src/modules/communication/components/MessageTimeline';
import { formatDateTime } from '@/src/lib/format';

export default function CommunicationMessagesPage() {
  const { data = [] } = useMessages();
  const current = data[0];

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Communication"
        title="Mensagens"
        description="Fila, status e histórico de disparos."
        actions={
          <Button asChild>
            <Link href="/communication/messages/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova mensagem
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enviado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell><div className="flex items-center gap-2"><ChannelIcon channel={message.channel} />{message.channel}</div></TableCell>
                    <TableCell>{message.to}</TableCell>
                    <TableCell><MessageStatusBadge status={message.status} /></TableCell>
                    <TableCell>{formatDateTime(message.sent_at || message.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <MessageTimeline status={current?.status} />
      </div>
    </div>
  );
}
