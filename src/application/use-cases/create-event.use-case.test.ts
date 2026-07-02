import { describe, expect, it } from 'vitest';

import type { Event } from '@/domain/entities/event';
import type { CreateEventInput, EventRepository } from '@/domain/repositories/event-repository';
import type { Theme } from '@/domain/entities/theme';
import type { ThemeRepository, CreateThemeInput, UpdateThemeInput } from '@/domain/repositories/theme-repository';

import { createEvent } from './create-event.use-case';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-1',
    ownerUserId: VALID_UUID,
    slug: 'ana-pedro',
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

function buildTheme(overrides: Partial<Theme> = {}): Theme {
  return {
    id: VALID_UUID,
    slug: 'WEDDING',
    name: 'Casamento',
    colorTokens: {} as Theme['colorTokens'],
    defaultCopy: {} as Theme['defaultCopy'],
    defaultIllustrationUrl: null,
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

class FakeThemeRepository implements ThemeRepository {
  constructor(private readonly theme: Theme | null = buildTheme()) {}

  async listAll(): Promise<Theme[]> {
    return this.theme ? [this.theme] : [];
  }

  async findById(): Promise<Theme | null> {
    return this.theme;
  }

  async create(input: CreateThemeInput): Promise<Theme> {
    return buildTheme(input);
  }

  async update(_themeId: string, input: UpdateThemeInput): Promise<Theme> {
    return buildTheme(input);
  }
}

const validInput: CreateEventInput = {
  ownerUserId: VALID_UUID,
  themeId: VALID_UUID,
  honoreeName: 'Ana & Pedro',
  subtitleLabel: 'Casamento',
  eventDate: '2026-12-12',
  eventTime: '18:00',
  venueName: 'Espaço Jardim',
  venueAddress: 'Rua das Flores, 100',
};

describe('createEvent', () => {
  it('gera o slug a partir do honoreeName, sem acento e em minúsculo', async () => {
    const eventRepository = new FakeEventRepository();
    const themeRepository = new FakeThemeRepository();

    const event = await createEvent(eventRepository, themeRepository, validInput);

    expect(event.slug).toBe('ana-pedro');
    expect(eventRepository.created).toHaveLength(1);
  });

  it('usa o nome do tema como desambiguador quando o slug base já existe', async () => {
    const eventRepository = new FakeEventRepository(['ana-pedro']);
    const themeRepository = new FakeThemeRepository();

    const event = await createEvent(eventRepository, themeRepository, validInput);

    expect(event.slug).toBe('ana-pedro-casamento');
  });

  it('incrementa um número quando até o slug com o tema já existe', async () => {
    const eventRepository = new FakeEventRepository(['ana-pedro', 'ana-pedro-casamento', 'ana-pedro-casamento-2']);
    const themeRepository = new FakeThemeRepository();

    const event = await createEvent(eventRepository, themeRepository, validInput);

    expect(event.slug).toBe('ana-pedro-casamento-3');
  });

  it('rejeita quando o tema não existe', async () => {
    const eventRepository = new FakeEventRepository();
    const themeRepository = new FakeThemeRepository(null);

    await expect(createEvent(eventRepository, themeRepository, validInput)).rejects.toThrow();
  });
});
