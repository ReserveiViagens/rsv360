/**
 * ✅ FASE 6.3: VerificationStatus Component
 * 
 * Componente para exibir o status da verificação de propriedade
 */

'use client';

import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_needed';
  submittedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  requiredActions?: string[];
}

export function VerificationStatus({ 
  status, 
  submittedAt,
  reviewedAt,
  rejectionReason,
  requiredActions 
}: Props) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'Aguardando Análise',
          description: 'Sua solicitação foi recebida e está na fila para revisão.'
        };
      case 'under_review':
        return {
          icon: Clock,
          color: 'text-blue-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'Em Análise',
          description: 'Nossa equipe está analisando sua propriedade.'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-50',
          border: 'border-green-200',
          title: 'Verificada',
          description: 'Sua propriedade foi verificada com sucesso!'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'Rejeitada',
          description: 'Sua solicitação foi rejeitada.'
        };
      case 'more_info_needed':
        return {
          icon: AlertCircle,
          color: 'text-orange-500',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          title: 'Informações Adicionais Necessárias',
          description: 'Precisamos de mais informações para continuar.'
        };
    }
  };
  
  const config = getStatusConfig();
  const Icon = config.icon;
  
  return (
    <div className={`rounded-lg border p-6 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-4">
        <Icon className={`h-6 w-6 ${config.color} flex-shrink-0`} />
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{config.title}</h3>
          <p className="text-gray-600 mb-4">{config.description}</p>
          
          {submittedAt && (
            <p className="text-sm text-gray-500">
              Submetido em: {new Date(submittedAt).toLocaleDateString('pt-BR')}
            </p>
          )}
          
          {reviewedAt && (
            <p className="text-sm text-gray-500">
              Revisado em: {new Date(reviewedAt).toLocaleDateString('pt-BR')}
            </p>
          )}
          
          {rejectionReason && (
            <div className="mt-4 p-3 bg-white rounded border border-red-200">
              <p className="text-sm font-medium text-red-800 mb-1">
                Motivo da Rejeição:
              </p>
              <p className="text-sm text-red-600">{rejectionReason}</p>
            </div>
          )}
          
          {requiredActions && requiredActions.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded border border-orange-200">
              <p className="text-sm font-medium text-orange-800 mb-2">
                Ações Necessárias:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {requiredActions.map((action, index) => (
                  <li key={index} className="text-sm text-orange-600">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

