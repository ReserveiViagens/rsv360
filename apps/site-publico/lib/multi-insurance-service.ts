/**
 * Serviço de Integração com Múltiplas Seguradoras
 * Integra com diferentes seguradoras para comparar preços e coberturas
 */

export interface InsuranceProvider {
  id: string;
  name: string;
  logo?: string;
  apiEndpoint?: string;
  apiKey?: string;
  enabled: boolean;
  features: string[];
  rating?: number;
  responseTime?: number; // em ms
}

export interface InsuranceQuote {
  providerId: string;
  providerName: string;
  providerLogo?: string;
  coverageType: 'basic' | 'standard' | 'premium' | 'comprehensive';
  premiumAmount: number;
  coverageAmount: number;
  currency: string;
  features: string[];
  exclusions: string[];
  deductible?: number;
  maxAge?: number;
  minAge?: number;
  durationDays: number;
  termsUrl?: string;
  rating?: number;
  responseTime?: number;
  estimatedProcessingTime?: string;
}

export interface QuoteRequest {
  bookingId?: number;
  tripDurationDays: number;
  numberOfTravelers: number;
  destination?: string;
  totalBookingAmount: number;
  travelers?: Array<{
    age: number;
    name?: string;
  }>;
  startDate?: Date;
  endDate?: Date;
  coverageTypes?: Array<'basic' | 'standard' | 'premium' | 'comprehensive'>;
}

/**
 * Serviço de integração com múltiplas seguradoras
 */
export class MultiInsuranceService {
  private providers: Map<string, InsuranceProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Inicializar provedores de seguro
   */
  private initializeProviders(): void {
    // Provedores configurados (pode ser carregado de banco de dados ou env)
    const defaultProviders: InsuranceProvider[] = [
      {
        id: 'internal',
        name: 'RSV Seguros',
        enabled: true,
        features: ['Cancelamento', 'Atraso', 'Bagagem', 'Médico', 'Repatriamento'],
        rating: 4.5,
        responseTime: 100,
      },
      {
        id: 'provider_a',
        name: 'Seguro Viagem A',
        enabled: true,
        apiEndpoint: process.env.INSURANCE_PROVIDER_A_ENDPOINT,
        apiKey: process.env.INSURANCE_PROVIDER_A_KEY,
        features: ['Cancelamento', 'Atraso', 'Bagagem', 'Médico'],
        rating: 4.3,
        responseTime: 500,
      },
      {
        id: 'provider_b',
        name: 'Seguro Viagem B',
        enabled: true,
        apiEndpoint: process.env.INSURANCE_PROVIDER_B_ENDPOINT,
        apiKey: process.env.INSURANCE_PROVIDER_B_KEY,
        features: ['Cancelamento', 'Atraso', 'Bagagem', 'Médico', 'Repatriamento', 'Esportes'],
        rating: 4.7,
        responseTime: 800,
      },
      {
        id: 'provider_c',
        name: 'Seguro Viagem C',
        enabled: true,
        apiEndpoint: process.env.INSURANCE_PROVIDER_C_ENDPOINT,
        apiKey: process.env.INSURANCE_PROVIDER_C_KEY,
        features: ['Cancelamento', 'Atraso', 'Bagagem', 'Médico', 'Repatriamento'],
        rating: 4.2,
        responseTime: 600,
      },
    ];

    defaultProviders.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  /**
   * Obter todos os provedores habilitados
   */
  getEnabledProviders(): InsuranceProvider[] {
    return Array.from(this.providers.values()).filter(p => p.enabled);
  }

  /**
   * Obter cotações de múltiplas seguradoras
   */
  async getQuotes(request: QuoteRequest): Promise<InsuranceQuote[]> {
    const enabledProviders = this.getEnabledProviders();
    const quotes: InsuranceQuote[] = [];

    // Buscar cotações de todos os provedores em paralelo
    const quotePromises = enabledProviders.map(provider =>
      this.getQuoteFromProvider(provider, request).catch(error => {
        console.error(`Erro ao obter cotação de ${provider.name}:`, error);
        return null;
      })
    );

    const results = await Promise.all(quotePromises);
    
    // Filtrar resultados nulos e adicionar ao array
    results.forEach((quote, index) => {
      if (quote) {
        quotes.push(quote);
      }
    });

    // Ordenar por preço (menor primeiro)
    quotes.sort((a, b) => a.premiumAmount - b.premiumAmount);

    return quotes;
  }

  /**
   * Obter cotação de um provedor específico
   */
  private async getQuoteFromProvider(
    provider: InsuranceProvider,
    request: QuoteRequest
  ): Promise<InsuranceQuote[]> {
    const quotes: InsuranceQuote[] = [];
    const coverageTypes = request.coverageTypes || ['basic', 'standard', 'premium', 'comprehensive'];

    // Se for o provedor interno, usar cálculo local
    if (provider.id === 'internal') {
      for (const coverageType of coverageTypes) {
        const quote = this.calculateInternalQuote(provider, request, coverageType);
        quotes.push(quote);
      }
      return quotes;
    }

    // Para provedores externos, fazer chamada à API
    if (provider.apiEndpoint && provider.apiKey) {
      try {
        const externalQuotes = await this.fetchExternalQuotes(provider, request);
        quotes.push(...externalQuotes);
      } catch (error) {
        console.error(`Erro ao buscar cotações de ${provider.name}:`, error);
        // Em caso de erro, retornar cotação estimada baseada em padrões
        for (const coverageType of coverageTypes) {
          const quote = this.estimateQuote(provider, request, coverageType);
          quotes.push(quote);
        }
      }
    } else {
      // Se não houver API configurada, usar estimativa
      for (const coverageType of coverageTypes) {
        const quote = this.estimateQuote(provider, request, coverageType);
        quotes.push(quote);
      }
    }

    return quotes;
  }

  /**
   * Calcular cotação do provedor interno
   */
  private calculateInternalQuote(
    provider: InsuranceProvider,
    request: QuoteRequest,
    coverageType: 'basic' | 'standard' | 'premium' | 'comprehensive'
  ): InsuranceQuote {
    const multipliers = {
      basic: 0.5,
      standard: 0.75,
      premium: 1.0,
      comprehensive: 1.5,
    };

    const basePremium = request.totalBookingAmount * 0.02; // 2% do valor da reserva
    const coverageMultiplier = multipliers[coverageType];
    const durationMultiplier = Math.max(1, request.tripDurationDays / 7); // Aumenta com duração
    const travelersMultiplier = request.numberOfTravelers;

    const premiumAmount = basePremium * coverageMultiplier * durationMultiplier * travelersMultiplier;
    const coverageAmount = request.totalBookingAmount * coverageMultiplier;

    const featuresMap: Record<string, string[]> = {
      basic: ['Cancelamento de viagem', 'Atraso de voo', 'Bagagem extraviada'],
      standard: [
        'Cancelamento de viagem',
        'Atraso de voo',
        'Bagagem extraviada',
        'Despesas médicas',
        'Repatriamento',
      ],
      premium: [
        'Cancelamento de viagem',
        'Atraso de voo',
        'Bagagem extraviada',
        'Despesas médicas',
        'Repatriamento',
        'Cancelamento por qualquer motivo',
        'Proteção de equipamentos',
        'Assistência 24/7',
      ],
      comprehensive: [
        'Cancelamento de viagem',
        'Atraso de voo',
        'Bagagem extraviada',
        'Despesas médicas',
        'Repatriamento',
        'Cancelamento por qualquer motivo',
        'Proteção de equipamentos',
        'Assistência 24/7',
        'Cobertura de atividades esportivas',
        'Proteção de documentos',
        'Suporte VIP',
      ],
    };

    return {
      providerId: provider.id,
      providerName: provider.name,
      providerLogo: provider.logo,
      coverageType,
      premiumAmount: Math.round(premiumAmount * 100) / 100,
      coverageAmount: Math.round(coverageAmount * 100) / 100,
      currency: 'BRL',
      features: featuresMap[coverageType],
      exclusions: ['Guerra', 'Atos terroristas', 'Doenças pré-existentes não declaradas'],
      deductible: coverageType === 'basic' ? 500 : coverageType === 'standard' ? 300 : 100,
      durationDays: request.tripDurationDays,
      rating: provider.rating,
      responseTime: provider.responseTime,
      estimatedProcessingTime: 'Imediato',
    };
  }

  /**
   * Buscar cotações de provedor externo
   */
  private async fetchExternalQuotes(
    provider: InsuranceProvider,
    request: QuoteRequest
  ): Promise<InsuranceQuote[]> {
    // Simulação de chamada à API externa
    // Em produção, isso faria uma chamada HTTP real
    const response = await fetch(`${provider.apiEndpoint}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        trip_duration_days: request.tripDurationDays,
        number_of_travelers: request.numberOfTravelers,
        destination: request.destination,
        total_amount: request.totalBookingAmount,
        travelers: request.travelers,
        start_date: request.startDate?.toISOString(),
        end_date: request.endDate?.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar cotações: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Converter resposta da API externa para formato interno
    return data.quotes.map((quote: any) => ({
      providerId: provider.id,
      providerName: provider.name,
      providerLogo: provider.logo,
      coverageType: quote.coverage_type || 'standard',
      premiumAmount: quote.premium_amount,
      coverageAmount: quote.coverage_amount,
      currency: quote.currency || 'BRL',
      features: quote.features || [],
      exclusions: quote.exclusions || [],
      deductible: quote.deductible,
      maxAge: quote.max_age,
      minAge: quote.min_age,
      durationDays: request.tripDurationDays,
      termsUrl: quote.terms_url,
      rating: provider.rating,
      responseTime: provider.responseTime,
      estimatedProcessingTime: quote.estimated_processing_time,
    }));
  }

  /**
   * Estimar cotação quando API não está disponível
   */
  private estimateQuote(
    provider: InsuranceProvider,
    request: QuoteRequest,
    coverageType: 'basic' | 'standard' | 'premium' | 'comprehensive'
  ): InsuranceQuote {
    // Estimativa baseada em padrões de mercado
    const multipliers = {
      basic: 0.5,
      standard: 0.75,
      premium: 1.0,
      comprehensive: 1.5,
    };

    const basePremium = request.totalBookingAmount * 0.025; // 2.5% do valor
    const coverageMultiplier = multipliers[coverageType];
    const durationMultiplier = Math.max(1, request.tripDurationDays / 7);
    const travelersMultiplier = request.numberOfTravelers;
    
    // Adicionar variação aleatória para simular diferentes provedores
    const variation = 0.8 + Math.random() * 0.4; // Entre 80% e 120%

    const premiumAmount = basePremium * coverageMultiplier * durationMultiplier * travelersMultiplier * variation;
    const coverageAmount = request.totalBookingAmount * coverageMultiplier;

    return {
      providerId: provider.id,
      providerName: provider.name,
      providerLogo: provider.logo,
      coverageType,
      premiumAmount: Math.round(premiumAmount * 100) / 100,
      coverageAmount: Math.round(coverageAmount * 100) / 100,
      currency: 'BRL',
      features: provider.features,
      exclusions: ['Guerra', 'Atos terroristas', 'Doenças pré-existentes'],
      deductible: coverageType === 'basic' ? 500 : coverageType === 'standard' ? 300 : 100,
      durationDays: request.tripDurationDays,
      rating: provider.rating,
      responseTime: provider.responseTime,
      estimatedProcessingTime: '1-2 dias úteis',
    };
  }

  /**
   * Comparar cotações e recomendar a melhor
   */
  compareQuotes(quotes: InsuranceQuote[]): {
    bestValue: InsuranceQuote | null;
    cheapest: InsuranceQuote | null;
    bestRating: InsuranceQuote | null;
    recommendations: InsuranceQuote[];
  } {
    if (quotes.length === 0) {
      return {
        bestValue: null,
        cheapest: null,
        bestRating: null,
        recommendations: [],
      };
    }

    // Mais barato
    const cheapest = quotes.reduce((prev, current) =>
      prev.premiumAmount < current.premiumAmount ? prev : current
    );

    // Melhor avaliação
    const bestRating = quotes
      .filter(q => q.rating)
      .reduce((prev, current) =>
        (prev.rating || 0) > (current.rating || 0) ? prev : current,
        quotes[0]
      );

    // Melhor custo-benefício (preço baixo + boa avaliação)
    const bestValue = quotes.reduce((prev, current) => {
      const prevScore = (prev.rating || 0) / (prev.premiumAmount || 1);
      const currentScore = (current.rating || 0) / (current.premiumAmount || 1);
      return currentScore > prevScore ? current : prev;
    });

    // Recomendações (top 3)
    const recommendations = quotes
      .sort((a, b) => {
        const scoreA = (a.rating || 0) / (a.premiumAmount || 1);
        const scoreB = (b.rating || 0) / (b.premiumAmount || 1);
        return scoreB - scoreA;
      })
      .slice(0, 3);

    return {
      bestValue,
      cheapest,
      bestRating,
      recommendations,
    };
  }
}

// Instância singleton
export const multiInsuranceService = new MultiInsuranceService();

