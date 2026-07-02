import { describe, expect, it } from 'vitest';

import type { GiftClaim } from '@/domain/entities/gift-claim';
import type { GiftItem } from '@/domain/entities/gift-item';
import type {
  ClaimRegistryItemResult,
  GiftRepository,
} from '@/domain/repositories/gift-repository';

import { claimRegistryItem } from './claim-registry-item.use-case';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

class FakeGiftRepository implements GiftRepository {
  constructor(private readonly result: ClaimRegistryItemResult) {}

  async listItems(): Promise<GiftItem[]> {
    return [];
  }

  async claimRegistryItem(): Promise<ClaimRegistryItemResult> {
    return this.result;
  }

  async claimBulkItem(): Promise<GiftClaim> {
    throw new Error('not implemented');
  }
}

describe('claimRegistryItem', () => {
  it('repassa o resultado de sucesso sem transformação', async () => {
    const claim: GiftClaim = {
      id: 'claim-id',
      giftItemId: VALID_UUID,
      guestName: 'Maria',
      guestWhatsapp: null,
      quantityClaimed: 1,
      createdAt: '',
    };
    const repository = new FakeGiftRepository({ success: true, claim });

    const result = await claimRegistryItem(repository, {
      eventId: VALID_UUID,
      giftItemId: VALID_UUID,
      guestName: 'Maria',
    });

    expect(result).toEqual({ success: true, claim });
  });

  it('repassa o resultado ALREADY_CLAIMED sem lançar', async () => {
    const repository = new FakeGiftRepository({ success: false, reason: 'ALREADY_CLAIMED' });

    const result = await claimRegistryItem(repository, {
      eventId: VALID_UUID,
      giftItemId: VALID_UUID,
      guestName: 'Maria',
    });

    expect(result).toEqual({ success: false, reason: 'ALREADY_CLAIMED' });
  });

  it('rejeita giftItemId que não é uuid', async () => {
    const repository = new FakeGiftRepository({ success: false, reason: 'ALREADY_CLAIMED' });

    await expect(
      claimRegistryItem(repository, { eventId: VALID_UUID, giftItemId: 'not-a-uuid', guestName: 'Maria' }),
    ).rejects.toThrow();
  });
});
