'use client';

/**
 * Componente: Comentário de Ticket
 * Exibe um comentário individual do ticket
 */

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Lock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TicketCommentProps {
  comment: {
    id: number;
    user_id: number;
    comment: string;
    is_internal: boolean;
    created_at: string;
    attachments?: string[];
  };
  currentUserId?: number;
}

export function TicketComment({ comment, currentUserId }: TicketCommentProps) {
  const isOwnComment = comment.user_id === currentUserId;
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className={comment.is_internal ? 'border-orange-200 bg-orange-50' : ''}>
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Usuário #{comment.user_id}</span>
              {comment.is_internal && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Interno
                </Badge>
              )}
              {isOwnComment && (
                <Badge variant="secondary" className="text-xs">
                  Você
                </Badge>
              )}
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>

            <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>

            {comment.attachments && comment.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {comment.attachments.map((attachment, idx) => (
                  <a
                    key={idx}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <FileText className="h-3 w-3" />
                    Anexo {idx + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

