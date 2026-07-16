ALTER TABLE "gallery_photos" ALTER COLUMN "event_id" SET DEFAULT default_event_id();--> statement-breakpoint
ALTER TABLE "gift_claims" ALTER COLUMN "event_id" SET DEFAULT default_event_id();--> statement-breakpoint
ALTER TABLE "gift_items" ALTER COLUMN "event_id" SET DEFAULT default_event_id();--> statement-breakpoint
ALTER TABLE "guestbook_messages" ALTER COLUMN "event_id" SET DEFAULT default_event_id();--> statement-breakpoint
ALTER TABLE "rsvps" ALTER COLUMN "event_id" SET DEFAULT default_event_id();