ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_whatsapp_number_unique";--> statement-breakpoint
ALTER TABLE "gallery_photos" ALTER COLUMN "event_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gift_claims" ALTER COLUMN "event_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gift_items" ALTER COLUMN "event_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "guestbook_messages" ALTER COLUMN "event_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rsvps" ALTER COLUMN "event_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_event_id_whatsapp_number_unique" UNIQUE("event_id","whatsapp_number");