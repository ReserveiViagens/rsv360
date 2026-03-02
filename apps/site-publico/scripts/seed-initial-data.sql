-- ============================================
-- SEED DE DADOS INICIAIS
-- ============================================
-- Descrição: Dados iniciais para desenvolvimento e testes
-- Data: 2025-12-13
-- Autor: RSV 360 Team
-- ============================================

BEGIN;

-- ============================================
-- PROGRAMAS DE INCENTIVO INICIAIS
-- ============================================

INSERT INTO incentive_programs (
  program_key,
  program_name,
  program_description,
  program_type,
  criteria,
  reward,
  priority,
  auto_apply,
  is_active,
  starts_at,
  ends_at
) VALUES 
(
  'welcome_bonus_2025',
  'Bônus de Boas-Vindas 2025',
  'Receba 100 pontos ao cadastrar sua primeira propriedade',
  'milestone',
  '{"min_properties": 1}'::jsonb,
  '{"type": "points", "value": 100, "expires_in_days": 365}'::jsonb,
  100,
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '1 year'
),
(
  'superhost_Q1_2025',
  'Programa Superhost Q1 2025',
  'Hosts de excelência recebem 500 pontos + 10% desconto em taxas',
  'performance',
  '{"min_score": 90, "min_rating": 4.8, "min_bookings": 10, "max_cancellation_rate": 5}'::jsonb,
  '{"type": "points", "value": 500, "discount_percent": 10, "badge": "superhost"}'::jsonb,
  90,
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '3 months'
),
(
  'fast_response_2025',
  'Resposta Rápida',
  'Responda em até 1 hora e ganhe pontos extras',
  'performance',
  '{"min_response_rate": 95, "max_response_time_minutes": 60}'::jsonb,
  '{"type": "points", "value": 50, "expires_in_days": 180}'::jsonb,
  70,
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '1 year'
),
(
  'property_verification_bonus',
  'Bônus de Verificação',
  'Ganhe 200 pontos ao verificar sua propriedade',
  'milestone',
  '{"verification_status": "approved"}'::jsonb,
  '{"type": "points", "value": 200, "expires_in_days": 365}'::jsonb,
  80,
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP,
  NULL
),
(
  'perfect_rating_month',
  'Mês Perfeito',
  'Mantenha 5 estrelas por um mês e ganhe 300 pontos',
  'performance',
  '{"min_rating": 5.0, "min_reviews": 5, "period_days": 30}'::jsonb,
  '{"type": "points", "value": 300, "expires_in_days": 180}'::jsonb,
  85,
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '1 year'
)
ON CONFLICT (program_key) DO UPDATE SET
  program_name = EXCLUDED.program_name,
  program_description = EXCLUDED.program_description,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- CONFIGURAÇÕES DE SMART PRICING PADRÃO
-- ============================================

-- Inserir configurações padrão para propriedades existentes
-- (apenas se a tabela smart_pricing_config existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'smart_pricing_config') THEN
    INSERT INTO smart_pricing_config (
      property_id,
      min_price_multiplier,
      max_price_multiplier,
      enable_weather_factor,
      enable_events_factor,
      enable_competitor_factor,
      enable_demand_factor,
      created_at,
      updated_at
    )
    SELECT 
      id,
      0.7,
      2.0,
      TRUE,
      TRUE,
      TRUE,
      TRUE,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM properties
    WHERE id NOT IN (SELECT property_id FROM smart_pricing_config)
    LIMIT 100
    ON CONFLICT (property_id) DO NOTHING;
    
    RAISE NOTICE 'Configurações de smart pricing inseridas para % propriedades', 
      (SELECT COUNT(*) FROM smart_pricing_config);
  ELSE
    RAISE NOTICE 'Tabela smart_pricing_config não existe. Pulando inserção.';
  END IF;
END $$;

-- ============================================
-- PONTOS INICIAIS PARA HOSTS DE TESTE
-- ============================================

-- Inserir pontos iniciais para hosts existentes (apenas se a tabela host_points existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'host_points') THEN
    -- Adicionar pontos de boas-vindas para hosts sem pontos
    INSERT INTO host_points (
      host_id,
      points,
      points_type,
      points_source,
      description,
      expires_at,
      created_at
    )
    SELECT 
      u.id,
      100,
      'earned',
      'welcome_bonus',
      'Pontos de boas-vindas',
      CURRENT_TIMESTAMP + INTERVAL '1 year',
      CURRENT_TIMESTAMP
    FROM users u
    WHERE u.role = 'host'
      AND u.id NOT IN (SELECT DISTINCT host_id FROM host_points)
      AND u.id IN (SELECT DISTINCT host_id FROM properties LIMIT 10)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Pontos iniciais inseridos para hosts';
  ELSE
    RAISE NOTICE 'Tabela host_points não existe. Pulando inserção.';
  END IF;
END $$;

-- ============================================
-- VALIDAÇÃO DOS DADOS INSERIDOS
-- ============================================

-- Verificar programas inseridos
DO $$
DECLARE
  program_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'incentive_programs') THEN
    SELECT COUNT(*) INTO program_count FROM incentive_programs WHERE is_active = TRUE;
    RAISE NOTICE 'Programas de incentivo ativos: %', program_count;
  END IF;
END $$;

COMMIT;

-- ============================================
-- MENSAGEM FINAL
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Seed de dados iniciais concluído com sucesso!';
  RAISE NOTICE '   - Programas de incentivo inseridos';
  RAISE NOTICE '   - Configurações de smart pricing aplicadas';
  RAISE NOTICE '   - Pontos iniciais distribuídos';
END $$;

