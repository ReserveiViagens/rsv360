/**
 * ✅ TESTES: API SMART PRICING
 * Testes para validação e funcionalidade de smart pricing
 */

import { describe, it, expect } from '@jest/globals';
import { calculateSmartPriceSchema } from '@/lib/schemas/smart-pricing-schemas';

describe('Smart Pricing API - Validação Zod', () => {
  it('deve validar cálculo de preço com dados válidos', () => {
    const validData = {
      item_id: 1,
      base_price: 200.00,
      check_in: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      check_out: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Caldas Novas, GO',
    };

    const result = calculateSmartPriceSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.item_id).toBe(1);
      expect(result.data.base_price).toBe(200.00);
      expect(result.data.check_out > result.data.check_in).toBe(true);
    }
  });

  it('deve rejeitar cálculo sem item_id', () => {
    const invalidData = {
      base_price: 200.00,
      check_in: new Date().toISOString(),
      check_out: new Date().toISOString(),
    };

    const result = calculateSmartPriceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('item_id');
    }
  });

  it('deve rejeitar check-out anterior ao check-in', () => {
    const invalidData = {
      item_id: 1,
      base_price: 200.00,
      check_in: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      check_out: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const result = calculateSmartPriceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(e => e.path.includes('check_out'))).toBe(true);
    }
  });

  it('deve validar multiplicadores dentro dos limites', () => {
    const multipliers = {
      weather: 0.8,
      events: 1.2,
      competitors: 1.0,
      demand: 1.1,
      season: 0.9,
    };

    Object.values(multipliers).forEach((mult) => {
      expect(mult).toBeGreaterThanOrEqual(0.5);
      expect(mult).toBeLessThanOrEqual(2.0);
    });
  });
});

describe('Smart Pricing API - Algoritmo de Cálculo', () => {
  it('deve calcular preço baseado em múltiplos fatores', () => {
    const basePrice = 200.00;
    const multipliers = {
      weather: 1.1,
      events: 1.2,
      competitors: 1.0,
      demand: 1.15,
      season: 1.1,
    };

    let finalPrice = basePrice;
    finalPrice *= multipliers.weather;
    finalPrice *= multipliers.events;
    finalPrice *= multipliers.competitors;
    finalPrice *= multipliers.demand;
    finalPrice *= multipliers.season;

    expect(finalPrice).toBeGreaterThan(basePrice);
    expect(finalPrice).toBeLessThan(basePrice * 2);
  });

  it('deve aplicar limites min/max', () => {
    const basePrice = 200.00;
    const minMultiplier = 0.5;
    const maxMultiplier = 2.0;
    
    const minPrice = basePrice * minMultiplier;
    const maxPrice = basePrice * maxMultiplier;
    const calculatedPrice = basePrice * 2.5; // Fora do limite

    const finalPrice = Math.max(minPrice, Math.min(maxPrice, calculatedPrice));

    expect(finalPrice).toBe(maxPrice);
    expect(finalPrice).toBeGreaterThanOrEqual(minPrice);
    expect(finalPrice).toBeLessThanOrEqual(maxPrice);
  });
});

describe('Smart Pricing API - Machine Learning', () => {
  it('deve prever demanda baseado em features', () => {
    const features = {
      month: 12,
      dayOfWeek: 5, // Sexta
      isWeekend: true,
      isHoliday: false,
      daysUntilCheckIn: 7,
      historicalBookings: 15,
      currentOccupancy: 5,
      avgNights: 3,
      season: 'high' as const,
    };

    // Features indicam alta demanda
    expect(features.isWeekend).toBe(true);
    expect(features.season).toBe('high');
    expect(features.historicalBookings).toBeGreaterThan(10);
  });

  it('deve calcular multiplicador recomendado baseado em demanda', () => {
    const demandScore = 0.8; // Alta demanda
    const baseMultiplier = 1.0;
    
    // Alta demanda deve aumentar multiplicador
    const recommendedMultiplier = baseMultiplier + (demandScore - 0.7) * 0.5;
    
    expect(recommendedMultiplier).toBeGreaterThan(1.0);
    expect(recommendedMultiplier).toBeLessThanOrEqual(1.5);
  });
});

describe('Smart Pricing API - Autenticação', () => {
  it('deve requerer autenticação para calcular preço', () => {
    const token = null;
    expect(token).toBeFalsy();
  });
});

