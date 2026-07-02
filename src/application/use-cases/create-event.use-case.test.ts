import { describe, expect, it } from 'vitest';

import type { Event } from '@/domain/entities/event';
import type { CreateEventInput, EventRepository } from '@/domain/repositories/event-repository';

import { createEvent } from './create-event.use-case';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-1',
    ownerUserId: VALID_UUID,
    slug: 'ana-e-pedro',
    honoreeName: 'Ana & Pedro',
    subtitleLabel: 'Casamento',
    eventDate: '2026-12-12',
    eventTime: '18:00:00',
    venueName: 'Espaço Jardim',
    venueAddress: 'Rua das Flores, 100',
    heroImageUrl: null,
    googleMapsUrl: null,
    quoteText: null,
    quoteReference: null,
    pixKey: null,
    pixQrCodeUrl: null,
    sectionVisibility: { rsvp: true, giftRegistry: true, location: true, gallery: true, guestbook: true },
    copyOverrides: {},
    theme: {
      id: VALID_UUID,
      slug: 'WEDDING',
      name: 'Casamento',
      colorTokens: {} as Event['theme']['colorTokens'],
      defaultCopy: {} as Event['theme']['defaultCopy'],
      defaultIllustrationUrl: null,
    },
    ...overrides,
  };
}

class FakeEventRepository implements EventRepository {
  constructor(private readonly existingSlugs: string[] = []) {}

  public created: CreateEventInput[] = [];

  async findBySlug(slug: string): Promise<Event | null> {
    return this.existingSlugs.includes(slug) ? buildEvent({ slug }) : null;
  }

  async findByOwnerUserId(): Promise<Event | null> {
    return null;
  }

  async listAll(): Promise<Event[]> {
    return [];
  }

  async create(input: CreateEventInput): Promise<Event> {
    this.created.push(input);
    return buildEvent({ slug: input.slug, honoreeName: input.honoreeName });
  }

  async update(): Promise<Event> {
    throw new Error('not implemented');
  }

  async updateHero(): Promise<Event> {
    throw new Error('not implemented');
  }
}

const validInput: CreateEventInput = {
  ownerUserId: VALID_UUID,
  themeId: VALID_UUID,
  slug: 'ana-e-pedro',
  honoreeName: 'Ana & Pedro',
  subtitleLabel: 'Casamento',
  eventDate: '2026-12-12',
  eventTime: '18:00',
  venueName: 'Espaço Jardim',
  venueAddress: 'Rua das Flores, 100',
};

describe('createEvent', () => {
  it('cria o evento quando o slug está livre', async () => {
    const repository = new FakeEventRepository();

    const result = await createEvent(repository, validInput);

    expect(result).toEqual({ success: true, event: expect.objectContaining({ slug: 'ana-e-pedro' }) });
    expect(repository.created).toHaveLength(1);
  });

  it('rejeita slug já em uso sem lançar', async () => {
    const repository = new FakeEventRepository(['ana-e-pedro']);

    const result = await createEvent(repository, validInput);

    expect(result).toEqual({ success: false, reason: 'SLUG_TAKEN' });
    expect(repository.created).toHaveLength(0);
  });

  it('rejeita slug com caracteres inválidos', async () => {
    const repository = new FakeEventRepository();

    await expect(createEvent(repository, { ...validInput, slug: 'Ana & Pedro!' })).rejects.toThrow();
  });
});
