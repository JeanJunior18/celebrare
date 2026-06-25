import { eq, type SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { Event } from '@/domain/entities/event';
import type { CreateEventInput, EventRepository, UpdateEventInput } from '@/domain/repositories/event-repository';

import { toTheme } from './theme-repository.postgres';
import { events, themes } from './schema';
import type * as schema from './schema';

function toEvent(row: typeof events.$inferSelect, themeRow: typeof themes.$inferSelect): Event {
  return {
    id: row.id,
    ownerUserId: row.ownerUserId,
    slug: row.slug,
    honoreeName: row.honoreeName,
    subtitleLabel: row.subtitleLabel,
    eventDate: row.eventDate,
    eventTime: row.eventTime,
    venueName: row.venueName,
    venueAddress: row.venueAddress,
    heroImageUrl: row.heroImageUrl,
    googleMapsUrl: row.googleMapsUrl,
    quoteText: row.quoteText,
    quoteReference: row.quoteReference,
    pixKey: row.pixKey,
    pixQrCodeUrl: row.pixQrCodeUrl,
    theme: toTheme(themeRow),
  };
}

export class PostgresEventRepository implements EventRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  private async findOneWhere(condition: SQL): Promise<Event | null> {
    const [row] = await this.db
      .select({ event: events, theme: themes })
      .from(events)
      .innerJoin(themes, eq(events.themeId, themes.id))
      .where(condition);

    return row ? toEvent(row.event, row.theme) : null;
  }

  async findBySlug(slug: string): Promise<Event | null> {
    return this.findOneWhere(eq(events.slug, slug));
  }

  async findByOwnerUserId(ownerUserId: string): Promise<Event | null> {
    return this.findOneWhere(eq(events.ownerUserId, ownerUserId));
  }

  async create(input: CreateEventInput): Promise<Event> {
    const [row] = await this.db
      .insert(events)
      .values({
        ownerUserId: input.ownerUserId,
        themeId: input.themeId,
        slug: input.slug,
        honoreeName: input.honoreeName,
        subtitleLabel: input.subtitleLabel,
        eventDate: input.eventDate,
        eventTime: input.eventTime,
        venueName: input.venueName,
        venueAddress: input.venueAddress,
        heroImageUrl: input.heroImageUrl ?? null,
        googleMapsUrl: input.googleMapsUrl ?? null,
        quoteText: input.quoteText ?? null,
        quoteReference: input.quoteReference ?? null,
        pixKey: input.pixKey ?? null,
        pixQrCodeUrl: input.pixQrCodeUrl ?? null,
      })
      .returning();

    const event = await this.findBySlug(row.slug);
    if (!event) throw new Error('Falha ao carregar o evento recém-criado.');
    return event;
  }

  async update(eventId: string, input: UpdateEventInput): Promise<Event> {
    await this.db
      .update(events)
      .set(input)
      .where(eq(events.id, eventId));

    const [row] = await this.db.select().from(events).where(eq(events.id, eventId));
    const event = await this.findBySlug(row.slug);
    if (!event) throw new Error('Falha ao carregar o evento atualizado.');
    return event;
  }
}
