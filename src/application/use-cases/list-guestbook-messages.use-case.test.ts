import { describe, expect, it } from 'vitest';

import type { GuestbookMessage } from '@/domain/entities/guestbook-message';
import type { GuestbookRepository } from '@/domain/repositories/guestbook-repository';

import { listGuestbookMessages } from './list-guestbook-messages.use-case';

class FakeGuestbookRepository implements GuestbookRepository {
  constructor(private readonly messages: GuestbookMessage[]) {}

  async create(): Promise<GuestbookMessage> {
    throw new Error('not implemented');
  }

  async listApproved(): Promise<GuestbookMessage[]> {
    return this.messages;
  }
}

describe('listGuestbookMessages', () => {
  it('repassa as mensagens aprovadas do repositório', async () => {
    const messages: GuestbookMessage[] = [
      { id: '1', guestName: 'Maria', message: 'oi', isApproved: true, createdAt: '' },
    ];
    const repository = new FakeGuestbookRepository(messages);

    const result = await listGuestbookMessages(repository, 'event-1');

    expect(result).toEqual(messages);
  });
});
