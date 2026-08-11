import { z } from 'zod';

import type { RsvpRepository } from '@/domain/repositories/rsvp-repository';

const updateRsvpCompanionCountInputSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  companionCount: z.number().int().nonnegative(),
});

export type UpdateRsvpCompanionCountInput = z.infer<typeof updateRsvpCompanionCountInputSchema>;

export async function updateRsvpCompanionCount(
  rsvpRepository: RsvpRepository,
  input: UpdateRsvpCompanionCountInput,
): Promise<void> {
  const parsed = updateRsvpCompanionCountInputSchema.parse(input);
  await rsvpRepository.updateCompanionCount(parsed.id, parsed.eventId, parsed.companionCount);
}
