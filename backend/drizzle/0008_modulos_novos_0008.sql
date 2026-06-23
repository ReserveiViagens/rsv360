CREATE TABLE IF NOT EXISTS "orcamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"codigo" varchar(50),
	"titulo" varchar(255) NOT NULL,
	"cliente_nome" varchar(255) NOT NULL,
	"cliente_email" varchar(255),
	"cliente_telefone" varchar(50),
	"cliente_documento" varchar(50),
	"tipo" varchar(50) DEFAULT 'personalizado' NOT NULL,
	"categoria" varchar(100),
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"desconto" numeric(12, 2) DEFAULT '0' NOT NULL,
	"desconto_tipo" varchar(20) DEFAULT 'percentage',
	"impostos" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"moeda" varchar(3) DEFAULT 'BRL' NOT NULL,
	"valido_ate" timestamp,
	"notas" text,
	"metadata" jsonb,
	"criado_por" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orcamento_itens" (
	"id" serial PRIMARY KEY NOT NULL,
	"orcamento_id" integer NOT NULL,
	"nome" varchar(255) NOT NULL,
	"descricao" text,
	"categoria" varchar(100),
	"quantidade" integer DEFAULT 1 NOT NULL,
	"preco_unitario" numeric(12, 2) DEFAULT '0' NOT NULL,
	"preco_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"detalhes" jsonb,
	"ordem" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "propostas" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"orcamento_id" integer,
	"codigo" varchar(50),
	"titulo" varchar(255) NOT NULL,
	"cliente_nome" varchar(255) NOT NULL,
	"cliente_email" varchar(255),
	"cliente_telefone" varchar(50),
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"valor_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"moeda" varchar(3) DEFAULT 'BRL' NOT NULL,
	"valido_ate" timestamp,
	"versao" integer DEFAULT 1 NOT NULL,
	"is_publica" boolean DEFAULT false,
	"conteudo" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "proposta_eventos" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposta_id" integer NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"descricao" text,
	"payload" jsonb,
	"actor_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "proposta_chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposta_id" integer NOT NULL,
	"sender_type" varchar(30) NOT NULL,
	"sender_name" varchar(255),
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pacotes_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"nome" varchar(255) NOT NULL,
	"categoria" varchar(100),
	"descricao" text,
	"conteudo" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"uso_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "passageiros" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255),
	"telefone" varchar(50),
	"cpf" varchar(14),
	"rg" varchar(20),
	"data_nascimento" date,
	"tipo" varchar(30) DEFAULT 'adulto',
	"documentos" jsonb,
	"notas" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "passageiro_excursao" (
	"id" serial PRIMARY KEY NOT NULL,
	"passageiro_id" integer NOT NULL,
	"travel_package_id" integer,
	"status" varchar(30) DEFAULT 'reservado' NOT NULL,
	"assento" varchar(20),
	"observacoes" text,
	"check_in_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"tipo" varchar(20) NOT NULL,
	"categoria" varchar(100),
	"descricao" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"moeda" varchar(3) DEFAULT 'BRL' NOT NULL,
	"status" varchar(30) DEFAULT 'pendente' NOT NULL,
	"metodo_pagamento" varchar(50),
	"referencia_tipo" varchar(50),
	"referencia_id" integer,
	"data_transacao" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contas_receber" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"cliente_nome" varchar(255) NOT NULL,
	"cliente_email" varchar(255),
	"descricao" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"valor_recebido" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" varchar(30) DEFAULT 'aberto' NOT NULL,
	"vencimento" timestamp,
	"recebido_em" timestamp,
	"booking_id" integer,
	"proposta_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campanhas" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"nome" varchar(255) NOT NULL,
	"tipo" varchar(50),
	"status" varchar(30) DEFAULT 'rascunho' NOT NULL,
	"orcamento" numeric(12, 2) DEFAULT '0',
	"gasto_atual" numeric(12, 2) DEFAULT '0',
	"inicio" timestamp,
	"fim" timestamp,
	"canais" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"codigo" varchar(50) NOT NULL,
	"tipo_desconto" varchar(20) DEFAULT 'percentage' NOT NULL,
	"valor_desconto" numeric(12, 2) NOT NULL,
	"uso_maximo" integer,
	"uso_atual" integer DEFAULT 0,
	"valido_de" timestamp,
	"valido_ate" timestamp,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cupons_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cupons_uso" (
	"id" serial PRIMARY KEY NOT NULL,
	"cupom_id" integer NOT NULL,
	"cliente_email" varchar(255),
	"booking_id" integer,
	"valor_desconto" numeric(12, 2) NOT NULL,
	"used_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transportes" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"tipo" varchar(50) NOT NULL,
	"placa" varchar(20),
	"modelo" varchar(100),
	"capacidade" integer DEFAULT 0 NOT NULL,
	"motorista" varchar(255),
	"status" varchar(30) DEFAULT 'disponivel' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "embarques" (
	"id" serial PRIMARY KEY NOT NULL,
	"transporte_id" integer NOT NULL,
	"travel_package_id" integer,
	"local" varchar(255) NOT NULL,
	"data_hora" timestamp NOT NULL,
	"status" varchar(30) DEFAULT 'agendado' NOT NULL,
	"passageiros_count" integer DEFAULT 0,
	"notas" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relatorios_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"user_id" integer,
	"nome" varchar(255) NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"filtros" jsonb,
	"colunas" jsonb,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relatorios_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"view_id" integer,
	"tipo" varchar(50) NOT NULL,
	"periodo_inicio" timestamp,
	"periodo_fim" timestamp,
	"dados" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"gerado_por" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "orcamento_itens" ADD CONSTRAINT "orcamento_itens_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "proposta_eventos" ADD CONSTRAINT "proposta_eventos_proposta_id_propostas_id_fk" FOREIGN KEY ("proposta_id") REFERENCES "public"."propostas"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "proposta_chat" ADD CONSTRAINT "proposta_chat_proposta_id_propostas_id_fk" FOREIGN KEY ("proposta_id") REFERENCES "public"."propostas"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "passageiro_excursao" ADD CONSTRAINT "passageiro_excursao_passageiro_id_passageiros_id_fk" FOREIGN KEY ("passageiro_id") REFERENCES "public"."passageiros"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cupons_uso" ADD CONSTRAINT "cupons_uso_cupom_id_cupons_id_fk" FOREIGN KEY ("cupom_id") REFERENCES "public"."cupons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "embarques" ADD CONSTRAINT "embarques_transporte_id_transportes_id_fk" FOREIGN KEY ("transporte_id") REFERENCES "public"."transportes"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "relatorios_snapshots" ADD CONSTRAINT "relatorios_snapshots_view_id_relatorios_views_id_fk" FOREIGN KEY ("view_id") REFERENCES "public"."relatorios_views"("id") ON DELETE set null ON UPDATE no action;
