'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PricingModuleShell } from '../PricingModuleShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingBookingsBreakdown } from '../PricingBookingsBreakdown';
import type { BookingBreakdownItem } from '@/components/analytics/BookingBreakdownTable';

type AlertRow = {
  id: number;
  alert_type?: string;
  type?: string;
  severity: string;
  title: string;
  message: string;
  is_read?: boolean;
  read_at?: string | null;
  created_at: string;
};

const severityClass: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-700',
};

function AlertsPanel({ itemId }: { itemId: string }) {
  const qc = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['pricing-alerts', itemId],
    queryFn: async () => {
      const res = await fetch(`/api/pricing/alerts?property_id=${itemId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar alertas');
      return {
        alerts: (json.data as AlertRow[]) || [],
        breakdown: (json.breakdown as BookingBreakdownItem[]) || [],
      };
    },
  });

  const alerts = data?.alerts;
  const breakdown = data?.breakdown ?? [];

  const generate = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/pricing/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: parseInt(itemId, 10) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao verificar alertas');
      return json.data;
    },
    onSuccess: (data) => {
      toast.success(`${data?.count ?? 0} alerta(s) gerado(s)`);
      qc.invalidateQueries({ queryKey: ['pricing-alerts', itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/pricing/alerts?id=${id}`, { method: 'PUT' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao marcar lido');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing-alerts', itemId] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
          <Bell className="mr-2 h-4 w-4" />
          Verificar oportunidades
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando alertas…</p>
      ) : !alerts?.length ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            Nenhum alerta. Use &quot;Verificar oportunidades&quot; para analisar preço e demanda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className={alert.read_at || alert.is_read ? 'opacity-75' : ''}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">{alert.title}</CardTitle>
                  <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
                </div>
                <Badge className={severityClass[alert.severity] || severityClass.low}>
                  {alert.severity}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {new Date(alert.created_at).toLocaleString('pt-BR')}
                </span>
                {!alert.read_at && !alert.is_read && (
                  <Button size="sm" variant="ghost" onClick={() => markRead.mutate(alert.id)}>
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Marcar lido
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {breakdown.length > 0 && (
        <PricingBookingsBreakdown
          title="Reservas relacionadas à propriedade"
          description="Contexto operacional das notificações — clientes, datas e valores."
          bookings={breakdown}
          showProperty={false}
        />
      )}
    </div>
  );
}

export function PricingAlertsModule() {
  return (
    <PricingModuleShell
      title="Alertas de precificação"
      description="Notificações de variação de preço, demanda e oportunidades de ajuste."
    >
      {({ itemId }) => <AlertsPanel itemId={itemId} />}
    </PricingModuleShell>
  );
}
