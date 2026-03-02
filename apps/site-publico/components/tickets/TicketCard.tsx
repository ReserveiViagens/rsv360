'use client';

/**
 * Componente: Card de Ticket
 * Exibe informações resumidas de um ticket na lista
 */

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  MessageSquare, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TicketCardProps {
  ticket: {
    id: number;
    ticket_number: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    created_at: string;
    updated_at: string;
    assigned_to?: number | null;
    comments_count?: number;
  };
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  open: { label: 'Aberto', variant: 'default', icon: AlertCircle },
  in_progress: { label: 'Em Progresso', variant: 'default', icon: Loader2 },
  waiting_customer: { label: 'Aguardando Cliente', variant: 'secondary', icon: Clock },
  waiting_third_party: { label: 'Aguardando Terceiros', variant: 'secondary', icon: Clock },
  resolved: { label: 'Resolvido', variant: 'outline', icon: CheckCircle },
  closed: { label: 'Fechado', variant: 'outline', icon: XCircle },
  cancelled: { label: 'Cancelado', variant: 'destructive', icon: XCircle }
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Baixa', className: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Média', className: 'bg-blue-100 text-blue-800' },
  high: { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgente', className: 'bg-red-100 text-red-800' },
  critical: { label: 'Crítica', className: 'bg-red-200 text-red-900 font-bold' }
};

const categoryLabels: Record<string, string> = {
  general: 'Geral',
  technical: 'Técnico',
  billing: 'Faturamento',
  booking: 'Reservas',
  account: 'Conta',
  payment: 'Pagamento',
  refund: 'Reembolso',
  cancellation: 'Cancelamento',
  other: 'Outros'
};

export function TicketCard({ ticket }: TicketCardProps) {
  const status = statusConfig[ticket.status] || statusConfig.open;
  const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
  const StatusIcon = status.icon;

  const timeAgo = formatDistanceToNow(new Date(ticket.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  const descriptionPreview = ticket.description.length > 150
    ? ticket.description.substring(0, 150) + '...'
    : ticket.description;

  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{ticket.subject}</h3>
              <p className="text-sm text-gray-500 mt-1">
                #{ticket.ticket_number}
              </p>
            </div>
            <StatusIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {descriptionPreview}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
            <Badge className={priority.className}>
              {priority.label}
            </Badge>
            <Badge variant="outline">
              {categoryLabels[ticket.category] || ticket.category}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
              {ticket.comments_count !== undefined && ticket.comments_count > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {ticket.comments_count} comentário{ticket.comments_count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {ticket.assigned_to && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Atribuído
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

