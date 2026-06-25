import type { GiftClaim } from '@/domain/entities/gift-claim';
import type { GiftItem } from '@/domain/entities/gift-item';

export type ClaimRegistryItemResult =
  | { success: true; claim: GiftClaim }
  | { success: false; reason: 'ALREADY_CLAIMED' };

export interface GiftRepository {
  listItems(eventId: string): Promise<GiftItem[]>;
  claimRegistryItem(input: {
    eventId: string;
    giftItemId: string;
    guestName: string;
    guestWhatsapp?: string;
  }): Promise<ClaimRegistryItemResult>;
  claimDiaperPack(input: {
    eventId: string;
    giftItemId: string;
    guestName: string;
    guestWhatsapp?: string;
    quantity: number;
  }): Promise<GiftClaim>;
}
