import { z } from 'zod';

import type { GuestbookMessage } from '@/domain/entities/guestbook-message';
import type { GuestbookRepository } from '@/domain/repositories/guestbook-repository';

const leaveGuestbookMessageInputSchema = z.object({
  eventId: z.string().uuid(),
  guestName: z.string().min(2),
  message: z.string().min(1).max(500),
});

export type LeaveGuestbookMessageInput = z.infer<typeof leaveGuestbookMessageInputSchema>;

export async function leaveGuestbookMessage(
  guestbookRepository: GuestbookRepository,
  input: LeaveGuestbookMessageInput,
): Promise<GuestbookMessage> {
  const parsed = leaveGuestbookMessageInputSchema.parse(input);
  return guestbookRepository.create(parsed);
}
