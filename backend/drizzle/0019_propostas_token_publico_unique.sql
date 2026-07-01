-- Fase 0 Item 4: índice único em token_publico + reforço status/valido_ate
-- Não editar 0018 nem migrations anteriores.

DO $$
DECLARE
  dup_groups integer;
BEGIN
  SELECT COUNT(*)::integer INTO dup_groups
  FROM (
    SELECT token_publico
    FROM propostas
    WHERE token_publico IS NOT NULL AND btrim(token_publico) <> ''
    GROUP BY token_publico
    HAVING COUNT(*) > 1
  ) duplicates;

  IF dup_groups > 0 THEN
    RAISE EXCEPTION
      'Migration 0019 abortada: % grupo(s) de token_publico duplicado. Limpe antes de aplicar.',
      dup_groups;
  END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_propostas_token ON propostas (token_publico);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_propostas_status_valido_ate ON propostas (status, valido_ate);
