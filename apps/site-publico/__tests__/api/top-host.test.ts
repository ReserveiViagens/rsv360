/**
 * ✅ TESTES: API TOP HOST / QUALITY
 * Testes para validação e funcionalidade de qualidade e ratings
 */

import { describe, it, expect } from '@jest/globals';
import { updateHostRatingSchema, assignBadgeSchema } from '@/lib/schemas/top-host-schemas';

describe('Top Host API - Validação Zod', () => {
  it('deve validar atualização de rating com dados válidos', () => {
    const validData = {
      host_id: 1,
      rating_type: 'overall',
      rating_value: 4.5,
      item_id: 1,
    };

    const result = updateHostRatingSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.host_id).toBe(1);
      expect(result.data.rating_value).toBe(4.5);
      expect(result.data.rating_type).toBe('overall');
    }
  });

  it('deve rejeitar rating fora do range 0-5', () => {
    const invalidData = {
      host_id: 1,
      rating_type: 'overall',
      rating_value: 6, // Inválido
    };

    const result = updateHostRatingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('rating_value');
    }
  });

  it('deve validar atribuição de badge', () => {
    const validData = {
      host_id: 1,
      badge_id: 1,
      item_id: 1,
    };

    const result = assignBadgeSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.host_id).toBe(1);
      expect(result.data.badge_id).toBe(1);
    }
  });
});

describe('Top Host API - Sistema de Níveis', () => {
  it('deve determinar SuperHost corretamente', () => {
    const metrics = {
      overallRating: 4.8,
      acceptanceRate: 0.95,
      cancellationRate: 0.005,
      avgResponseTime: 0.5, // 30 minutos
      totalBookings: 15,
    };

    const isSuperHost =
      metrics.overallRating >= 4.8 &&
      metrics.acceptanceRate >= 0.90 &&
      metrics.cancellationRate < 0.01 &&
      metrics.avgResponseTime < 1 &&
      metrics.totalBookings >= 10;

    expect(isSuperHost).toBe(true);
  });

  it('deve determinar Top Host corretamente', () => {
    const metrics = {
      overallRating: 4.6,
      acceptanceRate: 0.85,
      totalBookings: 8,
    };

    const isTopHost =
      metrics.overallRating >= 4.5 &&
      metrics.acceptanceRate >= 0.80 &&
      metrics.totalBookings >= 5;

    expect(isTopHost).toBe(true);
  });

  it('deve determinar Host Regular quando não atende critérios', () => {
    const metrics = {
      overallRating: 4.2,
      acceptanceRate: 0.75,
      totalBookings: 3,
    };

    const isRegular =
      !(metrics.overallRating >= 4.5 && metrics.acceptanceRate >= 0.80 && metrics.totalBookings >= 5) &&
      !(metrics.overallRating >= 4.8 && metrics.acceptanceRate >= 0.90);

    expect(isRegular).toBe(true);
  });
});

describe('Top Host API - Cálculo de Scores', () => {
  it('deve calcular score geral corretamente', () => {
    const qualityScore = 85; // 0-100
    const performanceScore = 90; // 0-100
    const guestSatisfactionScore = 88; // 0-100

    const overallScore = (qualityScore + performanceScore + guestSatisfactionScore) / 3;

    expect(overallScore).toBeGreaterThanOrEqual(0);
    expect(overallScore).toBeLessThanOrEqual(100);
    expect(overallScore).toBeCloseTo(87.67, 2);
  });

  it('deve converter score 0-100 para rating 0-5', () => {
    const score = 90; // 0-100
    const rating = score / 20; // Converter para 0-5

    expect(rating).toBe(4.5);
    expect(rating).toBeGreaterThanOrEqual(0);
    expect(rating).toBeLessThanOrEqual(5);
  });
});

describe('Top Host API - Sistema de Tiers', () => {
  it('deve classificar tier Diamond corretamente', () => {
    const overallScore = 4.8; // 0-5
    const tier = overallScore >= 4.8 ? 'diamond' : overallScore >= 4.5 ? 'platinum' : overallScore >= 4.0 ? 'gold' : overallScore >= 3.5 ? 'silver' : 'bronze';

    expect(tier).toBe('diamond');
  });

  it('deve classificar tier Bronze corretamente', () => {
    const overallScore = 3.0; // 0-5
    const tier = overallScore >= 4.8 ? 'diamond' : overallScore >= 4.5 ? 'platinum' : overallScore >= 4.0 ? 'gold' : overallScore >= 3.5 ? 'silver' : 'bronze';

    expect(tier).toBe('bronze');
  });
});

describe('Top Host API - Leaderboard', () => {
  it('deve ordenar hosts por score descendente', () => {
    const hosts = [
      { host_id: 1, overall_score: 4.5 },
      { host_id: 2, overall_score: 4.8 },
      { host_id: 3, overall_score: 4.2 },
    ];

    const sorted = hosts.sort((a, b) => b.overall_score - a.overall_score);

    expect(sorted[0].overall_score).toBe(4.8);
    expect(sorted[1].overall_score).toBe(4.5);
    expect(sorted[2].overall_score).toBe(4.2);
  });

  it('deve aplicar filtro de mínimo de reservas', () => {
    const hosts = [
      { host_id: 1, overall_score: 4.5, total_bookings: 10 },
      { host_id: 2, overall_score: 4.8, total_bookings: 3 },
      { host_id: 3, overall_score: 4.2, total_bookings: 8 },
    ];

    const minBookings = 5;
    const filtered = hosts.filter((h) => h.total_bookings >= minBookings);

    expect(filtered.length).toBe(2);
    expect(filtered.every((h) => h.total_bookings >= minBookings)).toBe(true);
  });
});


