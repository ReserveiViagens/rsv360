-- PR 24C — disponibilidade por unidade (calendário)
CREATE TABLE IF NOT EXISTS "disponibilidade_acomodacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"acomodacao_id" integer NOT NULL REFERENCES "acomodacoes"("id") ON DELETE CASCADE,
	"data" date NOT NULL,
	"disponivel" boolean NOT NULL DEFAULT true,
	"preco_override" numeric(12, 2),
	"observacao" text,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_disponibilidade_acomodacao_data"
	ON "disponibilidade_acomodacao" ("acomodacao_id", "data");
