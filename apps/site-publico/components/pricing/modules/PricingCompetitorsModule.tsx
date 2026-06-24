'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PricingModuleShell } from '../PricingModuleShell';
import { CompetitorTable } from '../competitor-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function CompetitorsPanel({ itemId, basePrice }: { itemId: string; basePrice: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '' });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['pricing-competitors', itemId],
    queryFn: async () => {
      const res = await fetch(`/api/pricing/competitors?item_id=${itemId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar concorrentes');
      return json.data as Array<{
        competitor_name: string;
        price: number;
        currency: string;
        availability_status: string;
        scraped_at: string;
      }>;
    },
  });

  const addCompetitor = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/pricing/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: parseInt(itemId, 10),
          competitor_name: form.name,
          price: parseFloat(form.price),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar');
    },
    onSuccess: () => {
      toast.success('Concorrente registrado');
      setOpen(false);
      setForm({ name: '', price: '' });
      qc.invalidateQueries({ queryKey: ['pricing-competitors', itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar tarifa
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : (
        <CompetitorTable
          competitors={data || []}
          currentPrice={basePrice}
          title="Monitoramento de concorrentes"
          description="Tarifas coletadas hoje ou registradas manualmente no laboratório."
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar tarifa de concorrente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome (OTA / hotel)</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Booking, Airbnb…"
              />
            </div>
            <div>
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!form.name || !form.price || addCompetitor.isPending}
              onClick={() => addCompetitor.mutate()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PricingCompetitorsModule() {
  return (
    <PricingModuleShell
      title="Concorrentes"
      description="Acompanhe tarifas de OTAs e hotéis rivais versus sua propriedade."
    >
      {({ itemId, item }) => (
        <CompetitorsPanel itemId={itemId} basePrice={item?.basePrice ?? 250} />
      )}
    </PricingModuleShell>
  );
}
