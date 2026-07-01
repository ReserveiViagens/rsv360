-- PR 24A — carteira corretor ↔ proprietário
CREATE TABLE IF NOT EXISTS "carteira_corretor" (
	"corretor_id" integer NOT NULL REFERENCES "users"("id"),
	"proprietario_id" integer NOT NULL REFERENCES "users"("id"),
	"status" text NOT NULL DEFAULT 'ativo',
	"criado_em" timestamp with time zone DEFAULT now(),
	PRIMARY KEY ("corretor_id", "proprietario_id")
);
--> statement-breakpoint
ALTER TABLE "carteira_corretor" DROP CONSTRAINT IF EXISTS "carteira_corretor_status_check";
--> statement-breakpoint
ALTER TABLE "carteira_corretor" ADD CONSTRAINT "carteira_corretor_status_check"
	CHECK ("status" IN ('ativo', 'inativo'));
