CREATE TYPE "public"."dispute_status" AS ENUM('opened', 'in_review', 'won', 'lost', 'accepted');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('credit_card', 'debit_card', 'pix', 'boleto', 'wallet', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('mercadopago', 'stripe', 'openfinance');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'approved', 'rejected', 'cancelled', 'refunded', 'partially_refunded', 'expired', 'in_mediation', 'charged_back');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('pending', 'approved', 'rejected', 'processing');--> statement-breakpoint
CREATE TYPE "public"."subscription_interval" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'paused', 'cancelled', 'past_due', 'trialing', 'unpaid');--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"external_id" varchar(255),
	"reason" text,
	"status" "dispute_status" DEFAULT 'opened' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"evidence" jsonb,
	"deadline" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"document" varchar(20),
	"document_type" varchar(10),
	"phone" varchar(20),
	"stripe_customer_id" varchar(255),
	"mp_customer_id" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"external_id" varchar(255),
	"type" "payment_method" NOT NULL,
	"last_4" varchar(4),
	"brand" varchar(50),
	"expiry_month" integer,
	"expiry_year" integer,
	"is_default" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"customer_id" uuid,
	"external_id" varchar(255),
	"provider" "payment_provider" NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"description" text,
	"installments" integer DEFAULT 1,
	"fees" numeric(10, 2),
	"net_amount" numeric(12, 2),
	"pix_qr_code" text,
	"pix_qr_code_base64" text,
	"pix_expires_at" timestamp,
	"boleto_url" text,
	"boleto_barcode" text,
	"boleto_expires_at" timestamp,
	"booking_id" uuid,
	"ticket_id" uuid,
	"metadata" jsonb,
	"paid_at" timestamp,
	"cancelled_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"external_id" varchar(255),
	"amount" numeric(12, 2) NOT NULL,
	"reason" text,
	"status" "refund_status" DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"interval" "subscription_interval" NOT NULL,
	"interval_count" integer DEFAULT 1,
	"trial_days" integer DEFAULT 0,
	"features" jsonb,
	"is_active" boolean DEFAULT true,
	"stripe_product_id" varchar(255),
	"stripe_price_id" varchar(255),
	"mp_plan_id" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"external_id" varchar(255),
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"trial_end" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"external_event_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false,
	"processed_at" timestamp,
	"error" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_events_external_event_id_unique" UNIQUE("external_event_id")
);
--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_customer_id_payment_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."payment_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_payment_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."payment_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customer_id_payment_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."payment_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;