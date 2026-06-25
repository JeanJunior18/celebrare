import { describe, expect, it } from 'vitest';

import type { GuestbookMessage } from '@/domain/entities/guestbook-message';
import type { GuestbookRepository } from '@/domain/repositories/guestbook-repository';

import { leaveGuestbookMessage } from './leave-guestbook-message.use-case';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

class FakeGuestbookRepository implements GuestbookRepository {
  async create(input: { guestName: string; message: string }): Promise<GuestbookMessage> {
    return { id: 'id', isApproved: true, createdAt: '', ...input };
  }

  async listApproved(): Promise<GuestbookMessage[]> {
    return [];
  }
}

describe('leaveGuestbookMessage', () => {
  it('cria a mensagem quando o input é válido', async () => {
    const repository = new FakeGuestbookRepository();

    const result = await leaveGuestbookMessage(repository, {
      eventId: VALID_UUID,
      guestName: 'Maria',
      message: 'Parabéns, Davi!',
    });

    expect(result.message).toBe('Parabéns, Davi!');
  });

  it('rejeita mensagem com mais de 500 caracteres', async () => {
    const repository = new FakeGuestbookRepository();

    await expect(
      leaveGuestbookMessage(repository, { eventId: VALID_UUID, guestName: 'Maria', message: 'a'.repeat(501) }),
    ).rejects.toThrow();
  });

  it('rejeita mensagem vazia', async () => {
    const repository = new FakeGuestbookRepository();

    await expect(
      leaveGuestbookMessage(repository, { eventId: VALID_UUID, guestName: 'Maria', message: '' }),
    ).rejects.toThrow();
  });
});
