-- PR 12: expiração configurável + aviso de expiração (Roteiro Premium)
-- Tabela vive em database/migrations legado; garantir CREATE em DB fresco (CI/route-smoke).
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  valores JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE propostas ADD COLUMN IF NOT EXISTS aviso_expiracao_enviado boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_propostas_status_valido_ate ON propostas (status, valido_ate);

-- Backfill propostas legadas sem valido_ate
UPDATE propostas
SET valido_ate = created_at + interval '7 days'
WHERE valido_ate IS NULL AND status NOT IN ('accepted', 'cancelled');

-- Estende defaults do módulo propostas (configuracoes_sistema)
INSERT INTO configuracoes_sistema (chave, valores)
VALUES (
  'modulo_propostas',
  '{
    "permitirApenasHotel": true,
    "disparoAutomatizadoCaldasAi": true,
    "delayDisparoMinutos": 120,
    "validadeCotacaoHoras": 48,
    "urgenciaEstilo": "countdown",
    "avisoExpiracaoHoras": 2
  }'::jsonb
)
ON CONFLICT (chave) DO UPDATE
SET valores = configuracoes_sistema.valores || '{
  "validadeCotacaoHoras": 48,
  "urgenciaEstilo": "countdown",
  "avisoExpiracaoHoras": 2
}'::jsonb,
updated_at = NOW();
