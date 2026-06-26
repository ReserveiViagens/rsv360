-- Cotação Interativa v2 — PR 1 (infraestrutura de dados)
CREATE TABLE IF NOT EXISTS "fornecedores_api" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo" text NOT NULL,
	"endpoint" text NOT NULL,
	"api_key" text NOT NULL,
	"adapter" text NOT NULL,
	"prioridade" integer DEFAULT 100,
	"timeout_ms" integer DEFAULT 3000,
	"ativo" boolean DEFAULT true,
	"config" jsonb,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "indicacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"indicador_id" integer NOT NULL,
	"indicado_email" text,
	"indicado_telefone" text,
	"token_proposta" text NOT NULL,
	"canal" text,
	"status_indicacao" text DEFAULT 'pendente',
	"data_conversao" timestamp,
	"valor_bonus" numeric(10, 2),
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_indicacoes_indicador" ON "indicacoes" ("indicador_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_indicacoes_token" ON "indicacoes" ("token_proposta");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auditoria_estados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entidade" text NOT NULL,
	"entidade_id" integer NOT NULL,
	"de" text,
	"para" text NOT NULL,
	"autor_id" integer NOT NULL,
	"autor_role" text NOT NULL,
	"motivo" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auditoria_entidade" ON "auditoria_estados" ("entidade", "entidade_id");
--> statement-breakpoint
ALTER TABLE "propostas" ADD COLUMN IF NOT EXISTS "token_publico" varchar(64);
--> statement-breakpoint
ALTER TABLE "propostas" ADD COLUMN IF NOT EXISTS "exibir_comparativo" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "propostas" ADD COLUMN IF NOT EXISTS "comparativo_cache" jsonb;
--> statement-breakpoint
ALTER TABLE "propostas" ADD COLUMN IF NOT EXISTS "status_aprovacao" varchar(40) DEFAULT 'nao_requer';
--> statement-breakpoint
ALTER TABLE "propostas" ADD COLUMN IF NOT EXISTS "solicitado_por" integer;
--> statement-breakpoint
ALTER TABLE "propostas" ADD COLUMN IF NOT EXISTS "aprovado_por" integer;
--> statement-breakpoint
ALTER TABLE "propostas" ADD COLUMN IF NOT EXISTS "voucher_tipo" varchar(20);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "propostas_token_publico_unique" ON "propostas" ("token_publico");
