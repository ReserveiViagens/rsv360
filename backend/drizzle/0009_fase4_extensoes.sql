CREATE TABLE IF NOT EXISTS "contas_pagar" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"fornecedor_nome" varchar(255) NOT NULL,
	"descricao" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"valor_pago" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" varchar(30) DEFAULT 'aberto' NOT NULL,
	"vencimento" timestamp,
	"pago_em" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fornecedores" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"nome" varchar(255) NOT NULL,
	"cnpj" varchar(20),
	"email" varchar(255),
	"telefone" varchar(50),
	"categoria" varchar(100),
	"status" varchar(30) DEFAULT 'ativo' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservas_logistica" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"fornecedor_id" integer,
	"titulo" varchar(255) NOT NULL,
	"tipo" varchar(50) DEFAULT 'servico' NOT NULL,
	"status" varchar(30) DEFAULT 'pendente' NOT NULL,
	"data_inicio" timestamp,
	"data_fim" timestamp,
	"valor" numeric(12, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vouchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"codigo" varchar(50) NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"passageiro_nome" varchar(255),
	"reserva_id" integer,
	"status" varchar(30) DEFAULT 'ativo' NOT NULL,
	"valido_ate" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fnrh_registros" (
	"id" serial PRIMARY KEY NOT NULL,
	"passageiro_id" integer NOT NULL,
	"hotel_nome" varchar(255),
	"data_entrada" date,
	"data_saida" date,
	"motivo_viagem" varchar(100),
	"meio_transporte" varchar(100),
	"status" varchar(30) DEFAULT 'rascunho' NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fnrh_registros" ADD CONSTRAINT "fnrh_registros_passageiro_id_passageiros_id_fk" FOREIGN KEY ("passageiro_id") REFERENCES "public"."passageiros"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
