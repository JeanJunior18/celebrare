import { eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { GiftClaim } from '@/domain/entities/gift-claim';
import type { GiftItem } from '@/domain/entities/gift-item';
import { GiftCategory } from '@/domain/enums/gift-category';
import { GiftStatus } from '@/domain/enums/gift-status';
import type { ClaimRegistryItemResult, GiftRepository } from '@/domain/repositories/gift-repository';

import { giftClaims, giftItems } from './schema';
import type * as schema from './schema';

type ClaimGiftItemRow = Record<string, unknown> & {
  id: string;
  gift_item_id: string;
  guest_name: string;
  guest_whatsapp: string | null;
  quantity_claimed: number;
  created_at: string;
};

function toGiftItem(row: typeof giftItems.$inferSelect): GiftItem {
  return { ...row, category: row.category as GiftCategory, status: row.status as GiftStatus };
}

export class PostgresGiftRepository implements GiftRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async listItems(eventId: string): Promise<GiftItem[]> {
    const rows = await this.db.select().from(giftItems).where(eq(giftItems.eventId, eventId));
    return rows.map(toGiftItem);
  }

  async claimRegistryItem(input: {
    eventId: string;
    giftItemId: string;
    guestName: string;
    guestWhatsapp?: string;
  }): Promise<ClaimRegistryItemResult> {
    try {
      const { rows } = await this.db.execute<ClaimGiftItemRow>(sql`
        select * from claim_gift_item(${input.eventId}, ${input.giftItemId}, ${input.guestName}, ${input.guestWhatsapp ?? null})
      `);
      const row = rows[0];

      return {
        success: true,
        claim: {
          id: row.id,
          giftItemId: row.gift_item_id,
          guestName: row.guest_name,
          guestWhatsapp: row.guest_whatsapp,
          quantityClaimed: row.quantity_claimed,
          createdAt: row.created_at,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('ALREADY_CLAIMED')) {
        return { success: false, reason: 'ALREADY_CLAIMED' };
      }
      throw error;
    }
  }

  async claimBulkItem(input: {
    eventId: string;
    giftItemId: string;
    guestName: string;
    guestWhatsapp?: string;
    quantity: number;
  }): Promise<GiftClaim> {
    const [claim] = await this.db
      .insert(giftClaims)
      .values({
        eventId: input.eventId,
        giftItemId: input.giftItemId,
        guestName: input.guestName,
        guestWhatsapp: input.guestWhatsapp ?? null,
        quantityClaimed: input.quantity,
      })
      .returning();

    return claim;
  }
}
