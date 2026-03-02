/**
 * ✅ TAREFA MEDIUM-3: Componente para gerenciar sincronização Google Calendar
 * UI para conectar, sincronizar e gerenciar Google Calendar
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, RefreshCw, CheckCircle2, XCircle, Loader2, ExternalLink, Sync } from '@/lib/lucide-icons';
import { toast } from 'sonner';

interface GoogleCalendarSyncProps {
  hostId: number;
  propertyId?: number;
  bookingId?: number;
  onSyncComplete?: () => void;
}

export function GoogleCalendarSync({
  hostId,
  propertyId,
  bookingId,
  onSyncComplete,
}: GoogleCalendarSyncProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<{
    connected: boolean;
    expired?: boolean;
    created_at?: string;
  } | null>(null);

  useEffect(() => {
    checkStatus();
  }, [hostId]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calendar/google/status?host_id=${hostId}`);
      const result = await response.json();

      if (result.success) {
        setStatus(result.data);
      }
    } catch (error: any) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = () => {
    // Redirecionar para OAuth
    window.location.href = '/api/auth/google?redirect=/admin/settings';
  };

  const syncToCalendar = async () => {
    if (!bookingId) {
      toast.error('ID da reserva é necessário');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('/api/calendar/google/sync-to-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          host_id: hostId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Reserva sincronizada com Google Calendar!');
        onSyncComplete?.();
      } else {
        throw new Error(result.error || 'Erro ao sincronizar');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar para Google Calendar');
    } finally {
      setSyncing(false);
    }
  };

  const syncFromCalendar = async () => {
    if (!propertyId) {
      toast.error('ID da propriedade é necessário');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('/api/calendar/google/sync-from-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host_id: hostId,
          property_id: propertyId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.data.message || 'Disponibilidade sincronizada!');
        onSyncComplete?.();
      } else {
        throw new Error(result.error || 'Erro ao sincronizar');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar do Google Calendar');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Sincronização Google Calendar
        </CardTitle>
        <CardDescription>
          Sincronize suas reservas com o Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status?.connected ? (
          <div className="space-y-4">
            <Alert>
              <XCircle className="w-4 h-4" />
              <AlertDescription>
                Google Calendar não está conectado. Conecte sua conta para sincronizar reservas.
              </AlertDescription>
            </Alert>

            <Button onClick={connectGoogleCalendar} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Conectar Google Calendar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className={status.expired ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}>
              {status.expired ? (
                <XCircle className="w-4 h-4 text-yellow-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              )}
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {status.expired ? 'Conexão expirada' : 'Google Calendar conectado'}
                    </p>
                    {status.created_at && (
                      <p className="text-sm text-muted-foreground">
                        Conectado em {new Date(status.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <Badge variant={status.expired ? 'destructive' : 'success'}>
                    {status.expired ? 'Expirado' : 'Ativo'}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookingId && (
                <Button
                  onClick={syncToCalendar}
                  disabled={syncing || status.expired}
                  variant="outline"
                  className="w-full"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <Sync className="w-4 h-4 mr-2" />
                      Sincronizar Reserva
                    </>
                  )}
                </Button>
              )}

              {propertyId && (
                <Button
                  onClick={syncFromCalendar}
                  disabled={syncing || status.expired}
                  variant="outline"
                  className="w-full"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Importar Disponibilidade
                    </>
                  )}
                </Button>
              )}
            </div>

            {status.expired && (
              <Button onClick={connectGoogleCalendar} variant="default" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Reconectar Google Calendar
              </Button>
            )}

            <div className="flex justify-end">
              <Button variant="ghost" onClick={checkStatus} disabled={loading} size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar Status
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

