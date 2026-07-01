-- PR 22A — empreendimentos + modelo parceiros (proprietario_id, status_publicacao)
CREATE TABLE IF NOT EXISTS "empreendimentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"hotel_id" text NOT NULL,
	"nome_oficial" text NOT NULL,
	"nome_normalizado" text NOT NULL,
	"tipo" text NOT NULL DEFAULT 'condominio',
	"cidade" text NOT NULL DEFAULT 'Caldas Novas',
	"status" text NOT NULL DEFAULT 'aprovado',
	"criado_por" integer REFERENCES "users"("id"),
	"website_content_id" text,
	"metadata" jsonb,
	"ativo" boolean NOT NULL DEFAULT true,
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_empreendimentos_slug" ON "empreendimentos" ("slug");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_empreendimentos_hotel_id" ON "empreendimentos" ("hotel_id");
--> statement-breakpoint
ALTER TABLE "empreendimentos" DROP CONSTRAINT IF EXISTS "empreendimentos_status_check";
--> statement-breakpoint
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_status_check"
	CHECK ("status" IN ('pendente', 'aprovado', 'rejeitado'));
--> statement-breakpoint
ALTER TABLE "acomodacoes" DROP COLUMN IF EXISTS "anfitriao_id";
--> statement-breakpoint
ALTER TABLE "acomodacoes" ADD COLUMN IF NOT EXISTS "proprietario_id" integer REFERENCES "users"("id");
--> statement-breakpoint
ALTER TABLE "acomodacoes" ADD COLUMN IF NOT EXISTS "status_publicacao" text NOT NULL DEFAULT 'rascunho';
--> statement-breakpoint
ALTER TABLE "acomodacoes" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
--> statement-breakpoint
ALTER TABLE "acomodacoes" DROP CONSTRAINT IF EXISTS "acomodacoes_status_publicacao_check";
--> statement-breakpoint
ALTER TABLE "acomodacoes" ADD CONSTRAINT "acomodacoes_status_publicacao_check"
	CHECK ("status_publicacao" IN ('rascunho', 'completo', 'em_aprovacao', 'publicado', 'rejeitado'));
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_acomodacoes_codigo_externo_unique"
	ON "acomodacoes" ("codigo_externo") WHERE "codigo_externo" IS NOT NULL;
