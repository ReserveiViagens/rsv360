'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/providers/toast-wrapper';

interface EnhancedParticipant {
  id: number;
  email: string;
  name?: string;
  amount: number;
  status: 'pending' | 'invited' | 'paid' | 'cancelled' | 'overdue';
  paymentLink?: string;
  paidAt?: string;
}

interface EnhancedSplitPayment {
  id: number;
  bookingId: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'partial' | 'completed' | 'cancelled' | 'overdue';
  participants: EnhancedParticipant[];
  deadline?: string;
}

interface SplitPaymentDashboardProps {
  splitPaymentId: number;
  userId?: number;
}

export function SplitPaymentDashboard({ splitPaymentId, userId }: SplitPaymentDashboardProps) {
  const { toast } = useToast();
  const [splitPayment, setSplitPayment] = useState<EnhancedSplitPayment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSplitPayment();
  }, [splitPaymentId]);

  const loadSplitPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/split-payments?id=${splitPaymentId}`);
      const data = await response.json();
      if (data.success) {
        setSplitPayment(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar split payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (participantId: number, paymentMethod: string) => {
    try {
      const response = await fetch('/api/split-payments/enhanced', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          splitPaymentId,
          participantId,
          paymentMethod,
          paymentData: {},
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Pagamento processado',
          description: 'Seu pagamento foi processado com sucesso',
        });
        loadSplitPayment();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao processar pagamento',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!splitPayment) {
    return <div>Split payment não encontrado</div>;
  }

  const paidAmount = splitPayment.participants
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = splitPayment.totalAmount - paidAmount;
  const paidPercentage = (paidAmount / splitPayment.totalAmount) * 100;

  const statusLabels = {
    pending: 'Pendente',
    partial: 'Parcial',
    completed: 'Completo',
    cancelled: 'Cancelado',
    overdue: 'Atrasado',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    partial: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    overdue: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Divisão de Pagamento
          </div>
          <Badge className={statusColors[splitPayment.status]}>
            {statusLabels[splitPayment.status]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold">
              {splitPayment.currency} {splitPayment.totalAmount.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Pago</div>
            <div className="text-2xl font-bold text-green-600">
              {splitPayment.currency} {paidAmount.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Pendente</div>
            <div className="text-2xl font-bold text-red-600">
              {splitPayment.currency} {pendingAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso</span>
            <span>{paidPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>

        {/* Participantes */}
        <div>
          <div className="font-semibold mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Participantes ({splitPayment.participants.length})
          </div>
          <div className="space-y-2">
            {splitPayment.participants.map((participant) => (
              <div
                key={participant.id}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{participant.name || participant.email}</div>
                  <div className="text-sm text-gray-500">
                    {splitPayment.currency} {participant.amount.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {participant.status === 'paid' ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Pago
                    </Badge>
                  ) : participant.status === 'overdue' ? (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Atrasado
                    </Badge>
                  ) : (
                    <>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                      {participant.paymentLink && (
                        <Button
                          size="sm"
                          onClick={() => window.open(participant.paymentLink, '_blank')}
                        >
                          Pagar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline */}
        {splitPayment.deadline && (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm text-gray-600">Prazo:</div>
            <div className="font-semibold">
              {new Date(splitPayment.deadline).toLocaleDateString('pt-BR')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

