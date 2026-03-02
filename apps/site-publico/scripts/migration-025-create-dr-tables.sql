-- Migration 025: Criar tabelas para Disaster Recovery
-- Data: 2025-01-XX
-- Descrição: Tabelas para gerenciamento de disaster recovery

-- Tabela de planos de recuperação
CREATE TABLE IF NOT EXISTS recovery_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL, -- critical, high, medium, low
    rto INTEGER NOT NULL, -- Recovery Time Objective (minutos)
    rpo INTEGER NOT NULL, -- Recovery Point Objective (minutos)
    steps JSONB NOT NULL, -- array de RecoveryStep
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_tested TIMESTAMP,
    last_executed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recovery_plans_enabled ON recovery_plans(enabled);
CREATE INDEX IF NOT EXISTS idx_recovery_plans_priority ON recovery_plans(priority);

-- Tabela de execuções de recuperação
CREATE TABLE IF NOT EXISTS recovery_executions (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES recovery_plans(id) ON DELETE CASCADE,
    triggered_by VARCHAR(20) NOT NULL, -- manual, automatic, scheduled
    triggered_by_user_id INTEGER, -- Pode referenciar users(id) ou customers(id) se existir
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, cancelled
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    current_step VARCHAR(100),
    steps_completed INTEGER NOT NULL DEFAULT 0,
    total_steps INTEGER NOT NULL DEFAULT 0,
    error TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recovery_executions_plan_id ON recovery_executions(plan_id);
CREATE INDEX IF NOT EXISTS idx_recovery_executions_status ON recovery_executions(status);
CREATE INDEX IF NOT EXISTS idx_recovery_executions_started_at ON recovery_executions(started_at);

-- Tabela de execuções de steps
CREATE TABLE IF NOT EXISTS recovery_step_executions (
    id SERIAL PRIMARY KEY,
    execution_id INTEGER NOT NULL REFERENCES recovery_executions(id) ON DELETE CASCADE,
    step_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recovery_step_executions_execution_id ON recovery_step_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_recovery_step_executions_step_id ON recovery_step_executions(step_id);

-- Tabela de verificações de saúde do sistema
CREATE TABLE IF NOT EXISTS system_health_checks (
    id SERIAL PRIMARY KEY,
    database_status VARCHAR(20) NOT NULL, -- healthy, degraded, down
    cache_status VARCHAR(20) NOT NULL,
    storage_status VARCHAR(20) NOT NULL,
    api_status VARCHAR(20) NOT NULL,
    overall_status VARCHAR(20) NOT NULL,
    issues JSONB, -- array de HealthIssue
    checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_health_checks_checked_at ON system_health_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_overall_status ON system_health_checks(overall_status);

-- Inserir plano de recuperação padrão
INSERT INTO recovery_plans (name, description, priority, rto, rpo, steps, enabled)
VALUES (
    'Plano de Recuperação Crítico',
    'Plano padrão para recuperação de desastres críticos',
    'critical',
    60, -- 1 hora RTO
    15, -- 15 minutos RPO
    '[
        {
            "id": "step1",
            "name": "Verificar Integridade do Sistema",
            "description": "Verificar saúde de todos os componentes",
            "type": "custom",
            "order": 1,
            "timeout": 300,
            "retryCount": 2
        },
        {
            "id": "step2",
            "name": "Restaurar Backup do Banco de Dados",
            "description": "Restaurar último backup válido do banco de dados",
            "type": "backup_restore",
            "order": 2,
            "timeout": 1800,
            "retryCount": 1,
            "dependencies": ["step1"]
        },
        {
            "id": "step3",
            "name": "Reiniciar Serviços",
            "description": "Reiniciar todos os serviços críticos",
            "type": "service_restart",
            "order": 3,
            "timeout": 600,
            "retryCount": 2,
            "dependencies": ["step2"]
        },
        {
            "id": "step4",
            "name": "Limpar Cache",
            "description": "Limpar cache para garantir dados atualizados",
            "type": "cache_clear",
            "order": 4,
            "timeout": 300,
            "retryCount": 1,
            "dependencies": ["step3"]
        },
        {
            "id": "step5",
            "name": "Verificar Recuperação",
            "description": "Verificar se o sistema foi recuperado com sucesso",
            "type": "custom",
            "order": 5,
            "timeout": 300,
            "retryCount": 1,
            "dependencies": ["step4"]
        }
    ]'::jsonb,
    true
) ON CONFLICT DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE recovery_plans IS 'Planos de recuperação de desastres';
COMMENT ON TABLE recovery_executions IS 'Execuções de planos de recuperação';
COMMENT ON TABLE recovery_step_executions IS 'Execuções individuais de steps de recuperação';
COMMENT ON TABLE system_health_checks IS 'Verificações de saúde do sistema';

