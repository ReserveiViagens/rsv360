-- Migration 024: Criar tabelas para sistema de backup
-- Data: 2025-01-XX
-- Descrição: Tabelas para gerenciamento de backups automatizados

-- Tabela de configurações de backup
CREATE TABLE IF NOT EXISTS backup_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- database, files, full
    schedule VARCHAR(20) NOT NULL, -- daily, weekly, monthly, manual
    schedule_time TIME, -- HH:MM format
    schedule_day INTEGER, -- 0-6 for weekly, 1-31 for monthly
    retention_days INTEGER NOT NULL DEFAULT 30,
    compression BOOLEAN NOT NULL DEFAULT true,
    storage_locations JSONB NOT NULL DEFAULT '[]', -- array of paths or S3 buckets
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backup_configs_enabled ON backup_configs(enabled);
CREATE INDEX IF NOT EXISTS idx_backup_configs_next_run ON backup_configs(next_run);
CREATE INDEX IF NOT EXISTS idx_backup_configs_schedule ON backup_configs(schedule);

-- Tabela de registros de backup
CREATE TABLE IF NOT EXISTS backup_records (
    id SERIAL PRIMARY KEY,
    config_id INTEGER NOT NULL REFERENCES backup_configs(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- database, files, full
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, cancelled
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    size BIGINT, -- bytes
    file_path TEXT,
    checksum VARCHAR(64), -- SHA256 hash
    error TEXT,
    metadata JSONB, -- additional metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backup_records_config_id ON backup_records(config_id);
CREATE INDEX IF NOT EXISTS idx_backup_records_status ON backup_records(status);
CREATE INDEX IF NOT EXISTS idx_backup_records_started_at ON backup_records(started_at);
CREATE INDEX IF NOT EXISTS idx_backup_records_completed_at ON backup_records(completed_at);

-- Comentários nas tabelas
COMMENT ON TABLE backup_configs IS 'Configurações de backup automatizado';
COMMENT ON TABLE backup_records IS 'Registros de execuções de backup';

-- Inserir configuração padrão de backup diário do banco
INSERT INTO backup_configs (name, type, schedule, schedule_time, retention_days, compression, storage_locations, enabled)
VALUES (
    'Backup Diário do Banco de Dados',
    'database',
    'daily',
    '02:00',
    30,
    true,
    '[]'::jsonb,
    true
) ON CONFLICT DO NOTHING;

