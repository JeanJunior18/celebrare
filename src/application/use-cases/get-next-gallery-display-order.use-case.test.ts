import { describe, expect, it } from 'vitest';

import type { GalleryPhoto } from '@/domain/entities/gallery-photo';
import type { AdminGalleryRepository } from '@/domain/repositories/admin-gallery-repository';

import { getNextGalleryDisplayOrder } from './get-next-gallery-display-order.use-case';

class FakeAdminGalleryRepository implements AdminGalleryRepository {
  constructor(private readonly nextDisplayOrder: number) {}

  async createPhoto(
    input: Parameters<AdminGalleryRepository['createPhoto']>[0],
  ): Promise<GalleryPhoto> {
    return {
      id: 'photo-1',
      ageLabel: input.ageLabel,
      imageUrl: 'https://example.com/photo.jpg',
      displayOrder: input.displayOrder,
    };
  }

  async getNextDisplayOrder(): Promise<number> {
    return this.nextDisplayOrder;
  }
}

describe('getNextGalleryDisplayOrder', () => {
  it('repassa o próximo display_order do repositório', async () => {
    const repository = new FakeAdminGalleryRepository(3);

    const result = await getNextGalleryDisplayOrder(repository, 'event-1');

    expect(result).toBe(3);
  });

  it('funciona quando a galeria está vazia', async () => {
    const repository = new FakeAdminGalleryRepository(0);

    const result = await getNextGalleryDisplayOrder(repository, 'event-1');

    expect(result).toBe(0);
  });
});
