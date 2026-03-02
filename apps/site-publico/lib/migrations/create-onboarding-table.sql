-- Migração: Tabela user_onboarding para armazenar dados do onboarding RSV360
-- Execute manualmente: psql -U postgres -d rsv360 -f apps/site-publico/lib/migrations/create-onboarding-table.sql
--
-- Variáveis de ambiente para geração de plano (opcional):
-- NEXT_PUBLIC_ONBOARDING_PLAN_MODE=mock|api|openai
-- OPENAI_API_KEY=sk-... (apenas se mode=openai)

CREATE TABLE IF NOT EXISTS user_onboarding (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile JSONB DEFAULT '{}',
  assessment JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  goals JSONB DEFAULT '{}',
  plan_data JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
