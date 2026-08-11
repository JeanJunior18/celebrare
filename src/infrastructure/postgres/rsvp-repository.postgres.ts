import { and, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { Rsvp } from '@/domain/entities/rsvp';
import type { RsvpRepository, RsvpUpsertResult } from '@/domain/repositories/rsvp-repository';

import { rsvps } from './schema';
import type * as schema from './schema';

type UpsertRsvpRow = Record<string, unknown> & {
  status: 'CREATED' | 'UPDATED' | 'ALREADY_EXISTS';
  guest_name: string;
  companion_count: number;
};

export class PostgresRsvpRepository implements RsvpRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async upsert(input: {
    eventId: string;
    guestName: string;
    companionCount: number;
    whatsappNumber: string;
    confirmUpdate: boolean;
  }): Promise<RsvpUpsertResult> {
    const { rows } = await this.db.execute<UpsertRsvpRow>(sql`
      select * from upsert_rsvp(${input.eventId}, ${input.guestName}, ${input.companionCount}, ${input.whatsappNumber}, ${input.confirmUpdate})
    `);
    const row = rows[0];

    if (row.status === 'ALREADY_EXISTS') {
      return {
        status: 'ALREADY_EXISTS',
        guestName: row.guest_name,
        companionCount: row.companion_count,
      };
    }

    return { status: row.status };
  }

  async listAll(eventId: string): Promise<Rsvp[]> {
    return this.db.select().from(rsvps).where(eq(rsvps.eventId, eventId));
  }

  async delete(id: string, eventId: string): Promise<void> {
    await this.db.delete(rsvps).where(and(eq(rsvps.id, id), eq(rsvps.eventId, eventId)));
  }

  async updateCompanionCount(id: string, eventId: string, companionCount: number): Promise<void> {
    await this.db
      .update(rsvps)
      .set({ companionCount })
      .where(and(eq(rsvps.id, id), eq(rsvps.eventId, eventId)));
  }
}
