import { desc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { GalleryPhoto } from '@/domain/entities/gallery-photo';
import type { BabyAgeStage } from '@/domain/enums/baby-age-stage';
import type { AdminGalleryRepository } from '@/domain/repositories/admin-gallery-repository';
import type { MediaStorage } from '@/infrastructure/storage/media-storage';
import { imageExtension, uploadImageToMedia } from '@/infrastructure/storage/upload-image';

import { galleryPhotos } from './schema';
import type * as schema from './schema';

function toGalleryPhoto(row: typeof galleryPhotos.$inferSelect): GalleryPhoto {
  return { ...row, ageLabel: row.ageLabel as BabyAgeStage };
}

export class PostgresAdminGalleryRepository implements AdminGalleryRepository {
  constructor(
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly storage: MediaStorage,
  ) {}

  async createPhoto(input: {
    eventId: string;
    ageLabel: BabyAgeStage;
    displayOrder: number;
    image: File;
  }): Promise<GalleryPhoto> {
    const id = crypto.randomUUID();
    const imageUrl = await uploadImageToMedia(
      this.storage,
      `gallery/${id}.${imageExtension(input.image)}`,
      input.image,
    );

    const [photo] = await this.db
      .insert(galleryPhotos)
      .values({
        id,
        eventId: input.eventId,
        ageLabel: input.ageLabel,
        imageUrl,
        displayOrder: input.displayOrder,
      })
      .returning();

    return toGalleryPhoto(photo);
  }

  async getNextDisplayOrder(eventId: string): Promise<number> {
    const [last] = await this.db
      .select({ displayOrder: galleryPhotos.displayOrder })
      .from(galleryPhotos)
      .where(eq(galleryPhotos.eventId, eventId))
      .orderBy(desc(galleryPhotos.displayOrder))
      .limit(1);

    return last ? last.displayOrder + 1 : 0;
  }
}
