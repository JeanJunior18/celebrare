import { describe, expect, it } from 'vitest';

import type { GiftItem } from '@/domain/entities/gift-item';
import { GiftCategory } from '@/domain/enums/gift-category';
import { GiftStatus } from '@/domain/enums/gift-status';
import type {
  ClaimRegistryItemResult,
  GiftRepository,
} from '@/domain/repositories/gift-repository';
import type { GiftClaim } from '@/domain/entities/gift-claim';

import { listGiftItems } from './list-gift-items.use-case';

class FakeGiftRepository implements GiftRepository {
  constructor(private readonly items: GiftItem[]) {}

  async listItems(): Promise<GiftItem[]> {
    return this.items;
  }

  async claimRegistryItem(): Promise<ClaimRegistryItemResult> {
    throw new Error('not implemented');
  }

  async claimDiaperPack(): Promise<GiftClaim> {
    throw new Error('not implemented');
  }
}

function buildGiftItem(overrides: Partial<GiftItem>): GiftItem {
  return {
    id: 'id',
    name: 'name',
    description: null,
    imageUrl: null,
    category: GiftCategory.REGISTRY_ITEM,
    sizeLabel: null,
    purchaseUrl: null,
    quantityNeeded: 1,
    status: GiftStatus.AVAILABLE,
    createdAt: '',
    ...overrides,
  };
}

describe('listGiftItems', () => {
  it('agrupa itens por category', async () => {
    const repository = new FakeGiftRepository([
      buildGiftItem({ id: '1', category: GiftCategory.REGISTRY_ITEM }),
      buildGiftItem({ id: '2', category: GiftCategory.DIAPER_PACK }),
      buildGiftItem({ id: '3', category: GiftCategory.REGISTRY_ITEM }),
    ]);

    const result = await listGiftItems(repository, 'event-1');

    expect(result.registryItems.map((item) => item.id)).toEqual(['1', '3']);
    expect(result.diaperPacks.map((item) => item.id)).toEqual(['2']);
  });
});
