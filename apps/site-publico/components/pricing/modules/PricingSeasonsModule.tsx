'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { PricingModuleShell } from '../PricingModuleShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PricingBookingsBreakdown } from '../PricingBookingsBreakdown';
import type { BookingBreakdownItem } from '@/components/analytics/BookingBreakdownTable';

type SeasonRule = {
  id: number;
  rule_name: string;
  is_active: boolean;
  config: { start_date?: string; end_date?: string; multiplier?: number };
};

function SeasonsPanel({ itemId }: { itemId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [expandedSeasonId, setExpandedSeasonId] = useState<number | null>(null);
  const [form, setForm] = useState({
    rule_name: '',
    start_date: '',
    end_date: '',
    multiplier: 1.3,
  });

  const { data: seasonBreakdown } = useQuery({
    queryKey: ['pricing-season-breakdown', itemId, expandedSeasonId],
    enabled: expandedSeasonId != null,
    queryFn: async () => {
      const res = await fetch(
        `/api/pricing/seasons?item_id=${itemId}&season_id=${expandedSeasonId}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro');
      return (json.breakdown as BookingBreakdownItem[]) || [];
    },
  });

  const { data: seasons, isLoading } = useQuery({
    queryKey: ['pricing-seasons', itemId],
    queryFn: async () => {
      const res = await fetch(`/api/pricing/seasons?item_id=${itemId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar temporadas');
      return json.data as SeasonRule[];
    },
  });

  const createSeason = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/pricing/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: parseInt(itemId, 10),
          rule_name: form.rule_name,
          config: {
            start_date: form.start_date,
            end_date: form.end_date,
            multiplier: form.multiplier,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao criar temporada');
    },
    onSuccess: () => {
      toast.success('Temporada criada');
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['pricing-seasons', itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteSeason = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/pricing/seasons?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao excluir');
    },
    onSuccess: () => {
      toast.success('Temporada removida');
      qc.invalidateQueries({ queryKey: ['pricing-seasons', itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova temporada
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : !seasons?.length ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            Nenhuma temporada cadastrada. Defina períodos de alta/baixa com multiplicador.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {seasons.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-start gap-2">
                  <Sun className="mt-0.5 h-5 w-5 text-amber-500" />
                  <div>
                    <CardTitle className="text-base">{s.rule_name}</CardTitle>
                    <p className="text-xs text-slate-500">
                      {s.config.start_date} → {s.config.end_date}
                    </p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteSeason.mutate(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Multiplicador:{' '}
                  <strong>{s.config.multiplier ?? 1}x</strong>
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setExpandedSeasonId(expandedSeasonId === s.id ? null : s.id)
                  }
                >
                  {expandedSeasonId === s.id
                    ? 'Ocultar reservas do período'
                    : 'Ver reservas do período'}
                </Button>
                {expandedSeasonId === s.id && seasonBreakdown && (
                  <PricingBookingsBreakdown
                    bookings={seasonBreakdown}
                    showProperty={false}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova temporada</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input
                value={form.rule_name}
                onChange={(e) => setForm({ ...form, rule_name: e.target.value })}
                placeholder="Alta temporada — Julho"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Fim</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Multiplicador</Label>
              <Input
                type="number"
                step="0.05"
                value={form.multiplier}
                onChange={(e) =>
                  setForm({ ...form, multiplier: parseFloat(e.target.value) || 1 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                !form.rule_name ||
                !form.start_date ||
                !form.end_date ||
                createSeason.isPending
              }
              onClick={() => createSeason.mutate()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PricingSeasonsModule() {
  return (
    <PricingModuleShell
      title="Temporadas"
      description="Períodos sazonais com multiplicador de tarifa (regras seasonal)."
    >
      {({ itemId }) => <SeasonsPanel itemId={itemId} />}
    </PricingModuleShell>
  );
}
