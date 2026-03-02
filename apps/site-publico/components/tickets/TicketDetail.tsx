'use client';

/**
 * Componente: Detalhes do Ticket
 * Exibe informações completas do ticket e permite interações
 */

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Loader2, 
  MessageSquare, 
  Send, 
  User, 
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketComment } from './TicketComment';
import { Checkbox } from '@/components/ui/checkbox';

interface TicketDetailProps {
  ticketId: number;
  currentUserId?: number;
  currentUserRole?: string;
  onUpdate?: () => void;
}

interface Ticket {
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
  comments?: any[];
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em Progresso',
  waiting_customer: 'Aguardando Cliente',
  waiting_third_party: 'Aguardando Terceiros',
  resolved: 'Resolvido',
  closed: 'Fechado',
  cancelled: 'Cancelado'
};

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
  critical: 'Crítica'
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

export function TicketDetail({ 
  ticketId, 
  currentUserId, 
  currentUserRole,
  onUpdate 
}: TicketDetailProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Você precisa estar autenticado');
        return;
      }

      const response = await fetch(`/api/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar ticket');
      }

      const result = await response.json();
      setTicket(result.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comment: commentText,
          is_internal: isInternal && (currentUserRole === 'admin' || currentUserRole === 'staff')
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar comentário');
      }

      setCommentText('');
      setIsInternal(false);
      await loadTicket();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar comentário');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setChangingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao mudar status');
      }

      await loadTicket();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      setError(err.message || 'Erro ao mudar status');
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Ticket não encontrado'}</AlertDescription>
      </Alert>
    );
  }

  const canComment = 
    currentUserRole === 'admin' || 
    currentUserRole === 'staff' || 
    ticket.user_id === currentUserId ||
    ticket.assigned_to === currentUserId;

  const canChangeStatus = 
    currentUserRole === 'admin' || 
    currentUserRole === 'staff' ||
    ticket.assigned_to === currentUserId ||
    (ticket.user_id === currentUserId && ['open', 'closed'].includes(ticket.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
              <CardDescription className="mt-2">
                Ticket #{ticket.ticket_number}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{statusLabels[ticket.status] || ticket.status}</Badge>
              <Badge>{priorityLabels[ticket.priority] || ticket.priority}</Badge>
              <Badge variant="secondary">{categoryLabels[ticket.category] || ticket.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Criado:</span>{' '}
              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: ptBR })}
            </div>
            <div>
              <span className="text-gray-500">Atualizado:</span>{' '}
              {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true, locale: ptBR })}
            </div>
            {ticket.assigned_to && (
              <div>
                <span className="text-gray-500">Atribuído a:</span>{' '}
                Usuário #{ticket.assigned_to}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Status Change (if allowed) */}
      {canChangeStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Alterar Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select
                value={ticket.status}
                onValueChange={handleStatusChange}
                disabled={changingStatus}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="waiting_customer">Aguardando Cliente</SelectItem>
                  <SelectItem value="waiting_third_party">Aguardando Terceiros</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                  {ticket.user_id === currentUserId && (
                    <SelectItem value="cancelled">Cancelar</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Comentários</CardTitle>
          <CardDescription>
            {ticket.comments?.length || 0} comentário{(ticket.comments?.length || 0) !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comments List */}
          {ticket.comments && ticket.comments.length > 0 ? (
            <div className="space-y-4">
              {ticket.comments.map((comment) => (
                <TicketComment
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum comentário ainda</p>
          )}

          {/* Add Comment Form */}
          {canComment && (
            <div className="space-y-3 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="comment">Adicionar Comentário</Label>
                <Textarea
                  id="comment"
                  placeholder="Digite seu comentário..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                />
              </div>
              {(currentUserRole === 'admin' || currentUserRole === 'staff') && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internal"
                    checked={isInternal}
                    onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                  />
                  <Label htmlFor="internal" className="text-sm">
                    Comentário interno (visível apenas para staff)
                  </Label>
                </div>
              )}
              <Button
                onClick={handleAddComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Comentário
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

