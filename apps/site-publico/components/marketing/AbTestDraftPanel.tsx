'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MarketingPageHeader } from './MarketingPageHeader';

type Draft = {
  name: string;
  metric: string;
  variantA: string;
  variantB: string;
  trafficSplit: string;
  notes: string;
};

const STORAGE_KEY = 'rsv360-marketing-ab-draft';

export function AbTestDraftPanel() {
  const [draft, setDraft] = useState<Draft>({
    name: '',
    metric: 'conversion_rate',
    variantA: '',
    variantB: '',
    trafficSplit: '50',
    notes: '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
    }
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <MarketingPageHeader
        title="A/B Tests"
        description="Rascunho local de experimentos. Integração com backend de experimentação é planejada para fase posterior."
      />

      {saved ? (
        <Alert>
          <AlertDescription>
            Rascunho salvo no navegador. Nenhum tráfego foi direcionado — isto é apenas
            documentação do experimento.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Novo experimento (mock)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ab-name">Nome do teste</Label>
            <Input
              id="ab-name"
              placeholder="Ex.: CTA hero — Caldas Novas"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Métrica principal</Label>
            <Select
              value={draft.metric}
              onValueChange={(value) => setDraft({ ...draft, metric: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversion_rate">Taxa de conversão</SelectItem>
                <SelectItem value="click_rate">Taxa de clique</SelectItem>
                <SelectItem value="open_rate">Taxa de abertura</SelectItem>
                <SelectItem value="revenue">Receita por sessão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="variant-a">Variante A</Label>
              <Textarea
                id="variant-a"
                rows={3}
                placeholder="Controle atual"
                value={draft.variantA}
                onChange={(e) => setDraft({ ...draft, variantA: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variant-b">Variante B</Label>
              <Textarea
                id="variant-b"
                rows={3}
                placeholder="Nova hipótese"
                value={draft.variantB}
                onChange={(e) => setDraft({ ...draft, variantB: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="split">Tráfego para B (%)</Label>
            <Input
              id="split"
              type="number"
              min={5}
              max={95}
              value={draft.trafficSplit}
              onChange={(e) => setDraft({ ...draft, trafficSplit: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              rows={2}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>

          <Button type="button" onClick={handleSave} disabled={!draft.name.trim()}>
            Salvar rascunho local
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
