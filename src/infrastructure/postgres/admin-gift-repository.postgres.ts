import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { GiftItem } from '@/domain/entities/gift-item';
import { GiftCategory } from '@/domain/enums/gift-category';
import { GiftStatus } from '@/domain/enums/gift-status';
import type { AdminGiftRepository } from '@/domain/repositories/admin-gift-repository';
import type { MediaStorage } from '@/infrastructure/storage/media-storage';
import { imageExtension, uploadImageToMedia, uploadRemoteImageToMedia } from '@/infrastructure/storage/upload-image';

import { giftItems } from './schema';
import type * as schema from './schema';

function toGiftItem(row: typeof giftItems.$inferSelect): GiftItem {
  return { ...row, category: row.category as GiftCategory, status: row.status as GiftStatus };
}

export class PostgresAdminGiftRepository implements AdminGiftRepository {
  constructor(
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly storage: MediaStorage,
  ) {}

  async createItem(input: {
    name: string;
    description?: string;
    category: GiftCategory;
    sizeLabel?: string;
    quantityNeeded: number;
    purchaseUrl?: string;
    image?: File;
    imageUrl?: string;
  }): Promise<GiftItem> {
    const id = crypto.randomUUID();
    const imageUrl = input.image
      ? await uploadImageToMedia(this.storage, `gifts/${id}.${imageExtension(input.image)}`, input.image)
      : await uploadRemoteImageToMedia(this.storage, `gifts/${id}`, input.imageUrl!);

    const [item] = await this.db
      .insert(giftItems)
      .values({
        id,
        name: input.name,
        description: input.description ?? null,
        imageUrl,
        category: input.category,
        sizeLabel: input.sizeLabel ?? null,
        quantityNeeded: input.quantityNeeded,
        status: GiftStatus.AVAILABLE,
        purchaseUrl: input.purchaseUrl ?? null,
      })
      .returning();

    return toGiftItem(item);
  }
}
