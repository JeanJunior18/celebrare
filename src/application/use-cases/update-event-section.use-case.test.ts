import { describe, expect, it } from 'vitest';

import type { Event } from '@/domain/entities/event';
import type { EventRepository, UpdateEventInput } from '@/domain/repositories/event-repository';

import { updateEventSection } from './update-event-section.use-case';

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
  public updated: { eventId: string; input: UpdateEventInput }[] = [];

  async findBySlug(): Promise<Event | null> {
    return null;
  }

  async findByOwnerUserId(): Promise<Event | null> {
    return null;
  }

  async listAll(): Promise<Event[]> {
    return [];
  }

  async create(): Promise<Event> {
    throw new Error('not implemented');
  }

  async update(eventId: string, input: UpdateEventInput): Promise<Event> {
    this.updated.push({ eventId, input });
    return buildEvent({ id: eventId, ...input });
  }

  async updateHero(): Promise<Event> {
    throw new Error('not implemented');
  }
}

describe('updateEventSection', () => {
  it('descarta campo de copy fora do allowlist da seção', async () => {
    const repository = new FakeEventRepository();
    const event = buildEvent();

    await updateEventSection(repository, event, {
      section: 'gallery',
      visible: true,
      copy: { title: 'Nossos momentos', subtitle: 'não deveria entrar' },
    });

    expect(repository.updated[0].input.copyOverrides).toEqual({ gallery: { title: 'Nossos momentos' } });
  });

  it('faz merge sem apagar overrides de outras seções', async () => {
    const repository = new FakeEventRepository();
    const event = buildEvent({ copyOverrides: { rsvp: { subtitle: 'Já confirmado' } } });

    await updateEventSection(repository, event, {
      section: 'gallery',
      visible: true,
      copy: { title: 'Nossos momentos' },
    });

    expect(repository.updated[0].input.copyOverrides).toEqual({
      rsvp: { subtitle: 'Já confirmado' },
      gallery: { title: 'Nossos momentos' },
    });
  });

  it('troca a visibilidade só da seção informada', async () => {
    const repository = new FakeEventRepository();
    const event = buildEvent({
      sectionVisibility: { rsvp: true, giftRegistry: true, location: true, gallery: true, guestbook: true },
    });

    await updateEventSection(repository, event, { section: 'gallery', visible: false, copy: {} });

    expect(repository.updated[0].input.sectionVisibility).toEqual({
      rsvp: true,
      giftRegistry: true,
      location: true,
      gallery: false,
      guestbook: true,
    });
  });

  it('ignora campo de copy em branco (mantém "seguindo o tema")', async () => {
    const repository = new FakeEventRepository();
    const event = buildEvent();

    await updateEventSection(repository, event, {
      section: 'guestbook',
      visible: true,
      copy: { subtitle: '   ' },
    });

    expect(repository.updated[0].input.copyOverrides).toEqual({ guestbook: {} });
  });
});
