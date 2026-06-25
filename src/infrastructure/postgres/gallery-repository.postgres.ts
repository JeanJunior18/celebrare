import { asc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { GalleryPhoto } from '@/domain/entities/gallery-photo';
import type { BabyAgeStage } from '@/domain/enums/baby-age-stage';
import type { GalleryRepository } from '@/domain/repositories/gallery-repository';

import { galleryPhotos } from './schema';
import type * as schema from './schema';

function toGalleryPhoto(row: typeof galleryPhotos.$inferSelect): GalleryPhoto {
  return { ...row, ageLabel: row.ageLabel as BabyAgeStage };
}

export class PostgresGalleryRepository implements GalleryRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async listOrdered(): Promise<GalleryPhoto[]> {
    const rows = await this.db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.displayOrder));
    return rows.map(toGalleryPhoto);
  }
}
