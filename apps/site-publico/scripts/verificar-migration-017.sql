-- ✅ SCRIPT DE VERIFICAÇÃO - MIGRATION 017
-- Verificar se todas as tabelas, triggers e funções foram criadas corretamente

-- ============================================
-- VERIFICAÇÃO DE TABELAS
-- ============================================

SELECT 
    'Tabelas criadas' as tipo,
    COUNT(*) as quantidade
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'pricing_factors',
        'smart_pricing_config',
        'host_incentives',
        'badge_assignment_history',
        'shared_wishlists',
        'wishlist_members',
        'wishlist_items',
        'wishlist_votes',
        'pricing_history',
        'weather_cache',
        'local_events',
        'competitor_prices',
        'dynamic_pricing_config',
        'host_ratings',
        'host_badges',
        'host_badge_assignments',
        'quality_metrics',
        'host_scores'
    );

-- ============================================
-- VERIFICAÇÃO DE TRIGGERS
-- ============================================

SELECT 
    'Triggers criados' as tipo,
    COUNT(*) as quantidade
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name IN (
        'trigger_update_vote_counts',
        'trigger_update_smart_pricing_config_timestamp',
        'trigger_update_pricing_config_timestamp',
        'trigger_update_local_events_timestamp',
        'trigger_update_host_ratings_timestamp'
    );

-- ============================================
-- VERIFICAÇÃO DE FUNÇÕES
-- ============================================

SELECT 
    'Funções criadas' as tipo,
    COUNT(*) as quantidade
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'update_wishlist_item_votes',
        'calculate_host_score',
        'check_badge_eligibility',
        'update_smart_pricing_config_timestamp',
        'update_pricing_config_timestamp',
        'update_host_ratings_timestamp'
    );

-- ============================================
-- VERIFICAÇÃO DE ÍNDICES
-- ============================================

SELECT 
    'Índices criados' as tipo,
    COUNT(*) as quantidade
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
    AND (
        indexname LIKE 'idx_pricing_%' OR
        indexname LIKE 'idx_host_%' OR
        indexname LIKE 'idx_wishlist_%' OR
        indexname LIKE 'idx_badge_%' OR
        indexname LIKE 'idx_quality_%' OR
        indexname LIKE 'idx_competitor_%'
    );

-- ============================================
-- LISTAR TODAS AS TABELAS DO RSV GEN 2
-- ============================================

SELECT 
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name 
       AND table_schema = 'public') as colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_name IN (
        'pricing_factors',
        'smart_pricing_config',
        'host_incentives',
        'badge_assignment_history',
        'shared_wishlists',
        'wishlist_members',
        'wishlist_items',
        'wishlist_votes',
        'pricing_history',
        'weather_cache',
        'local_events',
        'competitor_prices',
        'dynamic_pricing_config',
        'host_ratings',
        'host_badges',
        'host_badge_assignments',
        'quality_metrics',
        'host_scores'
    )
ORDER BY table_name;

-- ============================================
-- TESTE DE TRIGGER DE VOTOS
-- ============================================

-- Verificar se trigger está funcionando
-- (Execute manualmente após inserir um voto de teste)

SELECT 
    'Teste de Trigger' as teste,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_update_vote_counts'
        ) THEN '✅ Trigger existe'
        ELSE '❌ Trigger não encontrado'
    END as status;

