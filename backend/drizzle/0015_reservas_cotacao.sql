-- Cotação Interativa v2 — PR 5 (lock anti-overbooking)
CREATE TABLE IF NOT EXISTS "reservas_cotacao" (
	"id" uuid PRIMARY KEY NOT NULL,
	"parceiro_id" uuid NOT NULL,
	"chave_vaga" text NOT NULL,
	"proposta_id" integer,
	"status" text NOT NULL DEFAULT 'pendente',
	"confirmada_em" timestamp,
	"cancelada_em" timestamp,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reservas_cotacao_parceiro" ON "reservas_cotacao" ("parceiro_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reservas_cotacao_status" ON "reservas_cotacao" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reservas_cotacao_chave_vaga" ON "reservas_cotacao" ("chave_vaga");
