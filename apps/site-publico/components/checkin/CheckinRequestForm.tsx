'use client';

/**
 * Componente: Formulário de Solicitação de Check-in
 * Permite ao usuário solicitar um check-in digital para sua reserva
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckinRequestFormProps {
  bookingId: number;
  propertyId: number;
  onSuccess?: (checkinId: number) => void;
}

export function CheckinRequestForm({ 
  bookingId, 
  propertyId, 
  onSuccess 
}: CheckinRequestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkinId, setCheckinId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Obter token de autenticação
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Você precisa estar autenticado para solicitar check-in');
        setLoading(false);
        return;
      }

      // Obter ID do usuário do token (simplificado - em produção, decodificar JWT)
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao obter informações do usuário');
      }

      const userData = await response.json();
      const userId = userData.id;

      // Criar solicitação de check-in
      const checkinResponse = await fetch('/api/checkin/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: bookingId,
          user_id: userId,
          property_id: propertyId
        })
      });

      if (!checkinResponse.ok) {
        const errorData = await checkinResponse.json();
        throw new Error(errorData.error || 'Erro ao criar solicitação de check-in');
      }

      const checkinData = await checkinResponse.json();
      setCheckinId(checkinData.data.id);
      setSuccess(true);

      if (onSuccess) {
        onSuccess(checkinData.data.id);
      }

      // Redirecionar para página de check-in após 2 segundos
      setTimeout(() => {
        router.push(`/checkin/${checkinData.data.id}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Check-in Solicitado com Sucesso!
          </CardTitle>
          <CardDescription>
            Redirecionando para a página de check-in...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Seu check-in foi criado. Você será redirecionado em instantes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Check-in Digital</CardTitle>
        <CardDescription>
          Crie uma solicitação de check-in digital para sua reserva
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="bookingId">ID da Reserva</Label>
            <Input
              id="bookingId"
              type="number"
              value={bookingId}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Este é o ID da sua reserva
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyId">ID da Propriedade</Label>
            <Input
              id="propertyId"
              type="number"
              value={propertyId}
              disabled
              className="bg-muted"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando check-in...
              </>
            ) : (
              'Solicitar Check-in Digital'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

