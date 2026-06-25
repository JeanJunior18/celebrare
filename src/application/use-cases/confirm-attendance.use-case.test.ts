import { describe, expect, it } from 'vitest';

import type { Rsvp } from '@/domain/entities/rsvp';
import type { RsvpRepository, RsvpUpsertResult } from '@/domain/repositories/rsvp-repository';

import { confirmAttendance } from './confirm-attendance.use-case';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

class FakeRsvpRepository implements RsvpRepository {
  public upserted: Array<{
    guestName: string;
    companionCount: number;
    whatsappNumber: string;
    confirmUpdate: boolean;
  }> = [];

  constructor(private readonly result: RsvpUpsertResult = { status: 'CREATED' }) {}

  async upsert(input: {
    guestName: string;
    companionCount: number;
    whatsappNumber: string;
    confirmUpdate: boolean;
  }): Promise<RsvpUpsertResult> {
    this.upserted.push(input);
    return this.result;
  }

  async listAll(): Promise<Rsvp[]> {
    return [];
  }
}

describe('confirmAttendance', () => {
  it('cria o rsvp quando o input é válido', async () => {
    const repository = new FakeRsvpRepository({ status: 'CREATED' });

    const result = await confirmAttendance(repository, {
      eventId: VALID_UUID,
      guestName: 'Maria',
      companionCount: 2,
      whatsappNumber: '(11) 91234-5678',
      confirmUpdate: false,
    });

    expect(result).toEqual({ status: 'CREATED' });
    expect(repository.upserted).toHaveLength(1);
  });

  it('normaliza o whatsapp pra só dígitos, com ou sem formatação', async () => {
    const repository = new FakeRsvpRepository({ status: 'CREATED' });

    await confirmAttendance(repository, {
      eventId: VALID_UUID,
      guestName: 'Maria',
      companionCount: 0,
      whatsappNumber: '(86) 99916-7437',
      confirmUpdate: false,
    });
    await confirmAttendance(repository, {
      eventId: VALID_UUID,
      guestName: 'Maria',
      companionCount: 0,
      whatsappNumber: '86999167437',
      confirmUpdate: false,
    });

    expect(repository.upserted[0].whatsappNumber).toBe('86999167437');
    expect(repository.upserted[1].whatsappNumber).toBe('86999167437');
  });

  it('repassa ALREADY_EXISTS com o registro existente sem transformação', async () => {
    const repository = new FakeRsvpRepository({
      status: 'ALREADY_EXISTS',
      guestName: 'Maria',
      companionCount: 1,
    });

    const result = await confirmAttendance(repository, {
      eventId: VALID_UUID,
      guestName: 'Maria',
      companionCount: 3,
      whatsappNumber: '(11) 91234-5678',
      confirmUpdate: false,
    });

    expect(result).toEqual({ status: 'ALREADY_EXISTS', guestName: 'Maria', companionCount: 1 });
  });

  it('rejeita whatsapp com menos de 10 dígitos', async () => {
    const repository = new FakeRsvpRepository();

    await expect(
      confirmAttendance(repository, {
        eventId: VALID_UUID,
        guestName: 'Maria',
        companionCount: 0,
        whatsappNumber: '123',
        confirmUpdate: false,
      }),
    ).rejects.toThrow();
  });

  it('rejeita guestName com menos de 2 caracteres', async () => {
    const repository = new FakeRsvpRepository();

    await expect(
      confirmAttendance(repository, {
        eventId: VALID_UUID,
        guestName: 'M',
        companionCount: 0,
        whatsappNumber: '(11) 91234-5678',
        confirmUpdate: false,
      }),
    ).rejects.toThrow();
  });
});
