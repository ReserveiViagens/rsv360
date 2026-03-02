-- Migration 027: Criar tabelas para criptografia avançada
-- Data: 2025-01-XX
-- Descrição: Tabelas para gerenciamento de chaves de criptografia

-- Tabela de chaves de criptografia
CREATE TABLE IF NOT EXISTS encryption_keys (
    id VARCHAR(100) PRIMARY KEY,
    key_base64 TEXT NOT NULL, -- Chave em base64 (NUNCA armazenar em texto plano)
    type VARCHAR(20) NOT NULL, -- encryption, signing, hashing
    algorithm VARCHAR(50) NOT NULL, -- aes-256-gcm, sha256, etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used TIMESTAMP,
    rotated_from VARCHAR(100), -- ID da chave anterior (para rastreamento)
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_encryption_keys_type ON encryption_keys(type);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_is_active ON encryption_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_expires_at ON encryption_keys(expires_at);

-- Tabela de logs de uso de chaves
CREATE TABLE IF NOT EXISTS key_usage_logs (
    id SERIAL PRIMARY KEY,
    key_id VARCHAR(100) NOT NULL REFERENCES encryption_keys(id) ON DELETE CASCADE,
    operation VARCHAR(20) NOT NULL, -- encrypt, decrypt, sign, verify
    user_id INTEGER, -- Pode referenciar users(id) ou customers(id) se existir
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_key_usage_logs_key_id ON key_usage_logs(key_id);
CREATE INDEX IF NOT EXISTS idx_key_usage_logs_timestamp ON key_usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_key_usage_logs_user_id ON key_usage_logs(user_id);

-- Tabela de configuração de criptografia de campos
CREATE TABLE IF NOT EXISTS field_encryption_config (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    key_id VARCHAR(100) NOT NULL REFERENCES encryption_keys(id),
    algorithm VARCHAR(50) NOT NULL DEFAULT 'aes-256-gcm',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_name, field_name)
);

CREATE INDEX IF NOT EXISTS idx_field_encryption_config_table_field ON field_encryption_config(table_name, field_name);
CREATE INDEX IF NOT EXISTS idx_field_encryption_config_key_id ON field_encryption_config(key_id);

-- Comentários
COMMENT ON TABLE encryption_keys IS 'Chaves de criptografia do sistema';
COMMENT ON TABLE key_usage_logs IS 'Logs de uso de chaves para auditoria';
COMMENT ON TABLE field_encryption_config IS 'Configuração de criptografia por campo de tabela';

-- Criar chave padrão inicial (será gerada pelo serviço, mas criar estrutura)
-- NOTA: A chave real será gerada pelo KeyManagementService na primeira execução

