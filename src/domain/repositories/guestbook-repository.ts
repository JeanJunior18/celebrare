import type { GuestbookMessage } from '@/domain/entities/guestbook-message';

export interface GuestbookRepository {
  create(input: { eventId: string; guestName: string; message: string }): Promise<GuestbookMessage>;
  listApproved(eventId: string): Promise<GuestbookMessage[]>;
}
