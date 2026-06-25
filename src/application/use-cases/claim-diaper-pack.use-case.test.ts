import { describe, expect, it } from 'vitest';

import type { GiftClaim } from '@/domain/entities/gift-claim';
import type { GiftItem } from '@/domain/entities/gift-item';
import type {
  ClaimRegistryItemResult,
  GiftRepository,
} from '@/domain/repositories/gift-repository';

import { claimDiaperPack } from './claim-diaper-pack.use-case';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

class FakeGiftRepository implements GiftRepository {
  public claimed: Array<{ giftItemId: string; guestName: string; quantity: number }> = [];

  async listItems(): Promise<GiftItem[]> {
    return [];
  }

  async claimRegistryItem(): Promise<ClaimRegistryItemResult> {
    throw new Error('not implemented');
  }

  async claimDiaperPack(input: {
    giftItemId: string;
    guestName: string;
    quantity: number;
  }): Promise<GiftClaim> {
    this.claimed.push(input);
    return {
      id: 'claim-id',
      giftItemId: input.giftItemId,
      guestName: input.guestName,
      guestWhatsapp: null,
      quantityClaimed: input.quantity,
      createdAt: '',
    };
  }
}

describe('claimDiaperPack', () => {
  it('permite overshoot — não há teto de quantidade', async () => {
    const repository = new FakeGiftRepository();

    const result = await claimDiaperPack(repository, {
      eventId: VALID_UUID,
      giftItemId: VALID_UUID,
      guestName: 'Maria',
      quantity: 9999,
    });

    expect(result.quantityClaimed).toBe(9999);
  });

  it('rejeita quantity zero ou negativa', async () => {
    const repository = new FakeGiftRepository();

    await expect(
      claimDiaperPack(repository, { eventId: VALID_UUID, giftItemId: VALID_UUID, guestName: 'Maria', quantity: 0 }),
    ).rejects.toThrow();
  });
});
