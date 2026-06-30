-- PR 19 — Acomodação inteligente (tipologia + wizard_addons)
CREATE TABLE IF NOT EXISTS "tipos_acomodacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"nome" varchar(255) NOT NULL,
	"icone" varchar(64),
	"ativo" boolean NOT NULL DEFAULT true,
	"ordem" integer NOT NULL DEFAULT 0,
	"criado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tipos_acomodacao_slug" ON "tipos_acomodacao" ("slug");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acomodacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"hotel_id" text NOT NULL,
	"anfitriao_id" uuid,
	"tipo_id" integer REFERENCES "tipos_acomodacao"("id"),
	"titulo" varchar(255) NOT NULL,
	"quartos" integer NOT NULL DEFAULT 1,
	"config_sala" text NOT NULL DEFAULT 'nenhum',
	"config_banheiro" text NOT NULL DEFAULT 'so_wc_social',
	"capacidade_max" integer NOT NULL,
	"capacidade_base" integer,
	"preco_diaria" numeric(12, 2),
	"utensilios" jsonb,
	"eletrodomesticos" jsonb,
	"amenidades" jsonb,
	"midia" jsonb,
	"dados_completos" boolean NOT NULL DEFAULT false,
	"ativo" boolean NOT NULL DEFAULT true,
	"codigo_externo" varchar(128),
	"criado_em" timestamp with time zone DEFAULT now(),
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_acomodacoes_hotel_ativo" ON "acomodacoes" ("hotel_id", "ativo");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_acomodacoes_tipo" ON "acomodacoes" ("tipo_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_acomodacoes_cap" ON "acomodacoes" ("capacidade_max");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wizard_addons" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"descricao" text,
	"preco_tipo" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"escopo" text,
	"requer_config_banheiro" text,
	"ativo" boolean NOT NULL DEFAULT true,
	"ordem" integer NOT NULL DEFAULT 0,
	"criado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
INSERT INTO "tipos_acomodacao" ("slug", "nome", "icone", "ordem")
SELECT 'apto', 'Apartamento', 'building', 1
WHERE NOT EXISTS (SELECT 1 FROM "tipos_acomodacao" WHERE "slug" = 'apto');
--> statement-breakpoint
INSERT INTO "tipos_acomodacao" ("slug", "nome", "icone", "ordem")
SELECT 'casa', 'Casa', 'home', 2
WHERE NOT EXISTS (SELECT 1 FROM "tipos_acomodacao" WHERE "slug" = 'casa');
--> statement-breakpoint
INSERT INTO "tipos_acomodacao" ("slug", "nome", "icone", "ordem")
SELECT 'sobrado', 'Sobrado', 'layers', 3
WHERE NOT EXISTS (SELECT 1 FROM "tipos_acomodacao" WHERE "slug" = 'sobrado');
--> statement-breakpoint
INSERT INTO "tipos_acomodacao" ("slug", "nome", "icone", "ordem")
SELECT 'chacara', 'Chácara', 'trees', 4
WHERE NOT EXISTS (SELECT 1 FROM "tipos_acomodacao" WHERE "slug" = 'chacara');
--> statement-breakpoint
INSERT INTO "tipos_acomodacao" ("slug", "nome", "icone", "ordem")
SELECT 'flat', 'Flat', 'hotel', 5
WHERE NOT EXISTS (SELECT 1 FROM "tipos_acomodacao" WHERE "slug" = 'flat');
--> statement-breakpoint
INSERT INTO "wizard_addons" ("nome", "descricao", "preco_tipo", "valor", "escopo", "requer_config_banheiro", "ordem")
SELECT
	'Upgrade Suíte Master',
	'Mais conforto e vista premium',
	'por_noite',
	80.00,
	'hotel',
	'so_suite',
	1
WHERE NOT EXISTS (SELECT 1 FROM "wizard_addons" WHERE "nome" = 'Upgrade Suíte Master');
