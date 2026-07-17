import type { Event, EventCopyOverrides, SectionVisibility } from '@/domain/entities/event';

export interface CreateEventInput {
  ownerUserId: string;
  themeId: string;
  slug: string;
  honoreeName: string;
  subtitleLabel?: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  heroImageUrl?: string;
  googleMapsUrl?: string;
  quoteText?: string;
  quoteReference?: string;
  pixKey?: string;
  pixQrCodeUrl?: string;
}

export type UpdateEventInput = Partial<Omit<CreateEventInput, 'ownerUserId'>> & {
  sectionVisibility?: SectionVisibility;
  copyOverrides?: EventCopyOverrides;
};

export interface UpdateEventHeroInput {
  image?: File;
  imageUrl?: string;
  heroIntro?: string;
  subtitleLabel?: string;
}

export interface EventRepository {
  findBySlug(slug: string): Promise<Event | null>;
  findByOwnerUserId(ownerUserId: string): Promise<Event | null>;
  // só deve ser chamado pela visão de operador da plataforma (`/internal/events`).
  listAll(): Promise<Event[]>;
  create(input: CreateEventInput): Promise<Event>;
  update(eventId: string, input: UpdateEventInput): Promise<Event>;
  updateHero(eventId: string, input: UpdateEventHeroInput): Promise<Event>;
}
