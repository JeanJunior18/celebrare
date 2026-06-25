import { describe, expect, it } from 'vitest';

import type { GalleryPhoto } from '@/domain/entities/gallery-photo';
import { BabyAgeStage } from '@/domain/enums/baby-age-stage';
import type { AdminGalleryRepository } from '@/domain/repositories/admin-gallery-repository';

import { createGalleryPhoto } from './create-gallery-photo.use-case';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

class FakeAdminGalleryRepository implements AdminGalleryRepository {
  public created: Array<Parameters<AdminGalleryRepository['createPhoto']>[0]> = [];

  async createPhoto(
    input: Parameters<AdminGalleryRepository['createPhoto']>[0],
  ): Promise<GalleryPhoto> {
    this.created.push(input);
    return {
      id: 'photo-1',
      ageLabel: input.ageLabel,
      imageUrl: 'https://example.com/photo.jpg',
      displayOrder: input.displayOrder,
    };
  }

  async getNextDisplayOrder(): Promise<number> {
    return this.created.length;
  }
}

function fakeImage(): File {
  return new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
}

describe('createGalleryPhoto', () => {
  it('cria a foto com os valores informados', async () => {
    const repository = new FakeAdminGalleryRepository();

    const result = await createGalleryPhoto(repository, {
      eventId: VALID_UUID,
      ageLabel: BabyAgeStage.SIX_MONTHS,
      displayOrder: 2,
      image: fakeImage(),
    });

    expect(result.ageLabel).toBe(BabyAgeStage.SIX_MONTHS);
    expect(repository.created).toHaveLength(1);
  });

  it('rejeita displayOrder negativo', async () => {
    const repository = new FakeAdminGalleryRepository();

    await expect(
      createGalleryPhoto(repository, {
        eventId: VALID_UUID,
        ageLabel: BabyAgeStage.NEWBORN,
        displayOrder: -1,
        image: fakeImage(),
      }),
    ).rejects.toThrow();
  });
});
