import { describe, expect, it } from 'vitest';

import type { Rsvp } from '@/domain/entities/rsvp';
import type { RsvpRepository, RsvpUpsertResult } from '@/domain/repositories/rsvp-repository';

import { listRsvps } from './list-rsvps.use-case';

class FakeRsvpRepository implements RsvpRepository {
  constructor(private readonly rsvps: Rsvp[]) {}

  async upsert(): Promise<RsvpUpsertResult> {
    throw new Error('not implemented');
  }

  async listAll(): Promise<Rsvp[]> {
    return this.rsvps;
  }
}

describe('listRsvps', () => {
  it('soma convidados + acompanhantes em totalConfirmed', async () => {
    const repository = new FakeRsvpRepository([
      { id: '1', guestName: 'Maria', companionCount: 2, whatsappNumber: '', createdAt: '' },
      { id: '2', guestName: 'João', companionCount: 0, whatsappNumber: '', createdAt: '' },
    ]);

    const result = await listRsvps(repository, 'event-1');

    expect(result.rsvps).toHaveLength(2);
    expect(result.totalConfirmed).toBe(4);
  });

  it('retorna totalConfirmed zero quando não há rsvps', async () => {
    const repository = new FakeRsvpRepository([]);

    const result = await listRsvps(repository, 'event-1');

    expect(result.totalConfirmed).toBe(0);
  });
});
