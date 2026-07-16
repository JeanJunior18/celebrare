import { describe, expect, it } from 'vitest';

import type { GiftItem } from '@/domain/entities/gift-item';
import { GiftCategory } from '@/domain/enums/gift-category';
import { GiftStatus } from '@/domain/enums/gift-status';
import type { AdminGiftRepository } from '@/domain/repositories/admin-gift-repository';

import { createGiftItem } from './create-gift-item.use-case';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

class FakeAdminGiftRepository implements AdminGiftRepository {
  public created: Array<Parameters<AdminGiftRepository['createItem']>[0]> = [];

  async createItem(input: Parameters<AdminGiftRepository['createItem']>[0]): Promise<GiftItem> {
    this.created.push(input);
    return {
      id: 'gift-1',
      name: input.name,
      description: input.description ?? null,
      imageUrl: 'https://example.com/image.jpg',
      category: input.category,
      sizeLabel: input.sizeLabel ?? null,
      quantityNeeded: input.quantityNeeded,
      status: GiftStatus.AVAILABLE,
      createdAt: new Date().toISOString(),
      purchaseUrl: input.purchaseUrl ?? null,
    };
  }
}

function fakeImage(): File {
  return new File(['fake'], 'photo.jpg', { type: 'image/jpeg' });
}

describe('createGiftItem', () => {
  it('cria o item com os valores informados', async () => {
    const repository = new FakeAdminGiftRepository();

    const result = await createGiftItem(repository, {
      eventId: VALID_UUID,
      name: 'Berço portátil',
      category: GiftCategory.REGISTRY_ITEM,
      quantityNeeded: 1,
      image: fakeImage(),
    });

    expect(result.name).toBe('Berço portátil');
    expect(repository.created).toHaveLength(1);
  });

  it('usa quantityNeeded = 1 por padrão quando não informado', async () => {
    const repository = new FakeAdminGiftRepository();

    await createGiftItem(repository, {
      eventId: VALID_UUID,
      name: 'Kit de roupinhas G',
      category: GiftCategory.BULK_ITEM,
      sizeLabel: 'G',
      image: fakeImage(),
    } as Parameters<typeof createGiftItem>[1]);

    expect(repository.created[0].quantityNeeded).toBe(1);
  });

  it('rejeita nome muito curto', async () => {
    const repository = new FakeAdminGiftRepository();

    await expect(
      createGiftItem(repository, {
        eventId: VALID_UUID,
        name: 'A',
        category: GiftCategory.REGISTRY_ITEM,
        quantityNeeded: 1,
        image: fakeImage(),
      }),
    ).rejects.toThrow();
  });

  it('aceita imageUrl no lugar do upload manual', async () => {
    const repository = new FakeAdminGiftRepository();

    await createGiftItem(repository, {
      eventId: VALID_UUID,
      name: 'Berço portátil',
      category: GiftCategory.REGISTRY_ITEM,
      quantityNeeded: 1,
      imageUrl: 'https://example.com/produto.jpg',
    } as Parameters<typeof createGiftItem>[1]);

    expect(repository.created[0].imageUrl).toBe('https://example.com/produto.jpg');
  });

  it('rejeita quando nem image nem imageUrl são informados', async () => {
    const repository = new FakeAdminGiftRepository();

    await expect(
      createGiftItem(repository, {
        eventId: VALID_UUID,
        name: 'Berço portátil',
        category: GiftCategory.REGISTRY_ITEM,
        quantityNeeded: 1,
      } as Parameters<typeof createGiftItem>[1]),
    ).rejects.toThrow();
  });
});
