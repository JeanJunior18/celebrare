import {
  boolean, check, date, integer, jsonb, pgEnum, pgTable, primaryKey, text, time, timestamp, unique, uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const createdAtColumn = () =>
  timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow();

export const giftCategoryEnum = pgEnum('gift_category', ['REGISTRY_ITEM', 'BULK_ITEM']);
export const giftStatusEnum = pgEnum('gift_status', ['AVAILABLE', 'CLAIMED', 'FULFILLED']);

export const rsvps = pgTable('rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  guestName: text('guest_name').notNull(),
  companionCount: integer('companion_count').notNull().default(0),
  // Único por evento, não globalmente — a mesma pessoa pode confirmar
  // presença em dois eventos diferentes (fase 7).
  whatsappNumber: text('whatsapp_number').notNull(),
  createdAt: createdAtColumn(),
}, (table) => [
  check('companion_count_non_negative', sql`${table.companionCount} >= 0`),
  unique().on(table.eventId, table.whatsappNumber),
]);

export const giftItems = pgTable('gift_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
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
  eventId: uuid('event_id').notNull().references(() => events.id),
  giftItemId: uuid('gift_item_id').notNull().references(() => giftItems.id, { onDelete: 'cascade' }),
  guestName: text('guest_name').notNull(),
  guestWhatsapp: text('guest_whatsapp'),
  quantityClaimed: integer('quantity_claimed').notNull().default(1),
  createdAt: createdAtColumn(),
}, (table) => [check('quantity_claimed_positive', sql`${table.quantityClaimed} > 0`)]);

export const guestbookMessages = pgTable('guestbook_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  guestName: text('guest_name').notNull(),
  message: text('message').notNull(),
  isApproved: boolean('is_approved').notNull().default(true),
  createdAt: createdAtColumn(),
}, (table) => [check('message_max_length', sql`char_length(${table.message}) <= 500`)]);

export const galleryPhotos = pgTable('gallery_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  description: text('description').notNull(),
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

// Tenant raiz (docs/saas-platform-plan.md, fase 4).
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Nullable de propósito: o evento do Davi foi criado direto pelo dev, sem
  // passar por signup — não dá pra inventar uma conta/senha fake só pra
  // preencher essa coluna. Fica null pra eventos "legados"/sem host
  // cadastrado; passa a ser preenchida organicamente pelos novos eventos
  // criados via signup (fase 7).
  ownerUserId: uuid('owner_user_id').references(() => users.id),
  themeId: uuid('theme_id').notNull().references(() => themes.id),
  slug: text('slug').notNull().unique(),
  honoreeName: text('honoree_name').notNull(),
  subtitleLabel: text('subtitle_label'),
  eventDate: date('event_date').notNull(),
  eventTime: time('event_time').notNull(),
  venueName: text('venue_name').notNull(),
  venueAddress: text('venue_address').notNull(),
  // Foto real do hero (não a ilustração genérica do tema) — ex.: a foto do
  // Davi em /hero-davi.jpg. Nullable: sem foto, a seção usa
  // theme.defaultIllustrationUrl como fallback.
  heroImageUrl: text('hero_image_url'),
  googleMapsUrl: text('google_maps_url'),
  quoteText: text('quote_text'),
  quoteReference: text('quote_reference'),
  pixKey: text('pix_key'),
  pixQrCodeUrl: text('pix_qr_code_url'),
  // Quais blocos da página pública o host escolheu mostrar (hero nunca
  // entra aqui — não pode ser omitido). Ver domain/entities/event.ts.
  sectionVisibility: jsonb('section_visibility').notNull().default({
    rsvp: true,
    giftRegistry: true,
    location: true,
    gallery: true,
    guestbook: true,
  }),
  // Override por evento de um subconjunto restrito de theme.defaultCopy —
  // o resto do copy do tema continua compartilhado por todos os eventos
  // daquele tema (ver domain/entities/event.ts, resolveEventCopy).
  copyOverrides: jsonb('copy_overrides').notNull().default({}),
  createdAt: createdAtColumn(),
});

// Tabelas de autenticação de host (docs/saas-platform-plan.md, fase 5).
// Formato compatível com o adapter Drizzle do Auth.js (`@auth/drizzle-adapter`)
// — únicas mudanças em relação ao default da lib: PKs `uuid` (em vez de
// `text`) pra consistência com o resto do schema, e `passwordHash`/`createdAt`
// extras em `users` pro login por credenciais (email/senha), já que o
// Auth.js não guarda senha — isso é responsabilidade nossa.
export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash').notNull(),
  createdAt: createdAtColumn(),
});

// Sem uso ainda (só Credentials provider, sem OAuth) — schema pronto pro
// adapter sem precisar de migration extra quando um provider OAuth entrar.
export const accounts = pgTable('account', {
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]);

// Sem uso ainda — Credentials provider usa sessão JWT (sem estado no banco).
// Fica pronta pro caso de algum provider futuro precisar de sessão de banco.
export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Sem uso ainda — pra fluxo de verificação de email / magic link, não
// implementado nessa fase (login é só email/senha).
export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => [primaryKey({ columns: [table.identifier, table.token] })]);
