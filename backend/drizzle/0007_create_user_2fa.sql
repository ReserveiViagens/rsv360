CREATE TABLE IF NOT EXISTS "user_2fa" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"totp_secret_encrypted" text,
	"enabled_at" timestamp with time zone,
	"backup_codes_hash" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "login_2fa_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"temp_token_hash" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "login_2fa_challenges_token_hash_idx" ON "login_2fa_challenges" USING btree ("temp_token_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "login_2fa_challenges_user_id_idx" ON "login_2fa_challenges" USING btree ("user_id");
