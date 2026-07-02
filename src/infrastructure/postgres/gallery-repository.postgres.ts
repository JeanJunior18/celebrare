import { asc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { GalleryPhoto } from '@/domain/entities/gallery-photo';
import type { GalleryRepository } from '@/domain/repositories/gallery-repository';

import { galleryPhotos } from './schema';
import type * as schema from './schema';

function toGalleryPhoto(row: typeof galleryPhotos.$inferSelect): GalleryPhoto {
  return row;
}

export class PostgresGalleryRepository implements GalleryRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async listOrdered(eventId: string): Promise<GalleryPhoto[]> {
    const rows = await this.db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.eventId, eventId))
      .orderBy(asc(galleryPhotos.displayOrder));
    return rows.map(toGalleryPhoto);
  }
}
