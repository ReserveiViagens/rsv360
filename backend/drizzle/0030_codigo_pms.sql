-- Fase 2: chave física PMS/Stays para sync de calendário (anti-overbooking)
ALTER TABLE acomodacoes ADD COLUMN IF NOT EXISTS codigo_pms varchar(64);

CREATE UNIQUE INDEX IF NOT EXISTS uq_acomodacoes_codigo_pms
  ON acomodacoes (codigo_pms)
  WHERE codigo_pms IS NOT NULL;
