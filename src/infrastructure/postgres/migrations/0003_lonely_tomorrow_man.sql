CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"theme_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"honoree_name" text NOT NULL,
	"subtitle_label" text NOT NULL,
	"event_date" date NOT NULL,
	"event_time" time NOT NULL,
	"venue_name" text NOT NULL,
	"venue_address" text NOT NULL,
	"google_maps_url" text,
	"quote_text" text,
	"quote_reference" text,
	"pix_key" text,
	"pix_qr_code_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "gift_claims" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "gift_items" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "guestbook_messages" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_claims" ADD CONSTRAINT "gift_claims_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_items" ADD CONSTRAINT "gift_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guestbook_messages" ADD CONSTRAINT "guestbook_messages_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;