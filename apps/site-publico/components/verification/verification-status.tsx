"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, AlertCircle, FileText, Image } from 'lucide-react';
import { VerificationLevelBadge, VerificationBadgesList } from './VerificationLevelBadge';
import type { PropertyVerificationStatus } from '@/lib/verification-levels-service';

interface VerificationStatusProps {
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  documentsCount?: number;
  photosCount?: number;
  rejectionReason?: string;
  propertyId?: number;
  verificationStatus?: PropertyVerificationStatus;
}

export function VerificationStatus({
  status,
  submittedAt,
  reviewedAt,
  reviewedBy,
  notes,
  documentsCount = 0,
  photosCount = 0,
  rejectionReason,
  propertyId,
  verificationStatus,
}: VerificationStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          badge: (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Aprovado
            </Badge>
          ),
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          progress: 100,
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          badge: (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Rejeitado
            </Badge>
          ),
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          progress: 0,
        };
      case 'in_review':
        return {
          icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
          badge: (
            <Badge variant="secondary" className="bg-yellow-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Em Revisão
            </Badge>
          ),
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          progress: 50,
        };
      default:
        return {
          icon: <Clock className="h-6 w-6 text-blue-600" />,
          badge: (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Pendente
            </Badge>
          ),
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          borderColor: 'border-blue-200 dark:border-blue-800',
          progress: 25,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config.icon}
            <div>
              <CardTitle className={config.color}>Status da Verificação</CardTitle>
              <CardDescription>
                Acompanhe o progresso da sua solicitação
              </CardDescription>
            </div>
          </div>
          {config.badge}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Progresso</p>
          <Progress value={config.progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {config.progress === 100
              ? 'Verificação concluída'
              : config.progress === 50
              ? 'Em análise pela equipe'
              : config.progress === 25
              ? 'Aguardando revisão'
              : 'Verificação rejeitada'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Enviado em</p>
            <p className="text-sm font-medium">
              {new Date(submittedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {reviewedAt && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Revisado em</p>
              <p className="text-sm font-medium">
                {new Date(reviewedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>

        {reviewedBy && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Revisado por</p>
            <p className="text-sm font-medium">{reviewedBy}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Documentos</p>
              <p className="text-sm font-semibold">{documentsCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Fotos</p>
              <p className="text-sm font-semibold">{photosCount}</p>
            </div>
          </div>
        </div>

        {notes && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">Observações</p>
            <p className="text-sm">{notes}</p>
          </div>
        )}

        {rejectionReason && status === 'rejected' && (
          <div className="pt-4 border-t">
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">
                Motivo da Rejeição
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">{rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Exibir nível e badges se disponível */}
        {verificationStatus && status === 'approved' && (
          <div className="pt-4 border-t space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Nível de Verificação</p>
              <VerificationLevelBadge status={verificationStatus} showProgress={true} size="md" />
            </div>
            {verificationStatus.badges.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Badges</p>
                <VerificationBadgesList status={verificationStatus} />
              </div>
            )}
          </div>
        )}

        {status === 'pending' && (
          <div className="pt-4 border-t">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
                Próximos Passos
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Sua solicitação está na fila de revisão. Nossa equipe analisará os documentos e
                fotos enviados. Você receberá uma notificação quando a verificação for concluída.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

