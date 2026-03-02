'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Users } from 'lucide-react';
import type { CotacaoState } from './cotacao-utils';

interface QuoteStepDatesProps {
  state: CotacaoState;
  onChange: (updates: Partial<CotacaoState>) => void;
  onNext: () => void;
}

export function QuoteStepDates({ state, onChange, onNext }: QuoteStepDatesProps) {
  const canNext = state.checkIn && state.checkOut && state.adults >= 1;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Datas e hóspedes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quando você pretende viajar e quantas pessoas?
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkIn">Check-in *</Label>
            <Input
              id="checkIn"
              type="date"
              value={state.checkIn}
              onChange={(e) => onChange({ checkIn: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOut">Check-out *</Label>
            <Input
              id="checkOut"
              type="date"
              value={state.checkOut}
              onChange={(e) => onChange({ checkOut: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">Número de pessoas</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adults">Adultos *</Label>
            <Input
              id="adults"
              type="number"
              min={1}
              max={20}
              value={state.adults}
              onChange={(e) => onChange({ adults: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="children">Crianças</Label>
            <Input
              id="children"
              type="number"
              min={0}
              max={20}
              value={state.children}
              onChange={(e) => onChange({ children: Math.max(0, parseInt(e.target.value, 10) || 0) })}
            />
          </div>
        </div>
        <Button onClick={onNext} disabled={!canNext} className="w-full">
          Próximo: escolher produtos
        </Button>
      </CardContent>
    </Card>
  );
}
