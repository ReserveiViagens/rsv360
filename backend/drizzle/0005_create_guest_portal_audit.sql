CREATE TYPE "guest_portal_auth_event" AS ENUM ('token_valid', 'token_invalid', 'token_expired', 'token_revoked', 'token_missing');
--> statement-breakpoint
CREATE TABLE "guest_portal_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"event" "guest_portal_auth_event" NOT NULL,
	"token_hash" text,
	"token_last4" text,
	"booking_ref" text,
	"ip_address" inet,
	"user_agent" text,
	"request_path" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "guest_portal_audit_created_at_idx" ON "guest_portal_audit" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "guest_portal_audit_event_created_at_idx" ON "guest_portal_audit" USING btree ("event","created_at");
--> statement-breakpoint
CREATE INDEX "guest_portal_audit_booking_ref_idx" ON "guest_portal_audit" USING btree ("booking_ref");
