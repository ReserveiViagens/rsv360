-- Migration 023: Criar tabelas para LGPD/GDPR
-- Data: 2025-01-XX
-- Descrição: Tabelas para conformidade com LGPD e GDPR

-- Tabela de consentimentos
CREATE TABLE IF NOT EXISTS gdpr_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- Referencia users(id) ou customers(id) se existir
    consent_type VARCHAR(50) NOT NULL, -- marketing, analytics, cookies, third_party, data_processing
    granted BOOLEAN NOT NULL DEFAULT false,
    granted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    version VARCHAR(20) NOT NULL, -- versão da política de privacidade
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, consent_type, version)
);

CREATE INDEX IF NOT EXISTS idx_gdpr_consents_user_id ON gdpr_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_consents_consent_type ON gdpr_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_gdpr_consents_granted ON gdpr_consents(granted);

-- Tabela de exportações de dados
CREATE TABLE IF NOT EXISTS gdpr_data_exports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- Referencia users(id) ou customers(id) se existir
    format VARCHAR(10) NOT NULL DEFAULT 'json', -- json, csv, xml
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    download_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    expires_at TIMESTAMP, -- data de expiração do link de download
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gdpr_data_exports_user_id ON gdpr_data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_data_exports_status ON gdpr_data_exports(status);

-- Tabela de solicitações de deleção de dados
CREATE TABLE IF NOT EXISTS gdpr_deletion_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- Referencia users(id) ou customers(id) se existir
    reason TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_requests_user_id ON gdpr_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_requests_status ON gdpr_deletion_requests(status);

-- Tabela de logs de acesso a dados pessoais
CREATE TABLE IF NOT EXISTS gdpr_data_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- Referencia users(id) ou customers(id) se existir
    data_type VARCHAR(100) NOT NULL, -- tipo de dado acessado
    action VARCHAR(20) NOT NULL, -- read, update, delete, export
    accessed_by INTEGER NOT NULL, -- Referencia users(id) ou customers(id) se existir
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB, -- detalhes adicionais do acesso
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gdpr_data_access_logs_user_id ON gdpr_data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_data_access_logs_accessed_by ON gdpr_data_access_logs(accessed_by);
CREATE INDEX IF NOT EXISTS idx_gdpr_data_access_logs_timestamp ON gdpr_data_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_gdpr_data_access_logs_action ON gdpr_data_access_logs(action);

-- Tabela de versões da política de privacidade
CREATE TABLE IF NOT EXISTS privacy_policy_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    content TEXT NOT NULL, -- conteúdo da política (pode ser HTML/Markdown)
    effective_date DATE NOT NULL, -- data de vigência
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_privacy_policy_versions_is_active ON privacy_policy_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_privacy_policy_versions_effective_date ON privacy_policy_versions(effective_date);

-- Inserir versão inicial da política de privacidade
INSERT INTO privacy_policy_versions (version, content, effective_date, is_active)
VALUES (
    '1.0',
    'Política de Privacidade - Versão 1.0

Esta política descreve como coletamos, usamos e protegemos seus dados pessoais.

1. Coleta de Dados
Coletamos dados necessários para fornecer nossos serviços.

2. Uso de Dados
Usamos seus dados para processar reservas, melhorar nossos serviços e enviar comunicações relevantes.

3. Compartilhamento
Não compartilhamos seus dados com terceiros sem seu consentimento.

4. Seus Direitos
Você tem direito a acessar, corrigir, deletar e exportar seus dados.

5. Segurança
Implementamos medidas de segurança para proteger seus dados.',
    CURRENT_DATE,
    true
) ON CONFLICT (version) DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE gdpr_consents IS 'Registros de consentimento do usuário para diferentes tipos de processamento de dados';
COMMENT ON TABLE gdpr_data_exports IS 'Solicitações de exportação de dados pessoais (direito à portabilidade)';
COMMENT ON TABLE gdpr_deletion_requests IS 'Solicitações de deleção de dados pessoais (direito ao esquecimento)';
COMMENT ON TABLE gdpr_data_access_logs IS 'Logs de acesso a dados pessoais para auditoria e conformidade';
COMMENT ON TABLE privacy_policy_versions IS 'Versões da política de privacidade';

