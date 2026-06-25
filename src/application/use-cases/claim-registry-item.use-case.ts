import { z } from 'zod';

import type {
  ClaimRegistryItemResult,
  GiftRepository,
} from '@/domain/repositories/gift-repository';

const claimRegistryItemInputSchema = z.object({
  eventId: z.string().uuid(),
  giftItemId: z.string().uuid(),
  guestName: z.string().min(2),
  guestWhatsapp: z.string().optional(),
});

export type ClaimRegistryItemInput = z.infer<typeof claimRegistryItemInputSchema>;

export async function claimRegistryItem(
  giftRepository: GiftRepository,
  input: ClaimRegistryItemInput,
): Promise<ClaimRegistryItemResult> {
  const parsed = claimRegistryItemInputSchema.parse(input);
  return giftRepository.claimRegistryItem(parsed);
}
