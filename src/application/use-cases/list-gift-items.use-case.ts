import { GiftCategory } from '@/domain/enums/gift-category';
import type { GiftItem } from '@/domain/entities/gift-item';
import type { GiftRepository } from '@/domain/repositories/gift-repository';

export interface ListGiftItemsResult {
  registryItems: GiftItem[];
  diaperPacks: GiftItem[];
}

export async function listGiftItems(
  giftRepository: GiftRepository,
  eventId: string,
): Promise<ListGiftItemsResult> {
  const items = await giftRepository.listItems(eventId);

  return {
    registryItems: items.filter((item) => item.category === GiftCategory.REGISTRY_ITEM),
    diaperPacks: items.filter((item) => item.category === GiftCategory.DIAPER_PACK),
  };
}
