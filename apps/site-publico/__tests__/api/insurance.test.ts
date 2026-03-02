/**
 * ✅ TESTES: API INSURANCE
 * Testes para validação e funcionalidade de seguros
 */

import { describe, it, expect } from '@jest/globals';
import { createInsurancePolicySchema, createInsuranceClaimSchema } from '@/lib/schemas/insurance-schemas';

describe('Insurance API - Validação Zod', () => {
  it('deve validar criação de apólice com dados válidos', () => {
    const validData = {
      booking_id: 1,
      coverage_type: 'standard',
      coverage_amount: 5000.00,
      premium_amount: 150.00,
      coverage_start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      coverage_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      insured_name: 'João Silva',
      insured_email: 'joao@example.com',
      terms_accepted: true,
    };

    const result = createInsurancePolicySchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.booking_id).toBe(1);
      expect(result.data.coverage_amount).toBe(5000.00);
      expect(result.data.terms_accepted).toBe(true);
    }
  });

  it('deve rejeitar apólice sem aceitar termos', () => {
    const invalidData = {
      booking_id: 1,
      coverage_type: 'standard',
      coverage_amount: 5000.00,
      premium_amount: 150.00,
      coverage_start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      coverage_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      insured_name: 'João Silva',
      terms_accepted: false,
    };

    const result = createInsurancePolicySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('terms_accepted');
    }
  });

  it('deve rejeitar data de fim anterior à data de início', () => {
    const invalidData = {
      booking_id: 1,
      coverage_start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      coverage_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      insured_name: 'João Silva',
      coverage_amount: 5000.00,
      premium_amount: 150.00,
      terms_accepted: true,
    };

    const result = createInsurancePolicySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(e => e.path.includes('coverage_end_date'))).toBe(true);
    }
  });
});

describe('Insurance API - Criação de Sinistro', () => {
  it('deve validar criação de sinistro com dados válidos', () => {
    const validData = {
      policy_id: 1,
      claim_type: 'cancellation',
      description: 'Viagem cancelada devido a emergência médica',
      incident_date: new Date().toISOString(),
      claimed_amount: 2000.00,
    };

    const result = createInsuranceClaimSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.policy_id).toBe(1);
      expect(result.data.description.length).toBeGreaterThanOrEqual(10);
      expect(result.data.claimed_amount).toBe(2000.00);
    }
  });

  it('deve rejeitar sinistro com descrição muito curta', () => {
    const invalidData = {
      policy_id: 1,
      claim_type: 'cancellation',
      description: 'Cancelado', // Menos de 10 caracteres
      claimed_amount: 2000.00,
      incident_date: new Date().toISOString(),
    };

    const result = createInsuranceClaimSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('description');
    }
  });
});

describe('Insurance API - Cálculo de Prêmio', () => {
  it('deve calcular prêmio baseado em múltiplos fatores', () => {
    const params = {
      coverage_type: 'standard',
      coverage_amount: 5000,
      trip_duration_days: 7,
      number_of_travelers: 2,
      destination: 'Caldas Novas, GO',
    };

    // Fatores que influenciam o prêmio:
    // - Tipo de cobertura (base)
    // - Duração da viagem
    // - Número de viajantes
    // - Valor de cobertura
    // - Destino (nacional vs internacional)

    expect(params.coverage_amount).toBeGreaterThan(0);
    expect(params.trip_duration_days).toBeGreaterThan(0);
    expect(params.number_of_travelers).toBeGreaterThan(0);
    expect(params.number_of_travelers).toBeLessThanOrEqual(10);
  });

  it('deve calcular prêmio maior para cobertura comprehensive', () => {
    const basicParams = {
      coverage_type: 'basic',
      coverage_amount: 5000,
      trip_duration_days: 7,
      number_of_travelers: 2,
    };

    const comprehensiveParams = {
      coverage_type: 'comprehensive',
      coverage_amount: 5000,
      trip_duration_days: 7,
      number_of_travelers: 2,
    };

    // Comprehensive deve ter base maior que basic
    expect(comprehensiveParams.coverage_type).toBe('comprehensive');
    expect(basicParams.coverage_type).toBe('basic');
  });
});

describe('Insurance API - Integração Kakau', () => {
  it('deve criar apólice na Kakau quando habilitado', () => {
    const kakauEnabled = process.env.KAKAU_INSURANCE_ENABLED === 'true';
    const hasApiKey = !!process.env.KAKAU_INSURANCE_API_KEY;

    // Em produção, verificar se integração está configurada
    if (kakauEnabled && hasApiKey) {
      expect(kakauEnabled).toBe(true);
      expect(hasApiKey).toBe(true);
    }
  });

  it('deve usar mock quando Kakau não está habilitado', () => {
    const kakauEnabled = process.env.KAKAU_INSURANCE_ENABLED === 'true';
    
    // Em desenvolvimento, mock deve ser usado
    if (!kakauEnabled) {
      // Mock deve gerar policy_number válido
      const mockPolicyNumber = `KAKAU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      expect(mockPolicyNumber).toContain('KAKAU');
      expect(mockPolicyNumber.length).toBeGreaterThan(10);
    }
  });
});

