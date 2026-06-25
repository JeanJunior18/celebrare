import type { Event } from '@/domain/entities/event';

export interface CreateEventInput {
  ownerUserId: string;
  themeId: string;
  slug: string;
  honoreeName: string;
  subtitleLabel: string;
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

export type UpdateEventInput = Partial<Omit<CreateEventInput, 'ownerUserId'>>;

export interface EventRepository {
  findBySlug(slug: string): Promise<Event | null>;
  findByOwnerUserId(ownerUserId: string): Promise<Event | null>;
  create(input: CreateEventInput): Promise<Event>;
  update(eventId: string, input: UpdateEventInput): Promise<Event>;
}
