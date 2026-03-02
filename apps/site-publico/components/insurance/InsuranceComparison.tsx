/**
 * Componente de Comparação de Seguros
 * Compara cotações de múltiplas seguradoras
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, TrendingDown, Award, Loader2, Check, X } from 'lucide-react';
import { type InsuranceQuote, type QuoteRequest } from '@/lib/multi-insurance-service';
import { useToast } from '@/components/providers/toast-wrapper';

interface InsuranceComparisonProps {
  bookingId?: number;
  tripDurationDays: number;
  numberOfTravelers: number;
  destination?: string;
  totalBookingAmount: number;
  travelers?: Array<{ age: number; name?: string }>;
  startDate?: Date;
  endDate?: Date;
  onSelect?: (quote: InsuranceQuote) => void;
}

export function InsuranceComparison({
  bookingId,
  tripDurationDays,
  numberOfTravelers,
  destination,
  totalBookingAmount,
  travelers,
  startDate,
  endDate,
  onSelect,
}: InsuranceComparisonProps) {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<InsuranceQuote | null>(null);
  const [comparison, setComparison] = useState<{
    bestValue: InsuranceQuote | null;
    cheapest: InsuranceQuote | null;
    bestRating: InsuranceQuote | null;
    recommendations: InsuranceQuote[];
  } | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, [bookingId, tripDurationDays, numberOfTravelers, destination, totalBookingAmount]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const request: QuoteRequest = {
        bookingId,
        tripDurationDays,
        numberOfTravelers,
        destination,
        totalBookingAmount,
        travelers,
        startDate,
        endDate,
        coverageTypes: ['basic', 'standard', 'premium', 'comprehensive'],
      };

      const response = await fetch('/api/insurance/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar cotações');
      }

      const result = await response.json();
      if (result.success) {
        setQuotes(result.data.quotes);
        setComparison(result.data.comparison);
      }
    } catch (error: any) {
      console.error('Erro ao buscar cotações:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao buscar cotações de seguros',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuote = (quote: InsuranceQuote) => {
    setSelectedQuote(quote);
    onSelect?.(quote);
    toast({
      title: 'Seguro selecionado',
      description: `${quote.providerName} - ${quote.coverageType}`,
    });
  };

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getCoverageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      basic: 'Básico',
      standard: 'Padrão',
      premium: 'Premium',
      comprehensive: 'Completo',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Buscando cotações...</span>
        </CardContent>
      </Card>
    );
  }

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nenhuma cotação disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo de comparação */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparison.cheapest && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  Mais Barato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(comparison.cheapest.premiumAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {comparison.cheapest.providerName}
                </p>
              </CardContent>
            </Card>
          )}

          {comparison.bestValue && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  Melhor Custo-Benefício
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(comparison.bestValue.premiumAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {comparison.bestValue.providerName}
                </p>
              </CardContent>
            </Card>
          )}

          {comparison.bestRating && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  Melhor Avaliação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {formatCurrency(comparison.bestRating.premiumAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {comparison.bestRating.providerName}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Lista de cotações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Comparação de Seguros
          </CardTitle>
          <CardDescription>
            Compare cotações de múltiplas seguradoras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotes.map((quote, index) => {
              const isSelected = selectedQuote?.providerId === quote.providerId &&
                selectedQuote?.coverageType === quote.coverageType;
              const isRecommended = comparison?.recommendations.some(
                r => r.providerId === quote.providerId && r.coverageType === quote.coverageType
              );

              return (
                <div
                  key={`${quote.providerId}-${quote.coverageType}-${index}`}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{quote.providerName}</h4>
                        <Badge variant="outline">
                          {getCoverageTypeLabel(quote.coverageType)}
                        </Badge>
                        {isRecommended && (
                          <Badge variant="default" className="bg-green-600">
                            <Award className="w-3 h-3 mr-1" />
                            Recomendado
                          </Badge>
                        )}
                        {quote.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{quote.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Prêmio</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(quote.premiumAmount, quote.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cobertura</p>
                          <p className="text-sm font-medium">
                            {formatCurrency(quote.coverageAmount, quote.currency)}
                          </p>
                        </div>
                      </div>

                      {quote.deductible && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Franquia: {formatCurrency(quote.deductible, quote.currency)}
                        </p>
                      )}

                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1">Coberturas incluídas:</p>
                        <div className="flex flex-wrap gap-1">
                          {quote.features.slice(0, 5).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                          {quote.features.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{quote.features.length - 5} mais
                            </Badge>
                          )}
                        </div>
                      </div>

                      {quote.exclusions.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium mb-1 text-red-600">Exclusões:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {quote.exclusions.slice(0, 3).map((exclusion, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <X className="w-3 h-3" />
                                {exclusion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {quote.estimatedProcessingTime && (
                        <p className="text-xs text-muted-foreground">
                          Processamento: {quote.estimatedProcessingTime}
                        </p>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button
                        onClick={() => handleSelectQuote(quote)}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Selecionado
                          </>
                        ) : (
                          'Selecionar'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

