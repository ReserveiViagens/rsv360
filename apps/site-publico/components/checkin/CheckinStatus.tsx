'use client';

/**
 * Componente: Status do Check-in
 * Exibe o status visual do check-in com timeline de progresso
 */

import { CheckCircle2, Clock, XCircle, AlertCircle, FileCheck, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CheckinStatusProps {
  status: 'pending' | 'documents_pending' | 'verified' | 'checked_in' | 'checked_out' | 'cancelled';
  documentsVerified?: boolean;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  checkInCode?: string;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    color: 'bg-gray-500',
    icon: Clock,
    description: 'Aguardando início do processo'
  },
  documents_pending: {
    label: 'Documentos Pendentes',
    color: 'bg-yellow-500',
    icon: FileCheck,
    description: 'Aguardando verificação de documentos'
  },
  verified: {
    label: 'Verificado',
    color: 'bg-blue-500',
    icon: CheckCircle2,
    description: 'Documentos verificados, pronto para check-in'
  },
  checked_in: {
    label: 'Check-in Realizado',
    color: 'bg-green-500',
    icon: CheckCircle2,
    description: 'Check-in realizado com sucesso'
  },
  checked_out: {
    label: 'Check-out Realizado',
    color: 'bg-purple-500',
    icon: CheckCircle2,
    description: 'Check-out realizado com sucesso'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-500',
    icon: XCircle,
    description: 'Check-in foi cancelado'
  }
};

export function CheckinStatus({
  status,
  documentsVerified = false,
  checkInAt,
  checkOutAt,
  checkInCode
}: CheckinStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Calcular progresso
  const getProgress = () => {
    switch (status) {
      case 'pending':
        return 0;
      case 'documents_pending':
        return 25;
      case 'verified':
        return 50;
      case 'checked_in':
        return 75;
      case 'checked_out':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  // Timeline de etapas
  const steps = [
    { 
      id: 'pending', 
      label: 'Solicitação Criada', 
      completed: status !== 'pending' 
    },
    { 
      id: 'documents', 
      label: 'Documentos Enviados', 
      completed: status !== 'pending' && status !== 'documents_pending' 
    },
    { 
      id: 'verified', 
      label: 'Documentos Verificados', 
      completed: documentsVerified || status === 'verified' || status === 'checked_in' || status === 'checked_out' 
    },
    { 
      id: 'checked_in', 
      label: 'Check-in Realizado', 
      completed: status === 'checked_in' || status === 'checked_out' 
    },
    { 
      id: 'checked_out', 
      label: 'Check-out Realizado', 
      completed: status === 'checked_out' 
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
          Status do Check-in
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Badge de Status */}
        <div className="flex items-center gap-2">
          <Badge className={config.color}>
            {config.label}
          </Badge>
          {checkInCode && (
            <span className="text-sm text-muted-foreground">
              Código: {checkInCode}
            </span>
          )}
        </div>

        {/* Barra de Progresso */}
        {status !== 'cancelled' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{getProgress()}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}

        {/* Timeline de Etapas */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = !step.completed && 
              (index === 0 || steps[index - 1]?.completed);
            
            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  {step.completed ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  ) : isActive ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                      <div className="h-2 w-2 rounded-full bg-gray-500" />
                    </div>
                  )}
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ minHeight: '24px' }}
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p
                    className={`text-sm font-medium ${
                      step.completed
                        ? 'text-green-600'
                        : isActive
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-2 pt-4 border-t">
          {checkInAt && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>
                Check-in realizado em:{' '}
                {new Date(checkInAt).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
          {checkOutAt && (
            <div className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4 text-purple-500" />
              <span>
                Check-out realizado em:{' '}
                {new Date(checkOutAt).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

