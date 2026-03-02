/**
 * ✅ SCHEMAS ZOD PARA INSURANCE
 * Validação robusta com Zod para todas as operações de seguros
 */

import { z } from 'zod';

// Schema para criar apólice de seguro
export const createInsurancePolicySchema = z.object({
  booking_id: z.number().int().positive('ID da reserva é obrigatório'),
  insurance_provider: z.string().max(100).default('rsv360'),
  coverage_type: z.enum(['basic', 'standard', 'premium', 'comprehensive']).default('standard'),
  coverage_amount: z.number()
    .positive('Valor de cobertura deve ser positivo')
    .refine((val) => val > 0, {
      message: 'Valor de cobertura deve ser maior que zero',
    }),
  premium_amount: z.number()
    .positive('Valor do prêmio deve ser positivo')
    .refine((val) => val > 0, {
      message: 'Valor do prêmio deve ser maior que zero',
    }),
  deductible: z.number().min(0).default(0),
  coverage_start_date: z.string()
    .datetime('Data de início inválida')
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val),
  coverage_end_date: z.string()
    .datetime('Data de fim inválida')
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val),
  insured_name: z.string().min(1, 'Nome do segurado é obrigatório').max(255),
  insured_document: z.string().max(50).optional(),
  insured_email: z.string().email('Email inválido').optional(),
  insured_phone: z.string().max(20).optional(),
  policy_details: z.record(z.any()).optional(),
  terms_accepted: z.boolean().default(false),
}).refine(
  (data) => {
    const start = typeof data.coverage_start_date === 'string' ? new Date(data.coverage_start_date) : data.coverage_start_date;
    const end = typeof data.coverage_end_date === 'string' ? new Date(data.coverage_end_date) : data.coverage_end_date;
    return end > start;
  },
  {
    message: 'Data de fim da cobertura deve ser posterior à data de início',
    path: ['coverage_end_date'],
  }
).refine(
  (data) => data.terms_accepted === true,
  {
    message: 'Termos e condições devem ser aceitos',
    path: ['terms_accepted'],
  }
);

// Schema para criar sinistro
export const createInsuranceClaimSchema = z.object({
  policy_id: z.number().int().positive('ID da apólice é obrigatório'),
  claim_type: z.enum([
    'cancellation',
    'medical',
    'baggage',
    'trip_delay',
    'accident',
    'other',
  ]),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(5000),
  incident_date: z.string()
    .datetime('Data do incidente inválida')
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .refine((date) => date <= new Date(), {
      message: 'Data do incidente não pode ser no futuro',
    }),
  incident_location: z.string().max(255).optional(),
  claimed_amount: z.number()
    .positive('Valor reclamado deve ser positivo')
    .refine((val) => val > 0, {
      message: 'Valor reclamado deve ser maior que zero',
    }),
  documents: z.array(z.string().url('URL de documento inválida')).optional(),
  evidence_files: z.array(z.string().url('URL de arquivo de evidência inválida')).optional(),
  metadata: z.record(z.any()).optional(),
});

// Schema para atualizar status de sinistro
export const updateClaimStatusSchema = z.object({
  status: z.enum([
    'pending',
    'under_review',
    'approved',
    'rejected',
    'paid',
    'closed',
  ]),
  review_notes: z.string().max(2000).optional(),
  approved_amount: z.number().positive().optional(),
  rejected_amount: z.number().positive().optional(),
  rejection_reason: z.string().max(1000).optional(),
}).refine(
  (data) => {
    if (data.status === 'approved' && !data.approved_amount) {
      return false;
    }
    if (data.status === 'rejected' && !data.rejection_reason) {
      return false;
    }
    return true;
  },
  {
    message: 'approved_amount é obrigatório para aprovação, rejection_reason é obrigatório para rejeição',
    path: ['approved_amount', 'rejection_reason'],
  }
);

// Schema para calcular prêmio
export const calculatePremiumSchema = z.object({
  booking_id: z.number().int().positive('ID da reserva é obrigatório'),
  coverage_type: z.enum(['basic', 'standard', 'premium', 'comprehensive']),
  coverage_amount: z.number().positive('Valor de cobertura deve ser positivo'),
  trip_duration_days: z.number().int().positive('Duração da viagem deve ser positiva'),
  number_of_travelers: z.number().int().positive('Número de viajantes deve ser positivo').max(10),
  destination: z.string().max(255).optional(),
  age_of_travelers: z.array(z.number().int().min(0).max(120)).optional(),
});

// Schema para query params de apólices
export const getInsurancePoliciesQuerySchema = z.object({
  status: z.enum(['active', 'expired', 'cancelled', 'claimed']).optional(),
  booking_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  limit: z.string().transform((val) => val ? parseInt(val, 10) : 50).optional(),
  offset: z.string().transform((val) => val ? parseInt(val, 10) : 0).optional(),
});

// Schema para query params de sinistros
export const getInsuranceClaimsQuerySchema = z.object({
  policy_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  status: z.enum(['pending', 'under_review', 'approved', 'rejected', 'paid', 'closed']).optional(),
  limit: z.string().transform((val) => val ? parseInt(val, 10) : 50).optional(),
  offset: z.string().transform((val) => val ? parseInt(val, 10) : 0).optional(),
});

