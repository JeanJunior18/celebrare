import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { GuestbookMessage } from '@/domain/entities/guestbook-message';
import type { GuestbookRepository } from '@/domain/repositories/guestbook-repository';

import { guestbookMessages } from './schema';
import type * as schema from './schema';

export class PostgresGuestbookRepository implements GuestbookRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async create(input: { guestName: string; message: string }): Promise<GuestbookMessage> {
    const [message] = await this.db
      .insert(guestbookMessages)
      .values({ guestName: input.guestName, message: input.message })
      .returning();

    return message;
  }

  async listApproved(): Promise<GuestbookMessage[]> {
    return this.db.select().from(guestbookMessages).where(eq(guestbookMessages.isApproved, true));
  }
}
