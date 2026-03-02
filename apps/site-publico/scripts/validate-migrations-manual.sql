-- ============================================
-- SCRIPT DE VALIDAÇÃO MANUAL DAS MIGRATIONS
-- ============================================
-- Execute este script após executar as migrations 018 e 019
-- para validar que todos os objetos foram criados corretamente

-- 1. Verificar tabelas criadas
SELECT 
    'Tabelas' as tipo,
    table_name as nome,
    'OK' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('host_points', 'incentive_programs', 'host_program_enrollments')
ORDER BY table_name;

-- 2. Verificar ENUMs criados
SELECT 
    'ENUMs' as tipo,
    t.typname as nome,
    'OK' as status
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('points_type_enum', 'points_source_enum', 'program_type_enum')
GROUP BY t.typname
ORDER BY t.typname;

-- 3. Verificar funções criadas
SELECT 
    'Funções' as tipo,
    routine_name as nome,
    'OK' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%host_points%' 
    OR routine_name LIKE '%program%'
    OR routine_name IN (
      'calculate_host_total_points',
      'calculate_host_available_points',
      'expire_host_points',
      'add_host_points',
      'spend_host_points',
      'get_host_points_history',
      'check_program_eligibility',
      'get_eligible_programs',
      'apply_program_reward'
    )
  )
ORDER BY routine_name;

-- 4. Verificar views criadas
SELECT 
    'Views' as tipo,
    table_name as nome,
    'OK' as status
FROM information_schema.views 
WHERE table_schema = 'public'
  AND table_name IN ('host_points_summary', 'active_incentive_programs')
ORDER BY table_name;

-- 5. Verificar índices criados
SELECT 
    'Índices' as tipo,
    indexname as nome,
    'OK' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    tablename IN ('host_points', 'incentive_programs', 'host_program_enrollments')
    OR indexname LIKE '%host_points%'
    OR indexname LIKE '%incentive%'
  )
ORDER BY tablename, indexname;

-- 6. Testar função calculate_host_total_points
SELECT 
    'Teste Função' as tipo,
    'calculate_host_total_points(1)' as nome,
    CASE 
        WHEN calculate_host_total_points(1) IS NOT NULL THEN 'OK'
        ELSE 'ERRO'
    END as status;

-- 7. Testar função check_program_eligibility
SELECT 
    'Teste Função' as tipo,
    'check_program_eligibility(1, ''welcome_bonus'')' as nome,
    CASE 
        WHEN check_program_eligibility(1, 'welcome_bonus') IS NOT NULL THEN 'OK'
        ELSE 'ERRO'
    END as status;

-- 8. Resumo final
SELECT 
    'RESUMO' as tipo,
    'Total de objetos criados' as nome,
    (
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('host_points', 'incentive_programs', 'host_program_enrollments')) +
        (SELECT COUNT(DISTINCT t.typname) FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname IN ('points_type_enum', 'points_source_enum', 'program_type_enum')) +
        (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name LIKE '%host_points%' OR routine_name LIKE '%program%') +
        (SELECT COUNT(*) FROM information_schema.views WHERE table_name IN ('host_points_summary', 'active_incentive_programs'))
    )::text as status;

