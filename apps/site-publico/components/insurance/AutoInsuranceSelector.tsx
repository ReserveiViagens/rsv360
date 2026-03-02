/**
 * Componente de Seleção Automática de Seguros
 * Permite configurar critérios e selecionar automaticamente o melhor seguro
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Shield, Sparkles, CheckCircle, Info, Loader2 } from 'lucide-react';
import { type InsuranceQuote, type QuoteRequest } from '@/lib/multi-insurance-service';
import { type SelectionCriteria, type AutoSelectionResult } from '@/lib/auto-insurance-selector';
import { useToast } from '@/components/providers/toast-wrapper';

interface AutoInsuranceSelectorProps {
  quoteRequest: QuoteRequest;
  onSelect?: (quote: InsuranceQuote) => void;
  onResult?: (result: AutoSelectionResult) => void;
}

export function AutoInsuranceSelector({
  quoteRequest,
  onSelect,
  onResult,
}: AutoInsuranceSelectorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutoSelectionResult | null>(null);
  const [useUserProfile, setUseUserProfile] = useState(true);
  const [criteria, setCriteria] = useState<SelectionCriteria>({
    priority: 'balanced',
  });

  const handleAutoSelect = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/insurance/auto-select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: quoteRequest.bookingId,
          trip_duration_days: quoteRequest.tripDurationDays,
          number_of_travelers: quoteRequest.numberOfTravelers,
          destination: quoteRequest.destination,
          total_booking_amount: quoteRequest.totalBookingAmount,
          travelers: quoteRequest.travelers,
          start_date: quoteRequest.startDate?.toISOString(),
          end_date: quoteRequest.endDate?.toISOString(),
          coverage_types: quoteRequest.coverageTypes,
          use_user_profile: useUserProfile,
          criteria: useUserProfile ? undefined : criteria,
          priority: criteria.priority,
          max_price: criteria.maxPrice,
          min_rating: criteria.minRating,
          min_coverage: criteria.minCoverage,
          preferred_providers: criteria.preferredProviders,
          exclude_providers: criteria.excludeProviders,
          coverage_type: criteria.coverageType,
          require_features: criteria.requireFeatures,
          exclude_features: criteria.excludeFeatures,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao selecionar seguro automaticamente');
      }

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        onResult?.(data.data);
        
        if (data.data.selectedQuote) {
          onSelect?.(data.data.selectedQuote);
          toast({
            title: 'Seguro selecionado automaticamente',
            description: data.data.reason,
          });
        } else {
          toast({
            title: 'Nenhum seguro encontrado',
            description: data.data.reason,
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Erro ao selecionar seguro:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao selecionar seguro automaticamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Seleção Automática de Seguro
        </CardTitle>
        <CardDescription>
          Deixe o sistema escolher o melhor seguro para você
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configurações */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="use-profile">Usar perfil do usuário</Label>
              <p className="text-sm text-muted-foreground">
                Usar preferências salvas do usuário
              </p>
            </div>
            <Switch
              id="use-profile"
              checked={useUserProfile}
              onCheckedChange={setUseUserProfile}
            />
          </div>

          {!useUserProfile && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={criteria.priority}
                  onValueChange={(value: SelectionCriteria['priority']) =>
                    setCriteria({ ...criteria, priority: value })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Menor Preço</SelectItem>
                    <SelectItem value="rating">Melhor Avaliação</SelectItem>
                    <SelectItem value="coverage">Maior Cobertura</SelectItem>
                    <SelectItem value="value">Melhor Custo-Benefício</SelectItem>
                    <SelectItem value="balanced">Balanceado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-price">Preço Máximo (R$)</Label>
                  <Input
                    id="max-price"
                    type="number"
                    value={criteria.maxPrice || ''}
                    onChange={(e) =>
                      setCriteria({
                        ...criteria,
                        maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <Label htmlFor="min-rating">Avaliação Mínima</Label>
                  <Input
                    id="min-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={criteria.minRating || ''}
                    onChange={(e) =>
                      setCriteria({
                        ...criteria,
                        minRating: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="coverage-type">Tipo de Cobertura</Label>
                <Select
                  value={criteria.coverageType || 'all'}
                  onValueChange={(value) =>
                    setCriteria({
                      ...criteria,
                      coverageType: value === 'all' ? undefined : value as any,
                    })
                  }
                >
                  <SelectTrigger id="coverage-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="standard">Padrão</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="comprehensive">Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            onClick={handleAutoSelect}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Selecionando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Selecionar Automaticamente
              </>
            )}
          </Button>
        </div>

        {/* Resultado */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {result.selectedQuote ? (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        Seguro Selecionado
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {result.reason}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      Score: {(result.score * 100).toFixed(0)}%
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Provedor:</span>
                      <span className="text-sm">{result.selectedQuote.providerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tipo:</span>
                      <Badge variant="outline">{result.selectedQuote.coverageType}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Prêmio:</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(result.selectedQuote.premiumAmount, result.selectedQuote.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cobertura:</span>
                      <span className="text-sm">
                        {formatCurrency(result.selectedQuote.coverageAmount, result.selectedQuote.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparação */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Comparação
                      </h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total de cotações:</span>
                      <span className="ml-2 font-medium">{result.comparison.totalQuotes}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Filtradas:</span>
                      <span className="ml-2 font-medium">{result.comparison.filteredQuotes}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Preço médio:</span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(result.comparison.averagePrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avaliação média:</span>
                      <span className="ml-2 font-medium">
                        {result.comparison.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alternativas */}
                {result.alternatives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Alternativas:</h4>
                    <div className="space-y-2">
                      {result.alternatives.map((alt, idx) => (
                        <div
                          key={idx}
                          className="p-3 border rounded-lg text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{alt.providerName}</span>
                              <Badge variant="outline" className="ml-2">
                                {alt.coverageType}
                              </Badge>
                            </div>
                            <span className="font-bold">
                              {formatCurrency(alt.premiumAmount, alt.currency)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Nenhum seguro encontrado
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {result.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

