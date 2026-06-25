import { boolean, check, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
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
  guestName: text('guest_name').notNull(),
  companionCount: integer('companion_count').notNull().default(0),
  whatsappNumber: text('whatsapp_number').notNull().unique(),
  createdAt: createdAtColumn(),
}, (table) => [check('companion_count_non_negative', sql`${table.companionCount} >= 0`)]);

export const giftItems = pgTable('gift_items', {
  id: uuid('id').primaryKey().defaultRandom(),
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
  giftItemId: uuid('gift_item_id').notNull().references(() => giftItems.id, { onDelete: 'cascade' }),
  guestName: text('guest_name').notNull(),
  guestWhatsapp: text('guest_whatsapp'),
  quantityClaimed: integer('quantity_claimed').notNull().default(1),
  createdAt: createdAtColumn(),
}, (table) => [check('quantity_claimed_positive', sql`${table.quantityClaimed} > 0`)]);

export const guestbookMessages = pgTable('guestbook_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestName: text('guest_name').notNull(),
  message: text('message').notNull(),
  isApproved: boolean('is_approved').notNull().default(true),
  createdAt: createdAtColumn(),
}, (table) => [check('message_max_length', sql`char_length(${table.message}) <= 500`)]);

export const galleryPhotos = pgTable('gallery_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
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
