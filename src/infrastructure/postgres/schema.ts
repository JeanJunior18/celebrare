import { boolean, check, date, integer, jsonb, pgEnum, pgTable, text, time, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const createdAtColumn = () =>
  timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow();

export const giftCategoryEnum = pgEnum('gift_category', ['REGISTRY_ITEM', 'DIAPER_PACK']);
export const giftStatusEnum = pgEnum('gift_status', ['AVAILABLE', 'CLAIMED', 'FULFILLED']);
export const babyAgeStageEnum = pgEnum('baby_age_stage', [
  'NEWBORN',
  'THREE_MONTHS',
  'SIX_MONTHS',
  'NINE_MONTHS',
  'ONE_YEAR',
]);

export const rsvps = pgTable('rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().default(sql`default_event_id()`).references(() => events.id),
  guestName: text('guest_name').notNull(),
  companionCount: integer('companion_count').notNull().default(0),
  whatsappNumber: text('whatsapp_number').notNull().unique(),
  createdAt: createdAtColumn(),
}, (table) => [check('companion_count_non_negative', sql`${table.companionCount} >= 0`)]);

export const giftItems = pgTable('gift_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().default(sql`default_event_id()`).references(() => events.id),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  category: giftCategoryEnum('category').notNull(),
  sizeLabel: text('size_label'),
  quantityNeeded: integer('quantity_needed').notNull().default(1),
  status: giftStatusEnum('status').notNull().default('AVAILABLE'),
  createdAt: createdAtColumn(),
  purchaseUrl: text('purchase_url'),
  externalId: text('external_id').unique(),
}, (table) => [check('quantity_needed_positive', sql`${table.quantityNeeded} > 0`)]);

export const giftClaims = pgTable('gift_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().default(sql`default_event_id()`).references(() => events.id),
  giftItemId: uuid('gift_item_id').notNull().references(() => giftItems.id, { onDelete: 'cascade' }),
  guestName: text('guest_name').notNull(),
  guestWhatsapp: text('guest_whatsapp'),
  quantityClaimed: integer('quantity_claimed').notNull().default(1),
  createdAt: createdAtColumn(),
}, (table) => [check('quantity_claimed_positive', sql`${table.quantityClaimed} > 0`)]);

export const guestbookMessages = pgTable('guestbook_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().default(sql`default_event_id()`).references(() => events.id),
  guestName: text('guest_name').notNull(),
  message: text('message').notNull(),
  isApproved: boolean('is_approved').notNull().default(true),
  createdAt: createdAtColumn(),
}, (table) => [check('message_max_length', sql`char_length(${table.message}) <= 500`)]);

export const galleryPhotos = pgTable('gallery_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().default(sql`default_event_id()`).references(() => events.id),
  ageLabel: babyAgeStageEnum('age_label').notNull(),
  imageUrl: text('image_url').notNull(),
  displayOrder: integer('display_order').notNull(),
});

// Tema é dado, não enum — permite adicionar um 3º tema sem deploy de
// código (docs/saas-platform-plan.md, fase 3). Ainda não consumida pelo
// app: passa a ser lida quando `events.theme_id` existir (fase 4).
export const themes = pgTable('themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  colorTokens: jsonb('color_tokens').notNull(),
  defaultCopy: jsonb('default_copy').notNull(),
  defaultIllustrationUrl: text('default_illustration_url'),
  createdAt: createdAtColumn(),
});

// Tenant raiz (docs/saas-platform-plan.md, fase 4). `owner_user_id` entra na
// fase 5, junto da tabela `users` (Auth.js) — sem isso ainda não há
// conceito de host pra ser dono do evento.
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  themeId: uuid('theme_id').notNull().references(() => themes.id),
  slug: text('slug').notNull().unique(),
  honoreeName: text('honoree_name').notNull(),
  subtitleLabel: text('subtitle_label').notNull(),
  eventDate: date('event_date').notNull(),
  eventTime: time('event_time').notNull(),
  venueName: text('venue_name').notNull(),
  venueAddress: text('venue_address').notNull(),
  googleMapsUrl: text('google_maps_url'),
  quoteText: text('quote_text'),
  quoteReference: text('quote_reference'),
  pixKey: text('pix_key'),
  pixQrCodeUrl: text('pix_qr_code_url'),
  createdAt: createdAtColumn(),
});
