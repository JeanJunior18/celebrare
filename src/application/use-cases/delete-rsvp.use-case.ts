import { z } from 'zod';

import type { RsvpRepository } from '@/domain/repositories/rsvp-repository';

const deleteRsvpInputSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
});

export type DeleteRsvpInput = z.infer<typeof deleteRsvpInputSchema>;

export async function deleteRsvp(rsvpRepository: RsvpRepository, input: DeleteRsvpInput): Promise<void> {
  const parsed = deleteRsvpInputSchema.parse(input);
  await rsvpRepository.delete(parsed.id, parsed.eventId);
}
