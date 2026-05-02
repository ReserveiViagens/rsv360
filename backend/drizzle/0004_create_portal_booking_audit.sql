CREATE TABLE "portal_booking_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"token_id" text NOT NULL,
	"action" text NOT NULL,
	"fields_changed" jsonb NOT NULL,
	"before_payload" jsonb,
	"after_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portal_booking_audit" ADD CONSTRAINT "portal_booking_audit_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portal_booking_audit_booking_idx" ON "portal_booking_audit" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "portal_booking_audit_created_at_idx" ON "portal_booking_audit" USING btree ("created_at");