import { z } from 'zod';

import type { GiftClaim } from '@/domain/entities/gift-claim';
import type { GiftRepository } from '@/domain/repositories/gift-repository';

const claimDiaperPackInputSchema = z.object({
  eventId: z.string().uuid(),
  giftItemId: z.string().uuid(),
  guestName: z.string().min(2),
  guestWhatsapp: z.string().optional(),
  quantity: z.number().int().positive(),
});

export type ClaimDiaperPackInput = z.infer<typeof claimDiaperPackInputSchema>;

export async function claimDiaperPack(
  giftRepository: GiftRepository,
  input: ClaimDiaperPackInput,
): Promise<GiftClaim> {
  const parsed = claimDiaperPackInputSchema.parse(input);
  return giftRepository.claimDiaperPack(parsed);
}
