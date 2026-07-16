import { z } from 'zod';

import type { GiftClaim } from '@/domain/entities/gift-claim';
import type { GiftRepository } from '@/domain/repositories/gift-repository';

const claimBulkItemInputSchema = z.object({
  eventId: z.string().uuid(),
  giftItemId: z.string().uuid(),
  guestName: z.string().min(2),
  guestWhatsapp: z.string().optional(),
  quantity: z.number().int().positive(),
});

export type ClaimBulkItemInput = z.infer<typeof claimBulkItemInputSchema>;

export async function claimBulkItem(
  giftRepository: GiftRepository,
  input: ClaimBulkItemInput,
): Promise<GiftClaim> {
  const parsed = claimBulkItemInputSchema.parse(input);
  return giftRepository.claimBulkItem(parsed);
}
