/**
 * ✅ FASE 6.9: ClaimStatus Component
 * 
 * Componente para exibir o status de um sinistro
 */

'use client';

import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  DollarSign,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ClaimStatusProps {
  claimId: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'closed';
  claimNumber?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  paidAt?: Date;
  claimedAmount?: number;
  approvedAmount?: number;
  rejectedAmount?: number;
  rejectionReason?: string;
  reviewNotes?: string;
  reviewerName?: string;
  paymentMethod?: string;
  paymentReference?: string;
}

export function ClaimStatus({
  claimId,
  status,
  claimNumber,
  submittedAt,
  reviewedAt,
  paidAt,
  claimedAmount,
  approvedAmount,
  rejectedAmount,
  rejectionReason,
  reviewNotes,
  reviewerName,
  paymentMethod,
  paymentReference,
}: ClaimStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'Aguardando Análise',
          description: 'Seu sinistro foi recebido e está na fila para análise.',
        };
      case 'under_review':
        return {
          icon: AlertCircle,
          color: 'text-blue-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'Em Análise',
          description: 'Nossa equipe está analisando seu sinistro.',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-50',
          border: 'border-green-200',
          title: 'Aprovado',
          description: 'Seu sinistro foi aprovado! O pagamento será processado em breve.',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'Rejeitado',
          description: 'Seu sinistro foi rejeitado.',
        };
      case 'paid':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          border: 'border-green-300',
          title: 'Pago',
          description: 'O pagamento foi processado com sucesso!',
        };
      case 'closed':
        return {
          icon: CheckCircle,
          color: 'text-gray-500',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          title: 'Encerrado',
          description: 'Este sinistro foi encerrado.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Status Principal */}
      <Card className={`p-6 ${config.bg} ${config.border}`}>
        <div className="flex items-start gap-4">
          <Icon className={`h-8 w-8 ${config.color} flex-shrink-0`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">{config.title}</h3>
              {claimNumber && (
                <span className="text-sm text-gray-600">#{claimNumber}</span>
              )}
            </div>
            <p className="text-gray-700 mb-4">{config.description}</p>

            {/* Informações de Datas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {submittedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Submetido em:</p>
                    <p className="font-medium">
                      {new Date(submittedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
              {reviewedAt && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Revisado em:</p>
                    <p className="font-medium">
                      {new Date(reviewedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
              {paidAt && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Pago em:</p>
                    <p className="font-medium">
                      {new Date(paidAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Valores */}
      {(claimedAmount || approvedAmount || rejectedAmount) && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Valores
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {claimedAmount && (
              <div>
                <p className="text-sm text-gray-500">Valor Reclamado</p>
                <p className="text-lg font-semibold">
                  R$ {claimedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            {approvedAmount && (
              <div>
                <p className="text-sm text-gray-500">Valor Aprovado</p>
                <p className="text-lg font-semibold text-green-600">
                  R$ {approvedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            {rejectedAmount && (
              <div>
                <p className="text-sm text-gray-500">Valor Rejeitado</p>
                <p className="text-lg font-semibold text-red-600">
                  R$ {rejectedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Motivo de Rejeição */}
      {rejectionReason && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Motivo da Rejeição
          </h4>
          <p className="text-red-700">{rejectionReason}</p>
        </Card>
      )}

      {/* Notas de Revisão */}
      {reviewNotes && (
        <Card className="p-6">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas da Revisão
          </h4>
          <p className="text-gray-700">{reviewNotes}</p>
          {reviewerName && (
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
              <User className="h-4 w-4" />
              Revisado por: {reviewerName}
            </p>
          )}
        </Card>
      )}

      {/* Informações de Pagamento */}
      {status === 'paid' && paymentMethod && (
        <Card className="p-6 border-green-200 bg-green-50">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Informações de Pagamento
          </h4>
          <div className="space-y-2">
            <p className="text-green-700">
              <span className="font-medium">Método:</span> {paymentMethod}
            </p>
            {paymentReference && (
              <p className="text-green-700">
                <span className="font-medium">Referência:</span> {paymentReference}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

