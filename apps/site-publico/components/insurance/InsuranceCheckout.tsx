/**
 * ✅ COMPONENTE: INSURANCE CHECKOUT
 * Componente para seleção e adição de seguro ao checkout
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, Info } from '@/lib/lucide-icons';
import { toast } from 'sonner';

interface InsuranceOption {
  type: 'basic' | 'standard' | 'premium' | 'comprehensive';
  name: string;
  description: string;
  coverage_amount: number;
  premium_amount: number;
  features: string[];
}

interface InsuranceCheckoutProps {
  bookingId: number;
  tripDurationDays: number;
  numberOfTravelers: number;
  destination?: string;
  totalBookingAmount: number;
  onSelect?: (option: InsuranceOption | null) => void;
}

export function InsuranceCheckout({
  bookingId,
  tripDurationDays,
  numberOfTravelers,
  destination,
  totalBookingAmount,
  onSelect,
}: InsuranceCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('none');
  const [options, setOptions] = useState<InsuranceOption[]>([]);
  const [calculatedPremiums, setCalculatedPremiums] = useState<Record<string, number>>({});

  useEffect(() => {
    calculatePremiums();
  }, [tripDurationDays, numberOfTravelers, totalBookingAmount, destination]);

  const calculatePremiums = async () => {
    try {
      setLoading(true);
      const coverageTypes: Array<'basic' | 'standard' | 'premium' | 'comprehensive'> = [
        'basic',
        'standard',
        'premium',
        'comprehensive',
      ];

      const premiums: Record<string, number> = {};

      for (const type of coverageTypes) {
        const response = await fetch('/api/insurance/calculate-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: bookingId,
            coverage_type: type,
            coverage_amount: totalBookingAmount * (type === 'basic' ? 0.5 : type === 'standard' ? 0.75 : type === 'premium' ? 1.0 : 1.5),
            trip_duration_days: tripDurationDays,
            number_of_travelers: numberOfTravelers,
            destination,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            premiums[type] = result.data.premium_amount;
          }
        }
      }

      setCalculatedPremiums(premiums);

      // Definir opções com preços calculados
      setOptions([
        {
          type: 'basic',
          name: 'Básico',
          description: 'Cobertura essencial para sua viagem',
          coverage_amount: totalBookingAmount * 0.5,
          premium_amount: premiums.basic || 50,
          features: [
            'Cancelamento de viagem',
            'Atraso de voo',
            'Bagagem extraviada',
          ],
        },
        {
          type: 'standard',
          name: 'Padrão',
          description: 'Cobertura completa e recomendada',
          coverage_amount: totalBookingAmount * 0.75,
          premium_amount: premiums.standard || 100,
          features: [
            'Tudo do Básico',
            'Despesas médicas',
            'Repatriamento',
            'Interrupção de viagem',
          ],
        },
        {
          type: 'premium',
          name: 'Premium',
          description: 'Máxima proteção para sua viagem',
          coverage_amount: totalBookingAmount * 1.0,
          premium_amount: premiums.premium || 200,
          features: [
            'Tudo do Padrão',
            'Cancelamento por qualquer motivo',
            'Proteção de equipamentos',
            'Assistência 24/7',
          ],
        },
        {
          type: 'comprehensive',
          name: 'Completo',
          description: 'Cobertura total e abrangente',
          coverage_amount: totalBookingAmount * 1.5,
          premium_amount: premiums.comprehensive || 350,
          features: [
            'Tudo do Premium',
            'Cobertura de atividades esportivas',
            'Proteção de documentos',
            'Suporte VIP',
          ],
        },
      ]);
    } catch (error: any) {
      console.error('Erro ao calcular prêmios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    if (value === 'none') {
      onSelect?.(null);
    } else {
      const option = options.find((o) => o.type === value);
      if (option) {
        onSelect?.(option);
      }
    }
  };

  const selectedInsurance = options.find((o) => o.type === selectedOption);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Seguro de Viagem
        </CardTitle>
        <CardDescription>
          Proteja sua viagem com nosso seguro completo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedOption} onValueChange={handleSelect}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span>Sem seguro</span>
                  <span className="text-sm text-muted-foreground">R$ 0,00</span>
                </div>
              </Label>
            </div>

            {options.map((option) => (
              <div
                key={option.type}
                className={`flex items-start space-x-2 p-4 border-2 rounded-lg transition-all ${
                  selectedOption === option.type
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value={option.type} id={option.type} className="mt-1" />
                <Label htmlFor={option.type} className="flex-1 cursor-pointer">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{option.name}</span>
                          {selectedOption === option.type && (
                            <Badge variant="default" className="bg-green-600">
                              <Check className="w-3 h-3 mr-1" />
                              Selecionado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">R$ {option.premium_amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          Cobertura: R$ {option.coverage_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Inclui:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {option.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {selectedInsurance && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Seguro {selectedInsurance.name} selecionado
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  O valor de R$ {selectedInsurance.premium_amount.toFixed(2)} será adicionado ao total da reserva.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

