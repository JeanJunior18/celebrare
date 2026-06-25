import { describe, expect, it } from 'vitest';

import type { GalleryPhoto } from '@/domain/entities/gallery-photo';
import { BabyAgeStage } from '@/domain/enums/baby-age-stage';
import type { GalleryRepository } from '@/domain/repositories/gallery-repository';

import { listGalleryPhotos } from './list-gallery-photos.use-case';

class FakeGalleryRepository implements GalleryRepository {
  constructor(private readonly photos: GalleryPhoto[]) {}

  async listOrdered(): Promise<GalleryPhoto[]> {
    return this.photos;
  }
}

describe('listGalleryPhotos', () => {
  it('repassa as fotos do repositório', async () => {
    const photos: GalleryPhoto[] = [
      { id: '1', ageLabel: BabyAgeStage.NEWBORN, imageUrl: 'x', displayOrder: 0 },
    ];
    const repository = new FakeGalleryRepository(photos);

    const result = await listGalleryPhotos(repository, 'event-1');

    expect(result).toEqual(photos);
  });
});
