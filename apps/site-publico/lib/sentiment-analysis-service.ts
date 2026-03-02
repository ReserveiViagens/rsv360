/**
 * Serviço de Análise de Sentimento
 * Processa reviews e extrai sentimento para influenciar precificação
 */

import { queryDatabase } from './db';

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number; // -1 a 1 (-1 = muito negativo, 1 = muito positivo)
  confidence: number; // 0 a 1
  aspects: {
    cleanliness: number;
    location: number;
    value: number;
    communication: number;
    checkin: number;
    accuracy: number;
  };
  keywords: {
    positive: string[];
    negative: string[];
  };
  recommendations: {
    pricingImpact: number; // -0.2 a 0.2 (impacto no preço)
    reason: string;
  };
}

/**
 * Analisar sentimento de um review
 */
export async function analyzeReviewSentiment(
  reviewId: number
): Promise<SentimentAnalysis> {
  // Buscar review
  const review = await queryDatabase(
    `SELECT r.*, p.id as property_id
     FROM reviews r
     JOIN bookings b ON r.booking_id = b.id
     JOIN properties p ON b.property_id = p.id
     WHERE r.id = $1`,
    [reviewId]
  );

  if (review.length === 0) {
    throw new Error('Review não encontrado');
  }

  const reviewData = review[0];

  // Analisar texto do review
  const textAnalysis = analyzeText(reviewData.comment || '');
  
  // Analisar ratings
  const ratingAnalysis = analyzeRatings({
    overall: reviewData.rating || 0,
    cleanliness: reviewData.cleanliness_rating || 0,
    communication: reviewData.communication_rating || 0,
    value: reviewData.value_rating || 0,
    location: reviewData.location_rating || 0,
    checkin: reviewData.checkin_rating || 0,
    accuracy: reviewData.accuracy_rating || 0,
  });

  // Combinar análises
  const overallScore = (textAnalysis.score * 0.6) + (ratingAnalysis.score * 0.4);
  const overall = overallScore > 0.2 ? 'positive' : overallScore < -0.2 ? 'negative' : 'neutral';

  // Calcular confiança
  const confidence = Math.min(1, (textAnalysis.confidence + ratingAnalysis.confidence) / 2);

  // Gerar recomendações de precificação
  const recommendations = generatePricingRecommendations(overallScore, ratingAnalysis.aspects);

  return {
    overall,
    score: overallScore,
    confidence,
    aspects: ratingAnalysis.aspects,
    keywords: textAnalysis.keywords,
    recommendations,
  };
}

/**
 * Analisar sentimento de múltiplos reviews de uma propriedade
 */
export async function analyzePropertySentiment(
  propertyId: number,
  limit: number = 50
): Promise<SentimentAnalysis & { reviewCount: number; recentTrend: 'improving' | 'stable' | 'declining' }> {
  // Buscar reviews recentes
  const reviews = await queryDatabase(
    `SELECT r.*
     FROM reviews r
     JOIN bookings b ON r.booking_id = b.id
     WHERE b.property_id = $1
     AND r.rating IS NOT NULL
     ORDER BY r.created_at DESC
     LIMIT $2`,
    [propertyId, limit]
  );

  if (reviews.length === 0) {
    return {
      overall: 'neutral',
      score: 0,
      confidence: 0,
      aspects: {
        cleanliness: 0,
        location: 0,
        value: 0,
        communication: 0,
        checkin: 0,
        accuracy: 0,
      },
      keywords: {
        positive: [],
        negative: [],
      },
      recommendations: {
        pricingImpact: 0,
        reason: 'Sem reviews suficientes',
      },
      reviewCount: 0,
      recentTrend: 'stable',
    };
  }

  // Analisar todos os reviews
  const analyses = await Promise.all(
    reviews.map(r => analyzeReviewSentiment(r.id))
  );

  // Calcular médias
  const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
  const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;

  // Determinar sentimento geral
  const overall = avgScore > 0.2 ? 'positive' : avgScore < -0.2 ? 'negative' : 'neutral';

  // Calcular aspectos médios
  const aspects = {
    cleanliness: analyses.reduce((sum, a) => sum + a.aspects.cleanliness, 0) / analyses.length,
    location: analyses.reduce((sum, a) => sum + a.aspects.location, 0) / analyses.length,
    value: analyses.reduce((sum, a) => sum + a.aspects.value, 0) / analyses.length,
    communication: analyses.reduce((sum, a) => sum + a.aspects.communication, 0) / analyses.length,
    checkin: analyses.reduce((sum, a) => sum + a.aspects.checkin, 0) / analyses.length,
    accuracy: analyses.reduce((sum, a) => sum + a.aspects.accuracy, 0) / analyses.length,
  };

  // Consolidar keywords
  const allPositiveKeywords = new Set<string>();
  const allNegativeKeywords = new Set<string>();
  
  analyses.forEach(a => {
    a.keywords.positive.forEach(k => allPositiveKeywords.add(k));
    a.keywords.negative.forEach(k => allNegativeKeywords.add(k));
  });

  // Analisar tendência recente
  const recentTrend = analyzeRecentTrend(reviews);

  // Gerar recomendações consolidadas
  const recommendations = generatePricingRecommendations(avgScore, aspects);

  return {
    overall,
    score: avgScore,
    confidence: avgConfidence,
    aspects,
    keywords: {
      positive: Array.from(allPositiveKeywords).slice(0, 10),
      negative: Array.from(allNegativeKeywords).slice(0, 10),
    },
    recommendations,
    reviewCount: reviews.length,
    recentTrend,
  };
}

/**
 * Analisar texto do review
 */
function analyzeText(text: string): {
  score: number;
  confidence: number;
  keywords: { positive: string[]; negative: string[] };
} {
  if (!text || text.length === 0) {
    return {
      score: 0,
      confidence: 0,
      keywords: { positive: [], negative: [] },
    };
  }

  const lowerText = text.toLowerCase();

  // Palavras positivas (peso)
  const positiveWords: Record<string, number> = {
    'excelente': 0.8,
    'ótimo': 0.7,
    'perfeito': 0.9,
    'maravilhoso': 0.8,
    'recomendo': 0.6,
    'superou': 0.7,
    'incrível': 0.8,
    'fantástico': 0.8,
    'limpo': 0.5,
    'confortável': 0.6,
    'localização': 0.4,
    'atendimento': 0.5,
    'anfitrião': 0.4,
  };

  // Palavras negativas (peso)
  const negativeWords: Record<string, number> = {
    'ruim': -0.8,
    'péssimo': -0.9,
    'horrível': -0.9,
    'sujo': -0.7,
    'barulho': -0.6,
    'problema': -0.5,
    'desapontado': -0.7,
    'não recomendo': -0.8,
    'falta': -0.5,
    'quebrado': -0.6,
    'mal': -0.6,
    'decepcionante': -0.7,
  };

  let positiveScore = 0;
  let negativeScore = 0;
  const foundPositive: string[] = [];
  const foundNegative: string[] = [];

  // Buscar palavras positivas
  Object.entries(positiveWords).forEach(([word, weight]) => {
    if (lowerText.includes(word)) {
      positiveScore += weight;
      foundPositive.push(word);
    }
  });

  // Buscar palavras negativas
  Object.entries(negativeWords).forEach(([word, weight]) => {
    if (lowerText.includes(word)) {
      negativeScore += weight;
      foundNegative.push(word);
    }
  });

  // Calcular score final (-1 a 1)
  const totalScore = positiveScore + negativeScore;
  const normalizedScore = Math.max(-1, Math.min(1, totalScore / 5)); // Normalizar

  // Calcular confiança baseado em quantidade de palavras encontradas
  const totalWords = foundPositive.length + foundNegative.length;
  const confidence = Math.min(1, totalWords / 5);

  return {
    score: normalizedScore,
    confidence,
    keywords: {
      positive: foundPositive,
      negative: foundNegative,
    },
  };
}

/**
 * Analisar ratings numéricos
 */
function analyzeRatings(ratings: {
  overall: number;
  cleanliness?: number;
  communication?: number;
  value?: number;
  location?: number;
  checkin?: number;
  accuracy?: number;
}): {
  score: number;
  confidence: number;
  aspects: SentimentAnalysis['aspects'];
} {
  // Normalizar ratings (assumindo escala 1-5)
  const normalize = (rating: number) => (rating - 3) / 2; // -1 a 1

  const overallScore = normalize(ratings.overall);
  
  const aspects = {
    cleanliness: ratings.cleanliness ? normalize(ratings.cleanliness) : 0,
    location: ratings.location ? normalize(ratings.location) : 0,
    value: ratings.value ? normalize(ratings.value) : 0,
    communication: ratings.communication ? normalize(ratings.communication) : 0,
    checkin: ratings.checkin ? normalize(ratings.checkin) : 0,
    accuracy: ratings.accuracy ? normalize(ratings.accuracy) : 0,
  };

  // Calcular confiança baseado em quantidade de ratings disponíveis
  const availableRatings = Object.values(ratings).filter(r => r && r > 0).length;
  const confidence = Math.min(1, availableRatings / 7);

  return {
    score: overallScore,
    confidence,
    aspects,
  };
}

/**
 * Gerar recomendações de precificação baseadas em sentimento
 */
function generatePricingRecommendations(
  sentimentScore: number,
  aspects: SentimentAnalysis['aspects']
): SentimentAnalysis['recommendations'] {
  // Impacto baseado no sentimento geral
  let pricingImpact = sentimentScore * 0.15; // Até 15% de impacto

  // Ajustar baseado em aspectos específicos
  const avgAspectScore = Object.values(aspects).reduce((sum, s) => sum + s, 0) / Object.values(aspects).length;
  
  // Se "value" (custo-benefício) está baixo, considerar reduzir preço
  if (aspects.value < -0.3) {
    pricingImpact -= 0.1;
  }

  // Se "value" está alto, pode aumentar preço
  if (aspects.value > 0.3 && sentimentScore > 0.3) {
    pricingImpact += 0.05;
  }

  // Limitar impacto entre -20% e +20%
  pricingImpact = Math.max(-0.2, Math.min(0.2, pricingImpact));

  let reason: string;
  if (pricingImpact > 0.05) {
    reason = `Reviews muito positivos (${(sentimentScore * 100).toFixed(0)}%). Oportunidade de aumentar preço.`;
  } else if (pricingImpact < -0.05) {
    reason = `Reviews negativos (${(sentimentScore * 100).toFixed(0)}%). Considerar reduzir preço para melhorar percepção de valor.`;
  } else {
    reason = `Sentimento neutro. Manter preço atual.`;
  }

  return {
    pricingImpact,
    reason,
  };
}

/**
 * Analisar tendência recente de reviews
 */
function analyzeRecentTrend(reviews: any[]): 'improving' | 'stable' | 'declining' {
  if (reviews.length < 10) {
    return 'stable';
  }

  // Comparar últimos 10 com anteriores
  const recent = reviews.slice(0, 10);
  const older = reviews.slice(10, 20);

  const recentAvg = recent.reduce((sum, r) => sum + (r.rating || 0), 0) / recent.length;
  const olderAvg = older.length > 0
    ? older.reduce((sum, r) => sum + (r.rating || 0), 0) / older.length
    : recentAvg;

  if (recentAvg > olderAvg + 0.3) {
    return 'improving';
  } else if (recentAvg < olderAvg - 0.3) {
    return 'declining';
  }

  return 'stable';
}

/**
 * Integrar análise de sentimento com precificação
 */
export async function getSentimentBasedPricingAdjustment(
  propertyId: number
): Promise<number> {
  const sentiment = await analyzePropertySentiment(propertyId);
  return sentiment.recommendations.pricingImpact;
}

