-- PR 18 — Entrada contextual / CRM de abandono do wizard
CREATE TABLE IF NOT EXISTS "cotacao_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"whatsapp" varchar(20),
	"nome" varchar(255),
	"passo_abandonado" integer NOT NULL,
	"hotel_id" text,
	"checkin" date,
	"checkout" date,
	"adults" integer,
	"children" integer,
	"ref_indicacao" varchar(64),
	"canal" varchar(64),
	"payload" jsonb,
	"consentimento_lgpd" boolean NOT NULL DEFAULT false,
	"enviado_whatsapp" boolean NOT NULL DEFAULT false,
	"whatsapp_erro" text,
	"sessao_id" varchar(64),
	"criado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cotacao_leads_criado_em" ON "cotacao_leads" ("criado_em" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cotacao_leads_passo" ON "cotacao_leads" ("passo_abandonado");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cotacao_leads_whatsapp_envio" ON "cotacao_leads" ("enviado_whatsapp", "consentimento_lgpd");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cotacao_leads_ref" ON "cotacao_leads" ("ref_indicacao");
