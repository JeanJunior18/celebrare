import type { GuestbookMessage } from '@/domain/entities/guestbook-message';
import type { GuestbookRepository } from '@/domain/repositories/guestbook-repository';

export async function listGuestbookMessages(
  guestbookRepository: GuestbookRepository,
  eventId: string,
): Promise<GuestbookMessage[]> {
  return guestbookRepository.listApproved(eventId);
}
