-- ✅ SCRIPT PARA VERIFICAR TODAS AS TABELAS CRIADAS
-- Execute este script no Query Tool do pgAdmin

-- 1. Listar todas as tabelas criadas pelos scripts SQL
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'credentials',
            'application_logs',
            'notification_queue',
            'saved_searches',
            'two_factor_auth',
            'two_factor_backup_codes',
            'audit_logs',
            'lgpd_consents',
            'lgpd_data_requests',
            'rate_limit_attempts',
            'trip_plans',
            'trip_members',
            'trip_tasks',
            'trip_itinerary',
            'trip_expenses',
            'trip_expense_splits',
            'group_chat_polls'
        ) THEN '✅ CRIADA'
        ELSE '⚠️ NÃO ESPERADA'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'credentials',
    'application_logs',
    'notification_queue',
    'saved_searches',
    'two_factor_auth',
    'two_factor_backup_codes',
    'audit_logs',
    'lgpd_consents',
    'lgpd_data_requests',
    'rate_limit_attempts',
    'trip_plans',
    'trip_members',
    'trip_tasks',
    'trip_itinerary',
    'trip_expenses',
    'trip_expense_splits',
    'group_chat_polls'
)
ORDER BY table_name;

-- 2. Contar quantas tabelas foram criadas
SELECT 
    COUNT(*) as total_tabelas_criadas,
    CASE 
        WHEN COUNT(*) >= 16 THEN '✅ TODAS AS TABELAS CRIADAS'
        WHEN COUNT(*) >= 10 THEN '⚠️ ALGUMAS TABELAS FALTANDO'
        ELSE '❌ MUITAS TABELAS FALTANDO'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'credentials',
    'application_logs',
    'notification_queue',
    'saved_searches',
    'two_factor_auth',
    'two_factor_backup_codes',
    'audit_logs',
    'lgpd_consents',
    'lgpd_data_requests',
    'rate_limit_attempts',
    'trip_plans',
    'trip_members',
    'trip_tasks',
    'trip_itinerary',
    'trip_expenses',
    'trip_expense_splits',
    'group_chat_polls'
);

-- 3. Verificar índices criados
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
AND (
    tablename IN (
        'credentials',
        'application_logs',
        'notification_queue',
        'saved_searches',
        'two_factor_auth',
        'audit_logs',
        'trip_plans',
        'trip_members',
        'trip_tasks',
        'trip_itinerary',
        'trip_expenses',
        'group_chat_polls'
    )
    OR indexname LIKE 'idx_credentials%'
    OR indexname LIKE 'idx_application_logs%'
    OR indexname LIKE 'idx_trip_%'
)
ORDER BY tablename, indexname;

-- 4. Verificar estrutura de uma tabela específica (exemplo: credentials)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'credentials'
ORDER BY ordinal_position;

