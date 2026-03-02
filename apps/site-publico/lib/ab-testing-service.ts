/**
 * ✅ TAREFA HIGH-2: Sistema de A/B Testing de Precificação
 * Gerencia experimentos A/B para validar estratégias de precificação
 */

import { queryDatabase } from './db';

export interface ABExperiment {
  id?: number;
  name: string;
  description?: string;
  property_id?: number;
  start_date: Date;
  end_date: Date;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  traffic_split: number; // % de tráfego para variante B
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
}

export interface ABVariant {
  id?: number;
  experiment_id: number;
  variant_name: 'control' | 'treatment';
  pricing_strategy: any; // JSONB com configuração de precificação
  traffic_percentage: number;
  created_at?: Date;
}

export interface ABParticipant {
  id?: number;
  experiment_id: number;
  variant_id: number;
  user_id: number;
  booking_id?: number;
  assigned_at?: Date;
}

export interface ABMetrics {
  id?: number;
  experiment_id: number;
  variant_id: number;
  metric_date: Date;
  impressions: number;
  clicks: number;
  bookings: number;
  revenue: number;
  conversion_rate: number;
  avg_price: number;
  created_at?: Date;
}

/**
 * Criar novo experimento A/B
 */
export async function createABExperiment(
  experiment: Omit<ABExperiment, 'id' | 'created_at' | 'updated_at'>
): Promise<ABExperiment> {
  const result = await queryDatabase(
    `INSERT INTO pricing_ab_experiments 
     (name, description, property_id, start_date, end_date, status, traffic_split, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      experiment.name,
      experiment.description || null,
      experiment.property_id || null,
      experiment.start_date.toISOString(),
      experiment.end_date.toISOString(),
      experiment.status,
      experiment.traffic_split,
      experiment.created_by || null,
    ]
  );

  return result[0] as ABExperiment;
}

/**
 * Adicionar variante ao experimento
 */
export async function addABVariant(
  variant: Omit<ABVariant, 'id' | 'created_at'>
): Promise<ABVariant> {
  const result = await queryDatabase(
    `INSERT INTO pricing_ab_variants 
     (experiment_id, variant_name, pricing_strategy, traffic_percentage)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      variant.experiment_id,
      variant.variant_name,
      JSON.stringify(variant.pricing_strategy),
      variant.traffic_percentage,
    ]
  );

  return result[0] as ABVariant;
}

/**
 * Atribuir usuário a uma variante
 */
export async function assignParticipant(
  experimentId: number,
  userId: number
): Promise<ABParticipant> {
  // Verificar se já está atribuído
  const existing = await queryDatabase(
    `SELECT * FROM pricing_ab_participants 
     WHERE experiment_id = $1 AND user_id = $2`,
    [experimentId, userId]
  );

  if (existing.length > 0) {
    return existing[0] as ABParticipant;
  }

  // Buscar variantes do experimento
  const variants = await queryDatabase(
    `SELECT * FROM pricing_ab_variants 
     WHERE experiment_id = $1 
     ORDER BY variant_name`,
    [experimentId]
  );

  if (variants.length < 2) {
    throw new Error('Experimento deve ter pelo menos 2 variantes');
  }

  // Atribuir baseado em hash do userId (garante consistência)
  const hash = userId % 100;
  const control = variants.find((v: any) => v.variant_name === 'control');
  const treatment = variants.find((v: any) => v.variant_name === 'treatment');

  if (!control || !treatment) {
    throw new Error('Experimento deve ter variantes control e treatment');
  }

  const selectedVariant = hash < (control.traffic_percentage || 50) ? control : treatment;

  const result = await queryDatabase(
    `INSERT INTO pricing_ab_participants 
     (experiment_id, variant_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [experimentId, selectedVariant.id, userId]
  );

  return result[0] as ABParticipant;
}

/**
 * Registrar métrica do experimento
 */
export async function recordABMetric(
  metric: Omit<ABMetrics, 'id' | 'created_at'>
): Promise<ABMetrics> {
  const result = await queryDatabase(
    `INSERT INTO pricing_ab_metrics 
     (experiment_id, variant_id, metric_date, impressions, clicks, bookings, revenue, conversion_rate, avg_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (experiment_id, variant_id, metric_date) 
     DO UPDATE SET
       impressions = pricing_ab_metrics.impressions + EXCLUDED.impressions,
       clicks = pricing_ab_metrics.clicks + EXCLUDED.clicks,
       bookings = pricing_ab_metrics.bookings + EXCLUDED.bookings,
       revenue = pricing_ab_metrics.revenue + EXCLUDED.revenue,
       conversion_rate = CASE 
         WHEN pricing_ab_metrics.clicks + EXCLUDED.clicks > 0 
         THEN ((pricing_ab_metrics.bookings + EXCLUDED.bookings)::DECIMAL / 
               (pricing_ab_metrics.clicks + EXCLUDED.clicks)::DECIMAL * 100)
         ELSE 0 
       END,
       avg_price = CASE 
         WHEN pricing_ab_metrics.bookings + EXCLUDED.bookings > 0 
         THEN ((pricing_ab_metrics.revenue + EXCLUDED.revenue) / 
               (pricing_ab_metrics.bookings + EXCLUDED.bookings))
         ELSE 0 
       END
     RETURNING *`,
    [
      metric.experiment_id,
      metric.variant_id,
      metric.metric_date.toISOString().split('T')[0],
      metric.impressions,
      metric.clicks,
      metric.bookings,
      metric.revenue,
      metric.conversion_rate,
      metric.avg_price,
    ]
  );

  return result[0] as ABMetrics;
}

/**
 * Obter resultados do experimento
 */
export async function getABExperimentResults(
  experimentId: number
): Promise<{
  experiment: ABExperiment;
  variants: Array<ABVariant & { metrics: ABMetrics[] }>;
  summary: {
    total_impressions: number;
    total_clicks: number;
    total_bookings: number;
    total_revenue: number;
    control_conversion: number;
    treatment_conversion: number;
    lift: number; // % de melhoria da treatment vs control
  };
}> {
  const experiment = await queryDatabase(
    `SELECT * FROM pricing_ab_experiments WHERE id = $1`,
    [experimentId]
  );

  if (experiment.length === 0) {
    throw new Error('Experimento não encontrado');
  }

  const variants = await queryDatabase(
    `SELECT * FROM pricing_ab_variants WHERE experiment_id = $1`,
    [experimentId]
  );

  const metrics = await queryDatabase(
    `SELECT * FROM pricing_ab_metrics 
     WHERE experiment_id = $1 
     ORDER BY variant_id, metric_date`,
    [experimentId]
  );

  // Agrupar métricas por variante
  const variantsWithMetrics = variants.map((variant: any) => ({
    ...variant,
    metrics: metrics.filter((m: any) => m.variant_id === variant.id),
  }));

  // Calcular resumo
  const controlMetrics = metrics.filter(
    (m: any) => variants.find((v: any) => v.id === m.variant_id)?.variant_name === 'control'
  );
  const treatmentMetrics = metrics.filter(
    (m: any) => variants.find((v: any) => v.id === m.variant_id)?.variant_name === 'treatment'
  );

  const controlTotal = {
    impressions: controlMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
    clicks: controlMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
    bookings: controlMetrics.reduce((sum, m) => sum + (m.bookings || 0), 0),
    revenue: controlMetrics.reduce((sum, m) => sum + parseFloat(m.revenue || 0), 0),
  };

  const treatmentTotal = {
    impressions: treatmentMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
    clicks: treatmentMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
    bookings: treatmentMetrics.reduce((sum, m) => sum + (m.bookings || 0), 0),
    revenue: treatmentMetrics.reduce((sum, m) => sum + parseFloat(m.revenue || 0), 0),
  };

  const controlConversion =
    controlTotal.clicks > 0 ? (controlTotal.bookings / controlTotal.clicks) * 100 : 0;
  const treatmentConversion =
    treatmentTotal.clicks > 0 ? (treatmentTotal.bookings / treatmentTotal.clicks) * 100 : 0;

  const lift = controlConversion > 0 
    ? ((treatmentConversion - controlConversion) / controlConversion) * 100 
    : 0;

  return {
    experiment: experiment[0] as ABExperiment,
    variants: variantsWithMetrics as Array<ABVariant & { metrics: ABMetrics[] }>,
    summary: {
      total_impressions: controlTotal.impressions + treatmentTotal.impressions,
      total_clicks: controlTotal.clicks + treatmentTotal.clicks,
      total_bookings: controlTotal.bookings + treatmentTotal.bookings,
      total_revenue: controlTotal.revenue + treatmentTotal.revenue,
      control_conversion: controlConversion,
      treatment_conversion: treatmentConversion,
      lift,
    },
  };
}

/**
 * Listar experimentos ativos
 */
export async function listActiveABExperiments(
  propertyId?: number
): Promise<ABExperiment[]> {
  let query = `SELECT * FROM pricing_ab_experiments 
               WHERE status = 'running' 
               AND start_date <= CURRENT_TIMESTAMP 
               AND end_date >= CURRENT_TIMESTAMP`;
  const params: any[] = [];

  if (propertyId) {
    query += ` AND property_id = $1`;
    params.push(propertyId);
  }

  query += ` ORDER BY created_at DESC`;

  return await queryDatabase(query, params) as ABExperiment[];
}

