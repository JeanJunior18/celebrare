import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { GuestbookMessage } from '@/domain/entities/guestbook-message';
import type { GuestbookRepository } from '@/domain/repositories/guestbook-repository';

import { guestbookMessages } from './schema';
import type * as schema from './schema';

export class PostgresGuestbookRepository implements GuestbookRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async create(input: { eventId: string; guestName: string; message: string }): Promise<GuestbookMessage> {
    const [message] = await this.db
      .insert(guestbookMessages)
      .values({ eventId: input.eventId, guestName: input.guestName, message: input.message })
      .returning();

    return message;
  }

  async listApproved(eventId: string): Promise<GuestbookMessage[]> {
    return this.db
      .select()
      .from(guestbookMessages)
      .where(and(eq(guestbookMessages.eventId, eventId), eq(guestbookMessages.isApproved, true)));
  }
}
