'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { PricingModuleShell } from '../PricingModuleShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PricingRule = {
  id: number;
  rule_name: string;
  rule_type: string;
  is_active: boolean;
  priority: number;
  config: Record<string, unknown>;
};

const RULE_TYPES = [
  { value: 'day_of_week', label: 'Dia da semana' },
  { value: 'stay_duration', label: 'Duração da estadia' },
  { value: 'advance_booking', label: 'Reserva antecipada' },
  { value: 'last_minute', label: 'Last minute' },
  { value: 'custom', label: 'Personalizada' },
];

function RulesPanel({ itemId }: { itemId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    rule_name: '',
    rule_type: 'day_of_week',
    priority: 5,
    multiplier: 1.15,
  });

  const { data: rules, isLoading } = useQuery({
    queryKey: ['pricing-rules', itemId],
    queryFn: async () => {
      const res = await fetch(`/api/pricing/rules?item_id=${itemId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar regras');
      return (json.data as PricingRule[]).filter((r) => r.rule_type !== 'seasonal');
    },
  });

  const createRule = useMutation({
    mutationFn: async () => {
      const config =
        form.rule_type === 'day_of_week'
          ? { days: [5, 6], multiplier: form.multiplier }
          : { multiplier: form.multiplier };
      const res = await fetch('/api/pricing/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: parseInt(itemId, 10),
          rule_name: form.rule_name,
          rule_type: form.rule_type,
          config,
          priority: form.priority,
          is_active: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao criar regra');
    },
    onSuccess: () => {
      toast.success('Regra criada');
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['pricing-rules', itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteRule = useMutation({
    mutationFn: async (ruleId: number) => {
      const res = await fetch(`/api/pricing/rules?rule_id=${ruleId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao excluir');
    },
    onSuccess: () => {
      toast.success('Regra removida');
      qc.invalidateQueries({ queryKey: ['pricing-rules', itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleRule = useMutation({
    mutationFn: async (rule: PricingRule) => {
      const res = await fetch('/api/pricing/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: rule.id, is_active: !rule.is_active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao atualizar');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing-rules', itemId] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova regra
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando regras…</p>
      ) : !rules?.length ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            Nenhuma regra cadastrada. Crie regras de dia da semana, estadia ou antecipação.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                  <p className="text-xs text-slate-500">{rule.rule_type} · prioridade {rule.priority}</p>
                </div>
                <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                  {rule.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleRule.mutate(rule)}>
                  <Pencil className="mr-1 h-3 w-3" />
                  {rule.is_active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteRule.mutate(rule.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Excluir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova regra de precificação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input
                value={form.rule_name}
                onChange={(e) => setForm({ ...form, rule_name: e.target.value })}
                placeholder="Ex.: Fim de semana +15%"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={form.rule_type}
                onValueChange={(v) => setForm({ ...form, rule_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Multiplicador</Label>
              <Input
                type="number"
                step="0.01"
                value={form.multiplier}
                onChange={(e) => setForm({ ...form, multiplier: parseFloat(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!form.rule_name || createRule.isPending}
              onClick={() => createRule.mutate()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PricingRulesModule() {
  return (
    <PricingModuleShell
      title="Regras automáticas"
      description="Ajustes por dia da semana, estadia, antecipação e last minute."
    >
      {({ itemId }) => <RulesPanel itemId={itemId} />}
    </PricingModuleShell>
  );
}
