/**
 * ✅ COMPONENTE: SPLIT CALCULATOR
 * Calculadora para dividir pagamentos entre participantes
 * 
 * @module components/group-travel/SplitCalculator
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, Users, Plus, Trash2, Equal, Percent, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  email?: string;
  amount?: number;
  percentage?: number;
  customAmount?: number;
}

type SplitType = 'equal' | 'percentage' | 'custom';

interface SplitCalculatorProps {
  totalAmount: number;
  participants?: Participant[];
  onCalculate?: (results: Participant[]) => void;
  readOnly?: boolean;
}

export function SplitCalculator({ 
  totalAmount, 
  participants: initialParticipants = [], 
  onCalculate,
  readOnly = false 
}: SplitCalculatorProps) {
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [calculatedResults, setCalculatedResults] = useState<Participant[]>([]);

  useEffect(() => {
    if (participants.length === 0) {
      setParticipants([{ id: '1', name: '' }]);
    }
  }, []);

  useEffect(() => {
    calculateSplit();
  }, [totalAmount, splitType, participants]);

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now().toString(), name: '' }
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(p => p.id !== id));
    } else {
      toast.error('Deve haver pelo menos um participante');
    }
  };

  const updateParticipant = (id: string, field: keyof Participant, value: any) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const calculateSplit = () => {
    if (participants.length === 0 || totalAmount <= 0) {
      setCalculatedResults([]);
      return;
    }

    const validParticipants = participants.filter(p => p.name.trim() !== '');
    if (validParticipants.length === 0) {
      setCalculatedResults([]);
      return;
    }

    let results: Participant[] = [];

    switch (splitType) {
      case 'equal':
        const equalAmount = totalAmount / validParticipants.length;
        results = validParticipants.map(p => ({
          ...p,
          amount: Math.round(equalAmount * 100) / 100,
          percentage: Math.round((equalAmount / totalAmount) * 100 * 100) / 100
        }));
        break;

      case 'percentage':
        const totalPercentage = validParticipants.reduce((sum, p) => 
          sum + (p.percentage || 0), 0
        );
        
        if (Math.abs(totalPercentage - 100) > 0.01) {
          // Normalizar porcentagens se não somarem 100%
          const normalizedPercentage = totalPercentage > 0 ? totalPercentage : 100;
          results = validParticipants.map(p => {
            const normalizedPct = totalPercentage > 0 
              ? (p.percentage || 0) / normalizedPercentage * 100
              : 100 / validParticipants.length;
            const amount = Math.round((totalAmount * normalizedPct / 100) * 100) / 100;
            return {
              ...p,
              percentage: Math.round(normalizedPct * 100) / 100,
              amount
            };
          });
        } else {
          results = validParticipants.map(p => {
            const amount = Math.round((totalAmount * (p.percentage || 0) / 100) * 100) / 100;
            return { ...p, amount };
          });
        }
        break;

      case 'custom':
        const totalCustom = validParticipants.reduce((sum, p) => 
          sum + (p.customAmount || 0), 0
        );
        
        if (Math.abs(totalCustom - totalAmount) > 0.01) {
          // Ajustar proporcionalmente se não somarem o total
          const ratio = totalCustom > 0 ? totalAmount / totalCustom : 1;
          results = validParticipants.map(p => {
            const adjustedAmount = Math.round((p.customAmount || 0) * ratio * 100) / 100;
            return {
              ...p,
              amount: adjustedAmount,
              percentage: Math.round((adjustedAmount / totalAmount) * 100 * 100) / 100
            };
          });
        } else {
          results = validParticipants.map(p => ({
            ...p,
            amount: Math.round((p.customAmount || 0) * 100) / 100,
            percentage: Math.round(((p.customAmount || 0) / totalAmount) * 100 * 100) / 100
          }));
        }
        break;
    }

    setCalculatedResults(results);
    onCalculate?.(results);
  };

  const totalCalculated = calculatedResults.reduce((sum, p) => sum + (p.amount || 0), 0);
  const difference = Math.abs(totalAmount - totalCalculated);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculadora de Divisão
        </CardTitle>
        <CardDescription>
          Divida o pagamento entre os participantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Divisão */}
        <div className="space-y-2">
          <Label>Tipo de Divisão</Label>
          <Select value={splitType} onValueChange={(value) => setSplitType(value as SplitType)} disabled={readOnly}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal">
                <div className="flex items-center gap-2">
                  <Equal className="w-4 h-4" />
                  Igual
                </div>
              </SelectItem>
              <SelectItem value="percentage">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Porcentagem
                </div>
              </SelectItem>
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Valor Personalizado
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Valor Total */}
        <div className="space-y-2">
          <Label>Valor Total</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={totalAmount}
              readOnly
              className="pl-9"
            />
          </div>
        </div>

        {/* Participantes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participantes
            </Label>
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={addParticipant}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div key={participant.id} className="flex gap-2 items-start p-3 border rounded-lg">
                <div className="flex-1 grid grid-cols-12 gap-2">
                  <div className="col-span-12 md:col-span-4">
                    <Input
                      placeholder="Nome"
                      value={participant.name}
                      onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  
                  {splitType === 'percentage' && (
                    <div className="col-span-12 md:col-span-3">
                      <Input
                        type="number"
                        placeholder="%"
                        value={participant.percentage || ''}
                        onChange={(e) => updateParticipant(participant.id, 'percentage', parseFloat(e.target.value) || 0)}
                        disabled={readOnly}
                        min="0"
                        max="100"
                      />
                    </div>
                  )}
                  
                  {splitType === 'custom' && (
                    <div className="col-span-12 md:col-span-3">
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Valor"
                          value={participant.customAmount || ''}
                          onChange={(e) => updateParticipant(participant.id, 'customAmount', parseFloat(e.target.value) || 0)}
                          disabled={readOnly}
                          className="pl-7"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                  
                  {calculatedResults.find(r => r.id === participant.id) && (
                    <div className="col-span-12 md:col-span-5 flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        R$ {calculatedResults.find(r => r.id === participant.id)?.amount?.toFixed(2) || '0.00'}
                      </Badge>
                      {splitType !== 'equal' && (
                        <span className="text-xs text-muted-foreground">
                          ({calculatedResults.find(r => r.id === participant.id)?.percentage?.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {!readOnly && participants.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParticipant(participant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resultado */}
        {calculatedResults.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Total Calculado</Label>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${difference > 0.01 ? 'text-red-500' : 'text-green-500'}`}>
                  R$ {totalCalculated.toFixed(2)}
                </span>
                {difference > 0.01 && (
                  <Badge variant="destructive" className="text-xs">
                    Diferença: R$ {difference.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
            
            {splitType === 'percentage' && (
              <div className="text-xs text-muted-foreground">
                Total de porcentagens: {calculatedResults.reduce((sum, p) => sum + (p.percentage || 0), 0).toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

