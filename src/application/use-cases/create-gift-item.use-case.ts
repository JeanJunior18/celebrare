import { z } from 'zod';

import { GiftCategory } from '@/domain/enums/gift-category';
import type { GiftItem } from '@/domain/entities/gift-item';
import type { AdminGiftRepository } from '@/domain/repositories/admin-gift-repository';

const createGiftItemInputSchema = z
  .object({
    eventId: z.string().uuid(),
    name: z.string().min(2),
    description: z.string().optional(),
    category: z.enum(GiftCategory),
    sizeLabel: z.string().optional(),
    quantityNeeded: z.number().int().positive().default(1),
    purchaseUrl: z.string().url().optional(),
    image: z.instanceof(File).optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine((data) => Boolean(data.image) || Boolean(data.imageUrl), {
    message: 'Escolha uma imagem ou busque uma pelo link do presente.',
    path: ['image'],
  });

export type CreateGiftItemInput = z.infer<typeof createGiftItemInputSchema>;

export async function createGiftItem(
  repository: AdminGiftRepository,
  input: CreateGiftItemInput,
): Promise<GiftItem> {
  const parsed = createGiftItemInputSchema.parse(input);
  return repository.createItem(parsed);
}
