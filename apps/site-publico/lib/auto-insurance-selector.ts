/**
 * Serviço de Seleção Automática de Seguros
 * Seleciona automaticamente o melhor seguro baseado em critérios configuráveis
 */

import { type InsuranceQuote, multiInsuranceService, type QuoteRequest } from './multi-insurance-service';

export interface SelectionCriteria {
  priority: 'price' | 'rating' | 'coverage' | 'value' | 'balanced';
  maxPrice?: number;
  minRating?: number;
  minCoverage?: number;
  preferredProviders?: string[];
  excludeProviders?: string[];
  coverageType?: 'basic' | 'standard' | 'premium' | 'comprehensive';
  requireFeatures?: string[];
  excludeFeatures?: string[];
}

export interface AutoSelectionResult {
  selectedQuote: InsuranceQuote | null;
  score: number;
  reason: string;
  alternatives: InsuranceQuote[];
  comparison: {
    totalQuotes: number;
    filteredQuotes: number;
    averagePrice: number;
    averageRating: number;
  };
}

/**
 * Serviço de seleção automática de seguros
 */
export class AutoInsuranceSelector {
  /**
   * Selecionar automaticamente o melhor seguro
   */
  async autoSelect(
    quoteRequest: QuoteRequest,
    criteria: SelectionCriteria = { priority: 'balanced' }
  ): Promise<AutoSelectionResult> {
    // Obter todas as cotações
    const allQuotes = await multiInsuranceService.getQuotes(quoteRequest);

    if (allQuotes.length === 0) {
      return {
        selectedQuote: null,
        score: 0,
        reason: 'Nenhuma cotação disponível',
        alternatives: [],
        comparison: {
          totalQuotes: 0,
          filteredQuotes: 0,
          averagePrice: 0,
          averageRating: 0,
        },
      };
    }

    // Filtrar cotações baseado nos critérios
    let filteredQuotes = this.filterQuotes(allQuotes, criteria);

    if (filteredQuotes.length === 0) {
      return {
        selectedQuote: null,
        score: 0,
        reason: 'Nenhuma cotação atende aos critérios especificados',
        alternatives: allQuotes.slice(0, 3), // Retornar alternativas mesmo que não atendam critérios
        comparison: {
          totalQuotes: allQuotes.length,
          filteredQuotes: 0,
          averagePrice: this.calculateAveragePrice(allQuotes),
          averageRating: this.calculateAverageRating(allQuotes),
        },
      };
    }

    // Selecionar a melhor cotação baseado na prioridade
    const selectedQuote = this.selectBestQuote(filteredQuotes, criteria);
    const score = this.calculateScore(selectedQuote, criteria, filteredQuotes);
    const reason = this.generateReason(selectedQuote, criteria, filteredQuotes);

    // Ordenar alternativas (top 3)
    const alternatives = filteredQuotes
      .filter(q => q.providerId !== selectedQuote.providerId || q.coverageType !== selectedQuote.coverageType)
      .sort((a, b) => {
        const scoreA = this.calculateScore(a, criteria, filteredQuotes);
        const scoreB = this.calculateScore(b, criteria, filteredQuotes);
        return scoreB - scoreA;
      })
      .slice(0, 3);

    return {
      selectedQuote,
      score,
      reason,
      alternatives,
      comparison: {
        totalQuotes: allQuotes.length,
        filteredQuotes: filteredQuotes.length,
        averagePrice: this.calculateAveragePrice(filteredQuotes),
        averageRating: this.calculateAverageRating(filteredQuotes),
      },
    };
  }

  /**
   * Filtrar cotações baseado nos critérios
   */
  private filterQuotes(quotes: InsuranceQuote[], criteria: SelectionCriteria): InsuranceQuote[] {
    let filtered = [...quotes];

    // Filtrar por preço máximo
    if (criteria.maxPrice !== undefined) {
      filtered = filtered.filter(q => q.premiumAmount <= criteria.maxPrice);
    }

    // Filtrar por avaliação mínima
    if (criteria.minRating !== undefined) {
      filtered = filtered.filter(q => (q.rating || 0) >= criteria.minRating!);
    }

    // Filtrar por cobertura mínima
    if (criteria.minCoverage !== undefined) {
      filtered = filtered.filter(q => q.coverageAmount >= criteria.minCoverage!);
    }

    // Filtrar por tipo de cobertura
    if (criteria.coverageType) {
      filtered = filtered.filter(q => q.coverageType === criteria.coverageType);
    }

    // Filtrar por provedores preferidos
    if (criteria.preferredProviders && criteria.preferredProviders.length > 0) {
      filtered = filtered.filter(q => criteria.preferredProviders!.includes(q.providerId));
    }

    // Excluir provedores
    if (criteria.excludeProviders && criteria.excludeProviders.length > 0) {
      filtered = filtered.filter(q => !criteria.excludeProviders!.includes(q.providerId));
    }

    // Filtrar por features requeridas
    if (criteria.requireFeatures && criteria.requireFeatures.length > 0) {
      filtered = filtered.filter(q =>
        criteria.requireFeatures!.every(feature =>
          q.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
        )
      );
    }

    // Excluir features
    if (criteria.excludeFeatures && criteria.excludeFeatures.length > 0) {
      filtered = filtered.filter(q =>
        !criteria.excludeFeatures!.some(feature =>
          q.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
        )
      );
    }

    return filtered;
  }

  /**
   * Selecionar a melhor cotação baseado na prioridade
   */
  private selectBestQuote(
    quotes: InsuranceQuote[],
    criteria: SelectionCriteria
  ): InsuranceQuote {
    switch (criteria.priority) {
      case 'price':
        return quotes.reduce((prev, current) =>
          prev.premiumAmount < current.premiumAmount ? prev : current
        );

      case 'rating':
        return quotes
          .filter(q => q.rating)
          .reduce((prev, current) =>
            (prev.rating || 0) > (current.rating || 0) ? prev : current,
            quotes[0]
          );

      case 'coverage':
        return quotes.reduce((prev, current) =>
          prev.coverageAmount > current.coverageAmount ? prev : current
        );

      case 'value':
        return quotes.reduce((prev, current) => {
          const prevScore = (prev.rating || 0) / (prev.premiumAmount || 1);
          const currentScore = (current.rating || 0) / (current.premiumAmount || 1);
          return currentScore > prevScore ? current : prev;
        });

      case 'balanced':
      default:
        return this.selectBalanced(quotes);
    }
  }

  /**
   * Seleção balanceada (considera múltiplos fatores)
   */
  private selectBalanced(quotes: InsuranceQuote[]): InsuranceQuote {
    // Calcular score para cada cotação
    const scoredQuotes = quotes.map(quote => ({
      quote,
      score: this.calculateBalancedScore(quote, quotes),
    }));

    // Retornar a cotação com maior score
    return scoredQuotes.reduce((prev, current) =>
      current.score > prev.score ? current : prev
    ).quote;
  }

  /**
   * Calcular score balanceado
   */
  private calculateBalancedScore(quote: InsuranceQuote, allQuotes: InsuranceQuote[]): number {
    const maxPrice = Math.max(...allQuotes.map(q => q.premiumAmount));
    const minPrice = Math.min(...allQuotes.map(q => q.premiumAmount));
    const maxRating = Math.max(...allQuotes.map(q => q.rating || 0));
    const maxCoverage = Math.max(...allQuotes.map(q => q.coverageAmount));

    // Normalizar valores (0-1)
    const priceScore = maxPrice > minPrice
      ? 1 - (quote.premiumAmount - minPrice) / (maxPrice - minPrice)
      : 1;

    const ratingScore = maxRating > 0
      ? (quote.rating || 0) / maxRating
      : 0;

    const coverageScore = maxCoverage > 0
      ? quote.coverageAmount / maxCoverage
      : 0;

    const featuresScore = quote.features.length / 10; // Normalizar para 10 features

    // Pesos: preço (30%), avaliação (30%), cobertura (20%), features (20%)
    return (
      priceScore * 0.3 +
      ratingScore * 0.3 +
      coverageScore * 0.2 +
      Math.min(featuresScore, 1) * 0.2
    );
  }

  /**
   * Calcular score de uma cotação
   */
  private calculateScore(
    quote: InsuranceQuote,
    criteria: SelectionCriteria,
    allQuotes: InsuranceQuote[]
  ): number {
    switch (criteria.priority) {
      case 'price':
        const maxPrice = Math.max(...allQuotes.map(q => q.premiumAmount));
        const minPrice = Math.min(...allQuotes.map(q => q.premiumAmount));
        return maxPrice > minPrice
          ? 1 - (quote.premiumAmount - minPrice) / (maxPrice - minPrice)
          : 1;

      case 'rating':
        const maxRating = Math.max(...allQuotes.map(q => q.rating || 0));
        return maxRating > 0 ? (quote.rating || 0) / maxRating : 0;

      case 'coverage':
        const maxCoverage = Math.max(...allQuotes.map(q => q.coverageAmount));
        return maxCoverage > 0 ? quote.coverageAmount / maxCoverage : 0;

      case 'value':
        const avgPrice = this.calculateAveragePrice(allQuotes);
        const avgRating = this.calculateAverageRating(allQuotes);
        const priceScore = avgPrice > 0 ? 1 - (quote.premiumAmount / avgPrice) : 0;
        const ratingScore = avgRating > 0 ? (quote.rating || 0) / avgRating : 0;
        return (priceScore + ratingScore) / 2;

      case 'balanced':
      default:
        return this.calculateBalancedScore(quote, allQuotes);
    }
  }

  /**
   * Gerar razão para a seleção
   */
  private generateReason(
    quote: InsuranceQuote,
    criteria: SelectionCriteria,
    allQuotes: InsuranceQuote[]
  ): string {
    const reasons: string[] = [];

    switch (criteria.priority) {
      case 'price':
        const cheapest = allQuotes.reduce((prev, current) =>
          prev.premiumAmount < current.premiumAmount ? prev : current
        );
        if (quote.providerId === cheapest.providerId && quote.coverageType === cheapest.coverageType) {
          reasons.push('Melhor preço disponível');
        }
        break;

      case 'rating':
        const bestRated = allQuotes
          .filter(q => q.rating)
          .reduce((prev, current) =>
            (prev.rating || 0) > (current.rating || 0) ? prev : current,
            allQuotes[0]
          );
        if (quote.providerId === bestRated.providerId && quote.coverageType === bestRated.coverageType) {
          reasons.push('Melhor avaliação');
        }
        break;

      case 'coverage':
        const bestCoverage = allQuotes.reduce((prev, current) =>
          prev.coverageAmount > current.coverageAmount ? prev : current
        );
        if (quote.providerId === bestCoverage.providerId && quote.coverageType === bestCoverage.coverageType) {
          reasons.push('Maior cobertura');
        }
        break;

      case 'value':
        reasons.push('Melhor custo-benefício');
        break;

      case 'balanced':
      default:
        reasons.push('Seleção balanceada considerando preço, avaliação e cobertura');
    }

    // Adicionar informações adicionais
    if (quote.rating && quote.rating >= 4.5) {
      reasons.push('Avaliação excelente');
    }

    if (quote.features.length >= 8) {
      reasons.push('Cobertura abrangente');
    }

    const avgPrice = this.calculateAveragePrice(allQuotes);
    if (quote.premiumAmount < avgPrice * 0.9) {
      reasons.push('Preço abaixo da média');
    }

    return reasons.join(', ') || 'Selecionado automaticamente';
  }

  /**
   * Calcular preço médio
   */
  private calculateAveragePrice(quotes: InsuranceQuote[]): number {
    if (quotes.length === 0) return 0;
    const sum = quotes.reduce((acc, q) => acc + q.premiumAmount, 0);
    return sum / quotes.length;
  }

  /**
   * Calcular avaliação média
   */
  private calculateAverageRating(quotes: InsuranceQuote[]): number {
    const ratedQuotes = quotes.filter(q => q.rating);
    if (ratedQuotes.length === 0) return 0;
    const sum = ratedQuotes.reduce((acc, q) => acc + (q.rating || 0), 0);
    return sum / ratedQuotes.length;
  }

  /**
   * Sugerir critérios baseado no perfil do usuário
   */
  suggestCriteria(userProfile?: {
    budget?: number;
    riskTolerance?: 'low' | 'medium' | 'high';
    preferredCoverage?: 'basic' | 'standard' | 'premium' | 'comprehensive';
    previousClaims?: number;
  }): SelectionCriteria {
    const criteria: SelectionCriteria = {
      priority: 'balanced',
    };

    if (userProfile?.budget) {
      criteria.maxPrice = userProfile.budget;
    }

    if (userProfile?.preferredCoverage) {
      criteria.coverageType = userProfile.preferredCoverage;
    }

    if (userProfile?.riskTolerance === 'low') {
      criteria.priority = 'coverage';
      criteria.minRating = 4.5;
    } else if (userProfile?.riskTolerance === 'high') {
      criteria.priority = 'price';
    }

    if (userProfile?.previousClaims && userProfile.previousClaims > 0) {
      criteria.requireFeatures = ['Cancelamento por qualquer motivo', 'Assistência 24/7'];
      criteria.minRating = 4.0;
    }

    return criteria;
  }
}

// Instância singleton
export const autoInsuranceSelector = new AutoInsuranceSelector();

