import { z } from 'zod';

import type { AdminGiftRepository } from '@/domain/repositories/admin-gift-repository';

const deleteGiftItemInputSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
});

export type DeleteGiftItemInput = z.infer<typeof deleteGiftItemInputSchema>;

export async function deleteGiftItem(repository: AdminGiftRepository, input: DeleteGiftItemInput): Promise<void> {
  const parsed = deleteGiftItemInputSchema.parse(input);
  await repository.deleteItem(parsed.id, parsed.eventId);
}
