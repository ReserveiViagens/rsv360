-- Cotação Interativa v2 — PR 4 (cache híbrido Postgres + Redis)
CREATE TABLE IF NOT EXISTS "ofertas_cache" (
	"chave" text PRIMARY KEY NOT NULL,
	"ofertas" jsonb NOT NULL,
	"origem" text NOT NULL,
	"capturado_em" timestamp NOT NULL,
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ofertas_cache_capturado" ON "ofertas_cache" ("capturado_em");
