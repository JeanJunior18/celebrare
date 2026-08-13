import type { GiftItem } from '@/domain/entities/gift-item';
import type { GiftCategory } from '@/domain/enums/gift-category';

export interface AdminGiftRepository {
  createItem(input: {
    eventId: string;
    name: string;
    description?: string;
    category: GiftCategory;
    sizeLabel?: string;
    quantityNeeded: number;
    purchaseUrl?: string;
    image?: File;
    imageUrl?: string;
  }): Promise<GiftItem>;
  updateItem(input: {
    id: string;
    eventId: string;
    name: string;
    description?: string;
    category: GiftCategory;
    sizeLabel?: string;
    quantityNeeded: number;
    purchaseUrl?: string;
    image?: File;
    imageUrl?: string;
  }): Promise<GiftItem>;
  deleteItem(id: string, eventId: string): Promise<void>;
}
