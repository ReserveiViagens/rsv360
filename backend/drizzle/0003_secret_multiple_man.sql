CREATE TABLE "guest_portal_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_accessed_at" timestamp with time zone,
	"access_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guest_portal_tokens" ADD CONSTRAINT "guest_portal_tokens_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_guest_portal_tokens_token_unique" ON "guest_portal_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_guest_portal_tokens_booking_id" ON "guest_portal_tokens" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_guest_portal_tokens_active_expires" ON "guest_portal_tokens" USING btree ("is_active","expires_at");