-- PR-06c: account login protection + TOTP anti-replay
CREATE TABLE IF NOT EXISTS "auth_login_protection" (
	"account_key" text PRIMARY KEY NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"lockout_level" integer DEFAULT 0 NOT NULL,
	"blocked_until" timestamp with time zone,
	"last_failure_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_2fa" ADD COLUMN IF NOT EXISTS "last_totp_step" bigint;
--> statement-breakpoint
ALTER TABLE "user_2fa" ADD COLUMN IF NOT EXISTS "last_totp_used_at" timestamp with time zone;
