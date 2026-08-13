import { z } from 'zod';

import { GiftCategory } from '@/domain/enums/gift-category';
import type { GiftItem } from '@/domain/entities/gift-item';
import type { AdminGiftRepository } from '@/domain/repositories/admin-gift-repository';

const updateGiftItemInputSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(GiftCategory),
  sizeLabel: z.string().optional(),
  quantityNeeded: z.number().int().positive().default(1),
  purchaseUrl: z.string().url().optional(),
  image: z.instanceof(File).optional(),
  imageUrl: z.string().url().optional(),
});

export type UpdateGiftItemInput = z.infer<typeof updateGiftItemInputSchema>;

export async function updateGiftItem(
  repository: AdminGiftRepository,
  input: UpdateGiftItemInput,
): Promise<GiftItem> {
  const parsed = updateGiftItemInputSchema.parse(input);
  return repository.updateItem(parsed);
}
