-- PR2: configurações do módulo de propostas / cotação
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  valores JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracoes_sistema (chave, valores)
VALUES (
  'modulo_propostas',
  '{"permitirApenasHotel": true, "disparoAutomatizadoCaldasAi": true, "delayDisparoMinutos": 120}'::jsonb
)
ON CONFLICT (chave) DO NOTHING;
