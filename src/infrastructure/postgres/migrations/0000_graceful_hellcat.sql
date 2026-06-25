CREATE TYPE "public"."baby_age_stage" AS ENUM('NEWBORN', 'THREE_MONTHS', 'SIX_MONTHS', 'NINE_MONTHS', 'ONE_YEAR');--> statement-breakpoint
CREATE TYPE "public"."gift_category" AS ENUM('REGISTRY_ITEM', 'DIAPER_PACK');--> statement-breakpoint
CREATE TYPE "public"."gift_status" AS ENUM('AVAILABLE', 'CLAIMED', 'FULFILLED');--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"age_label" "baby_age_stage" NOT NULL,
	"image_url" text NOT NULL,
	"display_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_item_id" uuid NOT NULL,
	"guest_name" text NOT NULL,
	"guest_whatsapp" text,
	"quantity_claimed" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quantity_claimed_positive" CHECK ("gift_claims"."quantity_claimed" > 0)
);
--> statement-breakpoint
CREATE TABLE "gift_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"category" "gift_category" NOT NULL,
	"size_label" text,
	"quantity_needed" integer DEFAULT 1 NOT NULL,
	"status" "gift_status" DEFAULT 'AVAILABLE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"purchase_url" text,
	"external_id" text,
	CONSTRAINT "gift_items_external_id_unique" UNIQUE("external_id"),
	CONSTRAINT "quantity_needed_positive" CHECK ("gift_items"."quantity_needed" > 0)
);
--> statement-breakpoint
CREATE TABLE "guestbook_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_name" text NOT NULL,
	"message" text NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_max_length" CHECK (char_length("guestbook_messages"."message") <= 500)
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_name" text NOT NULL,
	"companion_count" integer DEFAULT 0 NOT NULL,
	"whatsapp_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rsvps_whatsapp_number_unique" UNIQUE("whatsapp_number"),
	CONSTRAINT "companion_count_non_negative" CHECK ("rsvps"."companion_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "gift_claims" ADD CONSTRAINT "gift_claims_gift_item_id_gift_items_id_fk" FOREIGN KEY ("gift_item_id") REFERENCES "public"."gift_items"("id") ON DELETE cascade ON UPDATE no action;