/**
 * ✅ TAREFA MEDIUM-1: Componente de Checkout Klarna
 * UI para "Reserve Now, Pay Later"
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Calendar, DollarSign, CheckCircle2, XCircle, Loader2 } from '@/lib/lucide-icons';
import { toast } from 'sonner';

interface KlarnaCheckoutProps {
  bookingId: number;
  amount: number;
  currency?: string;
  checkInDate: Date | string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export function KlarnaCheckout({
  bookingId,
  amount,
  currency = 'BRL',
  checkInDate,
  onSuccess,
  onError,
}: KlarnaCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null);
  const [session, setSession] = useState<{ session_id: string; client_token: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkEligibility();
  }, [amount, checkInDate]);

  const checkEligibility = async () => {
    try {
      const response = await fetch('/api/payments/klarna/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          check_in_date: typeof checkInDate === 'string' ? checkInDate : checkInDate.toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setEligibility(result.data);
      }
    } catch (error: any) {
      console.error('Erro ao verificar elegibilidade:', error);
    }
  };

  const createSession = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/klarna/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          amount,
          currency,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSession(result.data);
        toast.success('Sessão Klarna criada com sucesso!');
      } else {
        throw new Error(result.error || 'Erro ao criar sessão');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar sessão Klarna');
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (authorizationToken: string) => {
    if (!session) return;

    try {
      setProcessing(true);
      const response = await fetch('/api/payments/klarna/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          session_id: session.session_id,
          authorization_token: authorizationToken,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Pagamento processado com sucesso!');
        onSuccess?.(result.data.order_id);
      } else {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar pagamento');
      onError?.(error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (eligibility === null) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!eligibility.eligible) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            Pay Later não disponível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{eligibility.reason || 'Esta reserva não é elegível para Pay Later'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Reserve Now, Pay Later
        </CardTitle>
        <CardDescription>
          Reserve agora e pague depois com Klarna
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Valor total</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount)}
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Elegível
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Check-in: {new Date(checkInDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>Pague em até 30 dias ou parcelado</span>
          </div>
        </div>

        {!session ? (
          <Button onClick={createSession} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando sessão...
              </>
            ) : (
              'Continuar com Klarna'
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Sessão criada! Use o token abaixo para integrar com o widget Klarna.
                <br />
                <code className="text-xs mt-2 block p-2 bg-muted rounded">
                  {session.client_token.substring(0, 50)}...
                </code>
              </AlertDescription>
            </Alert>

            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Próximos passos:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Integre o widget Klarna usando o client_token</li>
                <li>Quando o usuário autorizar, chame processPayment com o authorization_token</li>
                <li>O pagamento será processado automaticamente</li>
              </ol>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                // Exemplo: processPayment('authorization_token_aqui');
                toast.info('Integre o widget Klarna para obter o authorization_token');
              }}
              disabled={processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Processar Pagamento (Exemplo)'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

