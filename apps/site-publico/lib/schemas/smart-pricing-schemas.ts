/**
 * ✅ SCHEMAS ZOD PARA SMART PRICING
 * Validação robusta com Zod para todas as operações de smart pricing
 */

import { z } from 'zod';

// Schema para calcular preço inteligente
export const calculateSmartPriceSchema = z.object({
  item_id: z.number().int().positive('ID do item é obrigatório'),
  base_price: z.number()
    .positive('Preço base deve ser positivo')
    .refine((val) => val > 0, {
      message: 'Preço base deve ser maior que zero',
    }),
  check_in: z.string()
    .datetime('Data de check-in inválida')
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Data de check-in deve ser hoje ou no futuro',
    }),
  check_out: z.string()
    .datetime('Data de check-out inválida')
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .refine((date) => date > new Date(), {
      message: 'Data de check-out deve ser no futuro',
    }),
  location: z.string().max(255).optional().nullable(),
  latitude: z.number()
    .min(-90, 'Latitude deve estar entre -90 e 90')
    .max(90, 'Latitude deve estar entre -90 e 90')
    .optional()
    .nullable(),
  longitude: z.number()
    .min(-180, 'Longitude deve estar entre -180 e 180')
    .max(180, 'Longitude deve estar entre -180 e 180')
    .optional()
    .nullable(),
}).refine(
  (data) => {
    const checkIn = typeof data.check_in === 'string' ? new Date(data.check_in) : data.check_in;
    const checkOut = typeof data.check_out === 'string' ? new Date(data.check_out) : data.check_out;
    return checkOut > checkIn;
  },
  {
    message: 'Data de check-out deve ser posterior à data de check-in',
    path: ['check_out'],
  }
);

// Schema para configuração de precificação dinâmica
export const updatePricingConfigSchema = z.object({
  item_id: z.number().int().positive('ID do item é obrigatório'),
  min_price_multiplier: z.number()
    .min(0.1, 'Multiplicador mínimo deve ser pelo menos 0.1')
    .max(1.0, 'Multiplicador mínimo não pode ser maior que 1.0')
    .optional(),
  max_price_multiplier: z.number()
    .min(1.0, 'Multiplicador máximo deve ser pelo menos 1.0')
    .max(5.0, 'Multiplicador máximo não pode ser maior que 5.0')
    .optional(),
  weather_impact: z.boolean().optional(),
  weather_multiplier: z.number().min(0.1).max(2.0).optional(),
  event_impact: z.boolean().optional(),
  event_multiplier: z.number().min(0.1).max(2.0).optional(),
  competitor_impact: z.boolean().optional(),
  competitor_multiplier: z.number().min(0.1).max(2.0).optional(),
  season_multiplier: z.number().min(0.1).max(2.0).optional(),
  demand_impact: z.boolean().optional(),
  demand_multiplier: z.number().min(0.1).max(2.0).optional(),
}).refine(
  (data) => {
    if (data.min_price_multiplier && data.max_price_multiplier) {
      return data.max_price_multiplier >= data.min_price_multiplier;
    }
    return true;
  },
  {
    message: 'Multiplicador máximo deve ser maior ou igual ao mínimo',
    path: ['max_price_multiplier'],
  }
);

// Schema para simulação de preços
export const simulatePriceSchema = z.object({
  item_id: z.number().int().positive('ID do item é obrigatório'),
  base_price: z.number().positive('Preço base deve ser positivo'),
  dates: z.array(z.object({
    check_in: z.string().datetime().or(z.date()),
    check_out: z.string().datetime().or(z.date()),
  })).min(1, 'Deve haver pelo menos uma data para simular'),
  location: z.string().max(255).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

// Schema para query params de histórico
export const getPricingHistoryQuerySchema = z.object({
  item_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.string().transform((val) => val ? parseInt(val, 10) : 100).optional(),
  action: z.enum(['history', 'trends']).optional(),
}).refine(
  (data) => data.item_id || data.action === 'trends',
  {
    message: 'item_id é obrigatório para histórico',
    path: ['item_id'],
  }
);

