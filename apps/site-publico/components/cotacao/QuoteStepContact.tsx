'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone } from 'lucide-react';
import type { CotacaoState } from './cotacao-utils';

interface QuoteStepContactProps {
  state: CotacaoState;
  onChange: (updates: Partial<CotacaoState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function QuoteStepContact({ state, onChange, onNext, onBack }: QuoteStepContactProps) {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
  const canNext = state.name.trim() && state.email.trim() && emailValid;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus dados</CardTitle>
        <p className="text-sm text-muted-foreground">
          Para enviarmos a cotação. Campos com * são obrigatórios.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={state.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={state.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="pl-9"
            />
          </div>
          {state.email && !emailValid && (
            <p className="text-xs text-destructive">E-mail inválido.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (WhatsApp)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={state.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            placeholder="Alguma preferência ou observação?"
            value={state.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Voltar
          </Button>
          <Button onClick={onNext} disabled={!canNext} className="flex-1">
            Revisar e enviar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
