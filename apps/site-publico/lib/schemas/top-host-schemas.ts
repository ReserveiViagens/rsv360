/**
 * ✅ SCHEMAS ZOD PARA TOP HOST / QUALITY
 * Validação robusta com Zod para todas as operações de qualidade
 */

import { z } from 'zod';

// Schema para atualizar rating de host
export const updateHostRatingSchema = z.object({
  host_id: z.number().int().positive('ID do host é obrigatório'),
  rating_type: z.enum([
    'response_time',
    'cleanliness',
    'communication',
    'accuracy',
    'check_in',
    'value',
    'overall',
  ]),
  rating_value: z
    .number()
    .min(0, 'Rating deve ser no mínimo 0')
    .max(5, 'Rating deve ser no máximo 5'),
  item_id: z.number().int().positive('ID do item inválido').optional(),
});

// Schema para atribuir badge
export const assignBadgeSchema = z.object({
  host_id: z.number().int().positive('ID do host é obrigatório'),
  badge_id: z.number().int().positive('ID do badge é obrigatório'),
  item_id: z.number().int().positive('ID do item inválido').optional(),
  expires_at: z.string().datetime().optional().nullable(),
});

// Schema para criar badge
export const createBadgeSchema = z.object({
  badge_key: z.string().min(1, 'Chave do badge é obrigatória'),
  badge_name: z.string().min(1, 'Nome do badge é obrigatório'),
  badge_description: z.string().optional(),
  badge_icon: z.string().optional(),
  badge_category: z.enum(['quality', 'performance', 'achievement', 'special']),
  criteria: z.record(z.any()), // JSONB
  is_active: z.boolean().default(true),
});

// Schema para registrar métrica de qualidade
export const recordQualityMetricSchema = z.object({
  host_id: z.number().int().positive('ID do host é obrigatório'),
  metric_type: z.enum([
    'response_rate',
    'response_time',
    'cancellation_rate',
    'occupancy_rate',
    'revenue',
    'guest_satisfaction',
  ]),
  metric_value: z.number(),
  metric_unit: z.string().optional(),
  period_start: z.string().datetime().or(z.date()),
  period_end: z.string().datetime().or(z.date()),
  item_id: z.number().int().positive('ID do item inválido').optional(),
}).refine(
  (data) => {
    const start = typeof data.period_start === 'string' ? new Date(data.period_start) : data.period_start;
    const end = typeof data.period_end === 'string' ? new Date(data.period_end) : data.period_end;
    return end > start;
  },
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['period_end'],
  }
);

// Schema para query params de leaderboard
export const getLeaderboardQuerySchema = z.object({
  limit: z.string().transform((val) => (val ? parseInt(val, 10) : 50)).optional(),
  min_bookings: z.string().transform((val) => (val ? parseInt(val, 10) : 5)).optional(),
  min_score: z.string().transform((val) => (val ? parseFloat(val) : 0)).optional(),
  category: z.enum(['overall', 'quality', 'performance', 'guest_satisfaction']).optional(),
});

// Schema para query params de métricas
export const getQualityMetricsQuerySchema = z.object({
  host_id: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
  item_id: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
  metric_type: z.enum([
    'response_rate',
    'response_time',
    'cancellation_rate',
    'occupancy_rate',
    'revenue',
    'guest_satisfaction',
  ]).optional(),
  limit: z.string().transform((val) => (val ? parseInt(val, 10) : 100)).optional(),
});

// Schema para query params de badges
export const getHostBadgesQuerySchema = z.object({
  host_id: z.string().transform((val) => parseInt(val, 10)).optional(),
  item_id: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
  active_only: z.string().transform((val) => val === 'true').optional(),
});


